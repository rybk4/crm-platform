from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


class PhoneSerializer(serializers.Serializer):
    phone_number = serializers.RegexField(
        regex=r"^\+[1-9]\d{7,14}$",
        max_length=16,
        error_messages={
            "blank": _("Введите номер телефона."),
            "invalid": _("Введите номер в международном формате, например +77001234567."),
            "required": _("Введите номер телефона."),
        },
    )


class OTPVerifySerializer(PhoneSerializer):
    code = serializers.CharField(
        min_length=1,
        max_length=32,
        trim_whitespace=True,
        error_messages={
            "blank": _("Введите код подтверждения."),
            "required": _("Введите код подтверждения."),
        },
    )


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            "blank": _("Refresh-токен не может быть пустым."),
            "required": _("Refresh-токен обязателен."),
        },
    )
