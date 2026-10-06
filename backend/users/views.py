from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.authentication import issue_token, read_token
from organizations.models import Branch, Organization
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
        cache.set(f"crm:otp:{phone}", settings.CRM_OTP_CODE, timeout=300)
        payload = {
            "detail": "Код отправлен.",
            "user_exists": User.objects.filter(phone=phone).exists(),
        }
        if settings.DEBUG:
            payload["debug"] = settings.CRM_OTP_CODE
        return Response(payload)


class OtpVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        phone = normalize_phone(request.data.get("phone_number"))
        code = str(request.data.get("code", "")).strip()
        expected = cache.get(f"crm:otp:{phone}")
        if not expected or code != expected:
            return Response({"code": ["Неверный или просроченный код."]}, status=400)

        user = User.objects.filter(phone=phone).first()
        created = user is None
        if created:
            started_at = timezone.now()
            organization = Organization.objects.create(
                name="Моя компания",
                phone=phone,
                subscription_started_at=started_at,
                subscription_expires_at=started_at + timedelta(days=14),
            )
            branch = Branch.objects.create(
                organization=organization, name="Основной филиал", phone=phone
            )
            user = User.objects.create_user(
                username=f"owner-{phone[1:]}",
                phone=phone,
                organization=organization,
                active_branch=branch,
                first_name="Владелец",
            )
        elif user.active_branch_id is None and user.organization_id:
            user.active_branch = user.organization.branches.first()
            user.save(update_fields=["active_branch"])

        cache.delete(f"crm:otp:{phone}")
        return Response(
            {
                "access": issue_token(user, "access"),
                "refresh": issue_token(user, "refresh"),
                "user": UserSerializer(user).data,
                "created": created,
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
