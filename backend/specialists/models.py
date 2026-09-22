from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from organizations.models import Branch


optional_phone_validator = RegexValidator(
    regex=r"^$|^\+[1-9]\d{7,14}$",
    message=_("Введите номер в международном формате, например +77001234567."),
)


class Specialist(models.Model):
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="specialists",
        verbose_name=_("Филиал"),
    )
    first_name = models.CharField(_("Имя"), max_length=100)
    last_name = models.CharField(_("Фамилия"), max_length=100)
    middle_name = models.CharField(_("Отчество"), max_length=100, blank=True)
    job_title = models.CharField(_("Должность"), max_length=120, blank=True)
    phone_number = models.CharField(
        _("Телефон"), max_length=16, blank=True, validators=[optional_phone_validator]
    )
    photo_url = models.URLField(_("Ссылка на фото"), blank=True)
    bio = models.TextField(_("О специалисте"), blank=True)
    is_active = models.BooleanField(_("Активен"), default=True)
    created_at = models.DateTimeField(_("Создан"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Изменён"), auto_now=True)

    class Meta:
        verbose_name = _("Специалист")
        verbose_name_plural = _("Специалисты")
        ordering = ("last_name", "first_name")

    @property
    def full_name(self):
        return " ".join(filter(None, (self.last_name, self.first_name, self.middle_name)))

    def __str__(self):
        return self.full_name


class SpecialistCertificate(models.Model):
    specialist = models.ForeignKey(
        Specialist,
        on_delete=models.CASCADE,
        related_name="certificates",
        verbose_name=_("Специалист"),
    )
    title = models.CharField(_("Название"), max_length=180)
    image_url = models.URLField(_("Ссылка на изображение"))
    issued_at = models.DateField(_("Дата выдачи"), blank=True, null=True)
    position = models.PositiveSmallIntegerField(_("Позиция"), default=0)

    class Meta:
        verbose_name = _("Сертификат")
        verbose_name_plural = _("Сертификаты")
        ordering = ("position", "id")

    def __str__(self):
        return self.title


class WorkSchedule(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, _("Понедельник")
        TUESDAY = 1, _("Вторник")
        WEDNESDAY = 2, _("Среда")
        THURSDAY = 3, _("Четверг")
        FRIDAY = 4, _("Пятница")
        SATURDAY = 5, _("Суббота")
        SUNDAY = 6, _("Воскресенье")

    specialist = models.ForeignKey(
        Specialist,
        on_delete=models.CASCADE,
        related_name="schedule",
        verbose_name=_("Специалист"),
    )
    weekday = models.PositiveSmallIntegerField(_("День недели"), choices=Weekday.choices)
    is_day_off = models.BooleanField(_("Выходной"), default=False)
    start_time = models.TimeField(_("Начало"), blank=True, null=True)
    end_time = models.TimeField(_("Окончание"), blank=True, null=True)
    break_start = models.TimeField(_("Начало перерыва"), blank=True, null=True)
    break_end = models.TimeField(_("Окончание перерыва"), blank=True, null=True)

    class Meta:
        verbose_name = _("Рабочий день")
        verbose_name_plural = _("График работы")
        ordering = ("weekday",)
        constraints = [
            models.UniqueConstraint(
                fields=("specialist", "weekday"),
                name="unique_specialist_weekday",
            )
        ]

    def clean(self):
        if self.is_day_off:
            return
        if not self.start_time or not self.end_time:
            raise ValidationError(_("Для рабочего дня укажите начало и окончание."))
        if self.start_time >= self.end_time:
            raise ValidationError(_("Окончание рабочего дня должно быть позже начала."))
        if bool(self.break_start) != bool(self.break_end):
            raise ValidationError(_("Укажите обе границы перерыва."))
        if self.break_start and not (
            self.start_time <= self.break_start < self.break_end <= self.end_time
        ):
            raise ValidationError(_("Перерыв должен находиться внутри рабочего дня."))

    def __str__(self):
        return f"{self.specialist}: {self.get_weekday_display()}"
