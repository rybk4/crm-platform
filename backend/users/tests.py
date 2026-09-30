import uuid

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase, override_settings


class UserTests(TestCase):
    def test_user_has_uuid_and_crm_fields(self):
        user = get_user_model().objects.create_user(
            username="owner", password="x", phone="+77001234567", patronymic="Сергеевич"
        )

        self.assertIsInstance(user.id, uuid.UUID)
        self.assertEqual(user.phone, "+77001234567")

    @override_settings(DEBUG=True)
    def test_createdevadmin_is_idempotent(self):
        call_command("createdevadmin", username="dev", password="dev", stdout=open("/dev/null", "w"))
        call_command("createdevadmin", username="dev", password="other", stdout=open("/dev/null", "w"))

        user = get_user_model().objects.get(username="dev")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password("dev"))

    @override_settings(DEBUG=False)
    def test_createdevadmin_skips_without_debug(self):
        call_command("createdevadmin", username="dev", stdout=open("/dev/null", "w"))

        self.assertFalse(get_user_model().objects.filter(username="dev").exists())
