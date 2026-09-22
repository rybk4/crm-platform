from django.urls import path

from .views import (
    CurrentUserView,
    RefreshTokenView,
    RequestOTPView,
    VerifyOTPView,
)


urlpatterns = [
    path("otp/request/", RequestOTPView.as_view(), name="otp-request"),
    path("otp/verify/", VerifyOTPView.as_view(), name="otp-verify"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
]

