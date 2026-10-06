from django.urls import path

from .views import CurrentUserView, OtpRequestView, OtpVerifyView, TokenRefreshView


urlpatterns = [
    path("auth/otp/request/", OtpRequestView.as_view(), name="otp-request"),
    path("auth/otp/verify/", OtpVerifyView.as_view(), name="otp-verify"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("users/me/", CurrentUserView.as_view(), name="current-user"),
]
