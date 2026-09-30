from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "last_name", "first_name", "phone", "organization", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "organization")
    search_fields = ("username", "first_name", "last_name", "phone", "email")
    fieldsets = (
        *BaseUserAdmin.fieldsets,
        (
            "Профиль CRM",
            {"fields": ("organization", "patronymic", "phone", "birth_date", "gender")},
        ),
    )
