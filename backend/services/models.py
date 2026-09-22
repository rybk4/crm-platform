from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from specialists.models import Specialist


class Service(models.Model):
    specialist = models.ForeignKey(
        Specialist,
        on_delete=models.CASCADE,
        related_name="services",
        verbose_name=_("Специалист"),
    )
    name = models.CharField(_("Название"), max_length=180)
    description = models.TextField(_("Описание"), blank=True)
    duration_minutes = models.PositiveIntegerField(
        _("Длительность, минуты"), validators=[MinValueValidator(5)]
    )
    price = models.DecimalField(
        _("Цена"), max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    currency = models.CharField(_("Валюта"), max_length=3, default="KZT")
    is_active = models.BooleanField(_("Активна"), default=True)
    created_at = models.DateTimeField(_("Создана"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Изменена"), auto_now=True)

    class Meta:
        verbose_name = _("Услуга специалиста")
        verbose_name_plural = _("Услуги специалистов")
        ordering = ("name", "specialist__last_name")
        constraints = [
            models.UniqueConstraint(
                fields=("specialist", "name"),
                name="unique_service_name_per_specialist",
            )
        ]

    def __str__(self):
        return f"{self.name} — {self.specialist}"
