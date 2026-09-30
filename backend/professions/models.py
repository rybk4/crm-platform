from django.db import models

from core.models import BaseMixin, UUIDModel


class Profession(UUIDModel, BaseMixin):
    """
    Общий справочник профессий на всю систему.

    Ведём его мы (админка, миграции), салоны только выбирают. Своё название
    должности салон пишет в Staff.title — так справочник не зарастает дублями
    вида «Мастер маникюра» / «Маникюрщица».
    """

    name = models.CharField("Название", max_length=100, unique=True)
    code = models.SlugField("Код", max_length=50, unique=True)
    position = models.PositiveSmallIntegerField("Порядок в списке", default=0)

    class Meta:
        verbose_name = "Профессия"
        verbose_name_plural = "Профессии"
        ordering = ("position", "name")

    def __str__(self):
        return self.name
