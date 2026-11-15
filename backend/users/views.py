from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.authentication import issue_token, read_token
from .models import User
from .serializers import UserSerializer


def normalize_phone(value):
    digits = "".join(character for character in str(value) if character.isdigit())
    if len(digits) == 11 and digits.startswith("8"):
        digits = f"7{digits[1:]}"
    return f"+{digits}" if digits else ""


class OtpRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        phone = normalize_phone(request.data.get("phone_number"))
        if len(phone) != 12:
            return Response({"phone_number": ["Введите корректный номер телефона."]}, status=400)
        if not User.objects.filter(phone=phone, is_active=True).exists():
            return Response({"detail": "Пользователь с таким номером не найден."}, status=404)
        cache.set(f"crm:otp:{phone}", settings.CRM_OTP_CODE, timeout=300)
        payload = {
            "detail": "Код отправлен.",
            "user_exists": True,
        }
        return Response(payload)


class OtpVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        phone = normalize_phone(request.data.get("phone_number"))
        code = str(request.data.get("code", "")).strip()
        expected = cache.get(f"crm:otp:{phone}")
        valid_format = len(code) == 4 and code.isascii() and code.isdigit()
        if not valid_format or not expected or (not settings.DEBUG and code != expected):
            return Response({"code": ["Неверный или просроченный код."]}, status=400)

        user = User.objects.filter(phone=phone, is_active=True).first()
        if user is None:
            cache.delete(f"crm:otp:{phone}")
            return Response({"detail": "Пользователь с таким номером не найден."}, status=404)
        if user.active_branch_id is None and user.organization_id:
            user.active_branch = user.organization.branches.first()
            user.save(update_fields=["active_branch"])

        cache.delete(f"crm:otp:{phone}")
        return Response(
            {
                "access": issue_token(user, "access"),
                "refresh": issue_token(user, "refresh"),
                "user": UserSerializer(user).data,
                "created": False,
                "detail": "Вход выполнен.",
            }
        )


class TokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get("refresh")
        if not token:
            return Response({"refresh": ["Укажите refresh-токен."]}, status=400)
        user = read_token(token, "refresh")
        return Response({"access": issue_token(user, "access")})


class CurrentUserView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
