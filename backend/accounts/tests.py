from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
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


class CreateDevAdminCommandTests(TestCase):
    def run_command(self, *args, **options):
        output = StringIO()
        call_command("createdevadmin", *args, stdout=output, **options)
        return output.getvalue()

    @override_settings(DEBUG=True)
    def test_creates_superuser_with_default_credentials(self):
        self.run_command()

        user = get_user_model().objects.get(username="admin")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_active)
        self.assertTrue(user.check_password("admin"))

    @override_settings(DEBUG=True)
    def test_is_idempotent_and_keeps_existing_password(self):
        self.run_command()
        user = get_user_model().objects.get(username="admin")
        user.set_password("свой-пароль")
        user.save(update_fields=["password"])

        self.run_command()

        self.assertEqual(get_user_model().objects.filter(username="admin").count(), 1)
        user.refresh_from_db()
        self.assertTrue(user.check_password("свой-пароль"))

    @override_settings(DEBUG=True)
    def test_reset_password_flag_overwrites_password(self):
        self.run_command()
        user = get_user_model().objects.get(username="admin")
        user.set_password("свой-пароль")
        user.save(update_fields=["password"])

        self.run_command("--reset-password")

        user.refresh_from_db()
        self.assertTrue(user.check_password("admin"))

    @override_settings(DEBUG=True)
    def test_restores_admin_rights_of_existing_user(self):
        get_user_model().objects.create_user("admin", "admin")

        self.run_command()

        user = get_user_model().objects.get(username="admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    @override_settings(DEBUG=False)
    def test_does_nothing_without_debug(self):
        output = self.run_command()

        self.assertFalse(get_user_model().objects.filter(username="admin").exists())
        self.assertIn("DEBUG=False", output)

    @override_settings(DEBUG=False)
    def test_force_creates_superuser_without_debug(self):
        self.run_command("--force", "--password", "сильный-пароль")

        user = get_user_model().objects.get(username="admin")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password("сильный-пароль"))

    @override_settings(DEBUG=True)
    def test_custom_username_from_argument(self):
        self.run_command("--username", "root")

        self.assertTrue(get_user_model().objects.filter(username="root").exists())

    @override_settings(DEBUG=True)
    def test_rejects_empty_password(self):
        with self.assertRaises(CommandError):
            self.run_command("--password", "")
