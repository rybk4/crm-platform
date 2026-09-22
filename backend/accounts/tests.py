from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


@override_settings(DEBUG=True)
class OTPAuthenticationTests(APITestCase):
    phone_number = "+77001234567"

    def test_debug_mode_accepts_any_non_empty_code(self):
        response = self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone_number, "code": "anything"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertTrue(response.data["created"])

    def test_otp_request_reports_if_user_exists_without_creating_one(self):
        first_request = self.client.post(
            "/api/auth/otp/request/",
            {"phone_number": self.phone_number},
            format="json",
        )
        self.assertEqual(first_request.status_code, status.HTTP_200_OK)
        self.assertFalse(first_request.data["user_exists"])

        self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )
        second_request = self.client.post(
            "/api/auth/otp/request/",
            {"phone_number": self.phone_number},
            format="json",
        )

        self.assertTrue(second_request.data["user_exists"])

    def test_verify_rejects_empty_code_with_field_error(self):
        response = self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone_number, "code": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("code", response.data)

    def test_send_otp_uses_requested_locale(self):
        response = self.client.post(
            "/api/auth/otp/request/",
            {"phone_number": self.phone_number},
            format="json",
            HTTP_ACCEPT_LANGUAGE="en",
        )

        self.assertEqual(
            response.data["detail"],
            "New user. The account will be created after code verification.",
        )

    def test_access_token_authenticates_me_endpoint(self):
        login = self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone_number"], self.phone_number)

    def test_refresh_token_issues_new_access_token(self):
        login = self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )

        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": login.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    @override_settings(DEBUG=False)
    def test_non_debug_mode_rejects_when_provider_is_not_configured(self):
        response = self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
