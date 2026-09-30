from django.db import models

from core.models import BaseMixin, UUIDModel
from core.validators import phone_validator


class City(UUIDModel, BaseMixin):
    """Справочник городов (в ana-partners — CityRef)."""

    name = models.CharField("Название", max_length=100, unique=True)

    class Meta:
        verbose_name = "Город"
        verbose_name_plural = "Города"
        ordering = ("name",)

    def __str__(self):
        return self.name


class Organization(UUIDModel, BaseMixin):
    name = models.CharField("Название организации", max_length=100)
    phone = models.CharField(
        "Номер телефона", max_length=20, blank=True, validators=[phone_validator]
    )
    email = models.EmailField("Электронная почта", blank=True)
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="organizations",
        verbose_name="Город",
    )
    address = models.CharField("Адрес", max_length=255, blank=True)
    avatar = models.ImageField("Логотип", upload_to="organization_photos/", blank=True)
    description = models.TextField("Описание", blank=True)
    working_days = models.CharField("Рабочие дни", max_length=255, blank=True)
    timezone = models.CharField("Часовой пояс", max_length=64, default="Asia/Almaty")
    currency = models.CharField("Валюта", max_length=3, default="KZT")

    class Meta:
        verbose_name = "Организация"
        verbose_name_plural = "Организации"
        ordering = ("name",)

    def __str__(self):
        return self.name


class Branch(UUIDModel, BaseMixin):
    """Филиал организации. В ana-partners филиалов нет — это наша модель."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="branches",
        verbose_name="Организация",
    )
    name = models.CharField("Название", max_length=100)
    address = models.CharField("Адрес", max_length=255, blank=True)
    phone = models.CharField(
        "Номер телефона", max_length=20, blank=True, validators=[phone_validator]
    )
    timezone = models.CharField("Часовой пояс", max_length=64, default="Asia/Almaty")
    is_active = models.BooleanField("Работает", default=True)

    class Meta:
        verbose_name = "Филиал"
        verbose_name_plural = "Филиалы"
        ordering = ("organization__name", "name")

    def __str__(self):
        return f"{self.organization} — {self.name}"
