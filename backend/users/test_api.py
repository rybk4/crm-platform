from django.test import TestCase, override_settings
from rest_framework.test import APIClient


class OtpApiTests(TestCase):
    @override_settings(DEBUG=True, CRM_OTP_CODE="0000")
    def test_first_login_creates_workspace_and_tokens(self):
        api = APIClient()
        request = api.post("/api/auth/otp/request/", {"phone_number": "+77001234567"}, format="json")
        self.assertEqual(request.status_code, 200)
        self.assertEqual(request.data["debug"], "0000")

        login = api.post(
            "/api/auth/otp/verify/",
            {"phone_number": "+77001234567", "code": "0000"},
            format="json",
        )
        self.assertEqual(login.status_code, 200, login.data)
        self.assertTrue(login.data["created"])
        self.assertIsNotNone(login.data["user"]["active_branch"])

        api.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        profile = api.get("/api/users/me/")
        self.assertEqual(profile.status_code, 200)
