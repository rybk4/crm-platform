from django.core.exceptions import ValidationError
from django.db import models

from core.models import BaseMixin, RowStatus, UUIDModel
from staff.models import Staff


class DailySchedule(UUIDModel, BaseMixin):
    """
    График сотрудника на конкретную дату (как в ana-partners).

    Фронт заполняет его календарём и быстрыми пресетами («2/2», «5/2», «весь
    месяц 10–19»), поэтому хранится не недельный шаблон, а каждый день отдельно.
    Рабочие часы — в DailyWorkingInterval; интервалов может быть несколько
    (например, до и после перерыва).
    """

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="daily_schedules",
        verbose_name="Сотрудник",
    )
    date = models.DateField("Дата")
    is_working = models.BooleanField("Рабочий день", default=True)

    class Meta:
        verbose_name = "День графика"
        verbose_name_plural = "График по дням"
        ordering = ("staff", "date")
        constraints = [
            # В ana этого ограничения нет — на одну дату можно было завести два дня.
            models.UniqueConstraint(
                fields=("staff", "date"),
                condition=~models.Q(row_status=RowStatus.DELETED),
                name="daily_schedule_unique_staff_date",
            ),
        ]

    def __str__(self):
        return f"{self.staff} — {self.date} ({'рабочий' if self.is_working else 'выходной'})"

    @staticmethod
    def validate_intervals(intervals, is_working=True):
        """
        Проверяет набор интервалов одного дня целиком: пригодится API, которое
        сохраняет день вместе с интервалами. intervals — пары (start, end).
        """
        if not is_working and intervals:
            raise ValidationError("У выходного дня не может быть рабочих интервалов.")

        ordered = sorted(intervals)
        for start, end in ordered:
            if end <= start:
                raise ValidationError("Конец интервала должен быть позже начала.")
        for (_, previous_end), (next_start, _) in zip(ordered, ordered[1:]):
            if next_start < previous_end:
                raise ValidationError("Интервалы одного дня не должны пересекаться.")


class DailyWorkingInterval(UUIDModel, BaseMixin):
    """
    Рабочий интервал внутри дня. Удаление настоящее: при смене графика
    интервалы дня заменяются целиком, хранить старые смысла нет.
    """

    daily_schedule = models.ForeignKey(
        DailySchedule,
        on_delete=models.CASCADE,
        related_name="working_intervals",
        verbose_name="День графика",
    )
    start_time = models.TimeField("Начало работы")
    end_time = models.TimeField("Конец работы")

    objects = models.Manager()
    all_objects = models.Manager()

    class Meta:
        verbose_name = "Рабочий интервал"
        verbose_name_plural = "Рабочие интервалы"
        ordering = ("daily_schedule", "start_time")
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_time__gt=models.F("start_time")),
                name="working_interval_end_after_start",
            ),
        ]

    def __str__(self):
        return f"{self.start_time:%H:%M}–{self.end_time:%H:%M}"

    def delete(self, using=None, keep_parents=False):
        return self.hard_delete()

    def clean(self):
        super().clean()
        if self.start_time is None or self.end_time is None or not self.daily_schedule_id:
            return
        siblings = self.daily_schedule.working_intervals.exclude(pk=self.pk)
        DailySchedule.validate_intervals(
            [(item.start_time, item.end_time) for item in siblings]
            + [(self.start_time, self.end_time)],
            is_working=self.daily_schedule.is_working,
        )
