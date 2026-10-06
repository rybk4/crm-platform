from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import UUIDModel
from core.validators import phone_validator


class User(UUIDModel, AbstractUser):
    """Аккаунт для входа в CRM: владелец, администратор или сотрудник организации."""

    class Gender(models.TextChoices):
        MALE = "male", "Мужской"
        FEMALE = "female", "Женский"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="users",
        verbose_name="Организация",
    )
    patronymic = models.CharField("Отчество", max_length=50, blank=True)
    phone = models.CharField(
        "Номер телефона", max_length=20, blank=True, validators=[phone_validator]
    )
    birth_date = models.DateField("Дата рождения", blank=True, null=True)
    gender = models.CharField("Пол", max_length=10, choices=Gender.choices, blank=True)
    locale = models.CharField("Язык интерфейса", max_length=2, default="ru")
    active_branch = models.ForeignKey(
        "organizations.Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_users",
        verbose_name="Активный филиал",
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        return self.get_full_name() or self.username
