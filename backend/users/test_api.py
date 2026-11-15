from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from organizations.models import Branch, Organization
from .models import User


@override_settings(DEBUG=True, CRM_OTP_CODE="0000")
class OtpApiTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.phone = "+77001234567"
        cache.delete(f"crm:otp:{self.phone}")
        self.addCleanup(cache.delete, f"crm:otp:{self.phone}")

    def request_code(self):
        return self.api.post(
            "/api/auth/otp/request/", {"phone_number": self.phone}, format="json"
        )

    def verify_code(self, code="0000"):
        return self.api.post(
            "/api/auth/otp/verify/",
            {"phone_number": self.phone, "code": code},
            format="json",
        )

    def test_unknown_phone_is_rejected_without_issuing_code(self):
        response = self.request_code()
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["detail"], "Пользователь с таким номером не найден.")
        self.assertIsNone(cache.get(f"crm:otp:{self.phone}"))
        self.assertEqual(self.verify_code().status_code, 400)
        self.assertFalse(User.objects.exists())
        self.assertFalse(Organization.objects.exists())
        self.assertFalse(Branch.objects.exists())

    def test_existing_user_can_login_and_get_profile(self):
        organization = Organization.objects.create(name="Компания")
        branch = Branch.objects.create(organization=organization, name="Филиал")
        user = User.objects.create_user(
            username="owner", phone=self.phone, organization=organization
        )
        response = self.request_code()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["user_exists"])
        self.assertNotIn("debug", response.data)

        login = self.verify_code()
        self.assertEqual(login.status_code, 200, login.data)
        self.assertFalse(login.data["created"])
        self.assertEqual(str(login.data["user"]["id"]), str(user.pk))
        self.assertEqual(str(login.data["user"]["active_branch"]), str(branch.pk))
        self.assertIsNone(cache.get(f"crm:otp:{self.phone}"))
        self.api.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        self.assertEqual(self.api.get("/api/users/me/").status_code, 200)

    def test_inactive_user_cannot_request_code(self):
        User.objects.create_user(username="inactive", phone=self.phone, is_active=False)
        self.assertEqual(self.request_code().status_code, 404)
        self.assertIsNone(cache.get(f"crm:otp:{self.phone}"))

    def test_deleted_user_is_not_recreated_by_verification(self):
        user = User.objects.create_user(username="owner", phone=self.phone)
        self.assertEqual(self.request_code().status_code, 200)
        user.delete()
        self.assertEqual(self.verify_code().status_code, 404)
        self.assertIsNone(cache.get(f"crm:otp:{self.phone}"))
        self.assertFalse(User.objects.exists())
        self.assertFalse(Organization.objects.exists())

    @override_settings(DEBUG=False)
    def test_wrong_code_keeps_existing_user_signed_out(self):
        User.objects.create_user(username="owner", phone=self.phone)
        self.request_code()
        self.assertEqual(self.verify_code("1111").status_code, 400)

    def test_debug_accepts_any_four_digit_code(self):
        User.objects.create_user(username="owner", phone=self.phone)
        self.request_code()
        self.assertEqual(self.verify_code("5927").status_code, 200)

    def test_debug_still_requires_a_code_request(self):
        User.objects.create_user(username="owner", phone=self.phone)
        self.assertEqual(self.verify_code("5927").status_code, 400)

    def test_debug_rejects_invalid_code_format(self):
        User.objects.create_user(username="owner", phone=self.phone)
        self.request_code()
        for code in ("", "abc", "123", "12345", "abcd"):
            with self.subTest(code=code):
                self.assertEqual(self.verify_code(code).status_code, 400)

    @override_settings(DEBUG=False)
    def test_production_accepts_only_issued_code(self):
        User.objects.create_user(username="owner", phone=self.phone)
        response = self.request_code()
        self.assertNotIn("debug", response.data)
        self.assertEqual(self.verify_code("5927").status_code, 400)
        self.assertEqual(self.verify_code("0000").status_code, 200)

    def test_inactive_user_cannot_verify_even_in_debug(self):
        user = User.objects.create_user(username="owner", phone=self.phone)
        self.request_code()
        user.is_active = False
        user.save(update_fields=["is_active"])
        self.assertEqual(self.verify_code("5927").status_code, 404)
