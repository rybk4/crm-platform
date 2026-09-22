from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    ordering = ("username",)
    list_display = ("username", "phone_number", "name", "locale", "is_staff", "is_active", "date_joined")
    search_fields = ("username", "phone_number", "name")

    fieldsets = (
        (None, {"fields": ("username", "password", "phone_number", "name", "locale")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "phone_number", "password1", "password2", "is_staff"),
            },
        ),
    )
