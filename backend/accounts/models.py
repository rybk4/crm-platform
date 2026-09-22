from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


phone_validator = RegexValidator(
    regex=r"^\+[1-9]\d{7,14}$",
    message=_("Введите номер в международном формате, например +77001234567."),
)


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError(_("Логин обязателен."))

        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.full_clean()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Для суперпользователя is_staff должен быть равен True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Для суперпользователя is_superuser должен быть равен True."))

        return self.create_user(username, password, **extra_fields)

    def get_or_create_for_phone(self, phone_number):
        username = f"phone_{phone_number.lstrip('+')}"
        user, created = self.get_or_create(
            phone_number=phone_number,
            defaults={"username": username},
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])
        return user, created


class User(AbstractBaseUser, PermissionsMixin):
    class Locale(models.TextChoices):
        RUSSIAN = "ru", "Русский"
        ENGLISH = "en", "English"
        KAZAKH = "kk", "Қазақша"

    username = models.CharField(max_length=150, unique=True)
    phone_number = models.CharField(
        max_length=16,
        unique=True,
        blank=True,
        null=True,
        validators=[phone_validator],
    )
    name = models.CharField(max_length=150, blank=True)
    locale = models.CharField(max_length=2, choices=Locale.choices, default=Locale.RUSSIAN)
    active_branch = models.ForeignKey(
        "organizations.Branch",
        on_delete=models.SET_NULL,
        related_name="active_users",
        blank=True,
        null=True,
        verbose_name=_("Активный филиал"),
    )
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username
