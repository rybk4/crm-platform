from django.conf import settings
from django.utils.translation import gettext_lazy as _


class OTPProviderNotConfigured(Exception):
    pass


class DebugOTPService:
    def send(self, phone_number):
        return None

    def verify(self, phone_number, code):
        return bool(code)


class UnconfiguredOTPService:
    message = _("Сервис отправки кодов подтверждения не настроен.")

    def send(self, phone_number):
        raise OTPProviderNotConfigured(self.message)

    def verify(self, phone_number, code):
        raise OTPProviderNotConfigured(self.message)


def get_otp_service():
    if settings.DEBUG:
        return DebugOTPService()
    return UnconfiguredOTPService()
