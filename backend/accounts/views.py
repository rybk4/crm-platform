from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.translation import gettext as _

from .jwt import TokenError, create_access_token, create_token_pair, decode_token
from .otp import OTPProviderNotConfigured, get_otp_service
from .serializers import OTPVerifySerializer, PhoneSerializer, RefreshTokenSerializer
from users.serializers import UserSerializer


class RequestOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]

        try:
            get_otp_service().send(phone_number)
        except OTPProviderNotConfigured as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        User = get_user_model()
        user_exists = User.objects.filter(phone_number=phone_number).exists()
        detail = (
            _("Пользователь найден. Введите код для входа.")
            if user_exists
            else _("Новый пользователь. Аккаунт будет создан после подтверждения кода.")
        )
        response = {
            "detail": detail,
            "user_exists": user_exists,
        }
        if settings.DEBUG:
            response["debug"] = _(
                "В режиме разработки принимается любой непустой код."
            )
        return Response(response)


class VerifyOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        code = serializer.validated_data["code"]

        try:
            is_valid = get_otp_service().verify(phone_number, code)
        except OTPProviderNotConfigured as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if not is_valid:
            return Response(
                {"detail": _("Код подтверждения неверен или истёк.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        user, created = User.objects.get_or_create_for_phone(phone_number)
        detail = (
            _("Аккаунт создан, вход выполнен.")
            if created
            else _("Код подтверждён, вход выполнен.")
        )
        return Response(
            {
                **create_token_pair(user),
                "user": UserSerializer(user).data,
                "created": created,
                "detail": detail,
            }
        )


class RefreshTokenView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payload = decode_token(serializer.validated_data["refresh"], "refresh")
        except TokenError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        User = get_user_model()
        try:
            user = User.objects.get(pk=payload["sub"], is_active=True)
        except User.DoesNotExist:
            return Response(
                {"detail": _("Пользователь не найден или отключён.")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response({"access": create_access_token(user)})


class CurrentUserView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

