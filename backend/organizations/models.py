from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Organization(models.Model):
    name = models.CharField(_("Название"), max_length=180)
    slug = models.SlugField(_("Код"), max_length=180, unique=True)
    phone = models.CharField(_("Телефон"), max_length=32, blank=True)
    timezone = models.CharField(_("Часовой пояс"), max_length=64, default="Asia/Almaty")
    currency = models.CharField(_("Валюта"), max_length=3, default="KZT")
    is_active = models.BooleanField(_("Активна"), default=True)
    created_at = models.DateTimeField(_("Создана"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Изменена"), auto_now=True)

    class Meta:
        verbose_name = _("Организация")
        verbose_name_plural = _("Организации")
        ordering = ("name",)

    def __str__(self):
        return self.name


class OrganizationMember(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner", _("Владелец")
        ADMIN = "admin", _("Администратор")
        MANAGER = "manager", _("Менеджер")

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="memberships",
        verbose_name=_("Организация"),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
        verbose_name=_("Пользователь"),
    )
    role = models.CharField(_("Роль"), max_length=16, choices=Role.choices, default=Role.MANAGER)
    is_active = models.BooleanField(_("Активно"), default=True)
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)

    class Meta:
        verbose_name = _("Участник организации")
        verbose_name_plural = _("Участники организаций")
        constraints = [
            models.UniqueConstraint(
                fields=("organization", "user"),
                name="unique_organization_member",
            )
        ]

    def __str__(self):
        return f"{self.user} — {self.organization}"


class Branch(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="branches",
        verbose_name=_("Организация"),
    )
    name = models.CharField(_("Название"), max_length=180)
    address = models.CharField(_("Адрес"), max_length=255)
    phone = models.CharField(_("Телефон"), max_length=32, blank=True)
    timezone = models.CharField(_("Часовой пояс"), max_length=64, default="Asia/Almaty")
    is_active = models.BooleanField(_("Активен"), default=True)
    created_at = models.DateTimeField(_("Создан"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Изменён"), auto_now=True)

    class Meta:
        verbose_name = _("Филиал")
        verbose_name_plural = _("Филиалы")
        ordering = ("organization__name", "name")
        constraints = [
            models.UniqueConstraint(
                fields=("organization", "name"),
                name="unique_branch_name_per_organization",
            )
        ]

    def __str__(self):
        return f"{self.organization}: {self.name}"


def accessible_organizations(user):
    queryset = Organization.objects.all()
    if user.is_superuser:
        return queryset
    return queryset.filter(memberships__user=user, memberships__is_active=True).distinct()
