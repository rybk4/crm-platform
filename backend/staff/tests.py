from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase
from rest_framework.test import APIClient

from organizations.models import Branch, Organization
from professions.models import Profession
from services.models import Service, ServiceCategory

from .models import Staff, StaffProfession


class StaffTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Лаванда")
        self.branch = Branch.objects.create(organization=self.organization, name="На Абая")

    def make_staff(self, **fields):
        return Staff(organization=self.organization, branch=self.branch, name="Анна", **fields)

    def test_full_name_skips_empty_parts(self):
        self.assertEqual(self.make_staff(surname="Ким").full_name, "Ким Анна")
        self.assertEqual(
            self.make_staff(surname="Ким", patronymic="Сергеевна").full_name,
            "Ким Анна Сергеевна",
        )

    def test_only_name_is_required(self):
        self.make_staff().full_clean()

    def test_phone_format_is_checked(self):
        with self.assertRaises(ValidationError) as error:
            self.make_staff(phone="8 700 123").full_clean()

        self.assertIn("phone", error.exception.message_dict)

    def test_branch_must_belong_to_organization(self):
        other = Organization.objects.create(name="Другая")
        staff = Staff(organization=other, branch=self.branch, name="Анна")

        with self.assertRaises(ValidationError) as error:
            staff.full_clean()

        self.assertIn("branch", error.exception.message_dict)

    def test_deleting_account_keeps_staff(self):
        user = get_user_model().objects.create_user(username="anna", password="x")
        staff = self.make_staff(user=user)
        staff.save()

        user.delete()
        staff.refresh_from_db()

        self.assertIsNone(staff.user)

    def test_inactive_is_not_deleted(self):
        staff = self.make_staff(is_active=False)
        staff.save()

        self.assertTrue(Staff.objects.filter(pk=staff.pk).exists())


class StaffProfessionTests(TestCase):
    def setUp(self):
        organization = Organization.objects.create(name="Лаванда")
        branch = Branch.objects.create(organization=organization, name="На Абая")
        self.staff = Staff.objects.create(organization=organization, branch=branch, name="Анна")
        self.nails = Profession.objects.get(code="nail_master")
        self.brows = Profession.objects.get(code="brow_master")

    def test_staff_can_have_several_professions_and_one_primary(self):
        StaffProfession.objects.create(staff=self.staff, profession=self.nails, is_primary=True)
        StaffProfession.objects.create(staff=self.staff, profession=self.brows)

        self.assertEqual(self.staff.professions.count(), 2)
        self.assertEqual(self.staff.primary_profession, self.nails)

    def test_second_primary_profession_is_rejected(self):
        StaffProfession.objects.create(staff=self.staff, profession=self.nails, is_primary=True)

        with self.assertRaises(IntegrityError), transaction.atomic():
            StaffProfession.objects.create(staff=self.staff, profession=self.brows, is_primary=True)

    def test_same_profession_twice_is_rejected(self):
        StaffProfession.objects.create(staff=self.staff, profession=self.nails)

        with self.assertRaises(IntegrityError), transaction.atomic():
            StaffProfession.objects.create(staff=self.staff, profession=self.nails)

    def test_removed_profession_really_disappears_and_can_be_added_again(self):
        link = StaffProfession.objects.create(staff=self.staff, profession=self.nails)

        link.delete()
        self.assertEqual(self.staff.professions.count(), 0)

        StaffProfession.objects.create(staff=self.staff, profession=self.nails)
        self.staff.staff_professions.all().delete()
        self.assertFalse(StaffProfession.objects.exists())

    def test_profession_in_use_cannot_be_hard_deleted(self):
        StaffProfession.objects.create(staff=self.staff, profession=self.nails)

        with self.assertRaises(ProtectedError):
            self.nails.hard_delete()

    def test_title_is_free_text_next_to_professions(self):
        self.staff.update(title="Топ-стилист")

        self.assertEqual(Staff.objects.get(pk=self.staff.pk).title, "Топ-стилист")


class StaffApiTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Лаванда")
        self.branch = Branch.objects.create(organization=self.organization, name="На Абая")
        self.user = get_user_model().objects.create_user(
            username="owner", organization=self.organization, active_branch=self.branch
        )
        self.staff = Staff.objects.create(
            organization=self.organization, branch=self.branch, name="Анна"
        )
        category = ServiceCategory.objects.create(name="Уход", code="care-api")
        self.service = Service.objects.create(
            organization=self.organization,
            category=category,
            name="Уход",
            duration_minutes=45,
            price="8000",
        )
        self.api = APIClient()
        self.api.force_authenticate(self.user)

    def test_profile_schedule_certificates_and_services_are_saved(self):
        profile = self.api.patch(
            f"/api/specialists/{self.staff.pk}/",
            {
                "photo_url": "https://example.com/photo.jpg",
                "vacation_start": "2026-10-10",
                "vacation_end": "2026-10-15",
                "payout_model": "percent",
                "payout_value": "45",
                "certificates": [
                    {"title": "Диплом", "image_url": "https://example.com/diploma.jpg", "position": 0}
                ],
                "schedule": [
                    {
                        "weekday": 0,
                        "is_day_off": False,
                        "start_time": "09:00",
                        "end_time": "18:00",
                        "break_start": "13:00",
                        "break_end": "14:00",
                    }
                ],
            },
            format="json",
        )
        services = self.api.put(
            f"/api/specialists/{self.staff.pk}/services/",
            {"service_ids": [str(self.service.pk)]},
            format="json",
        )

        self.assertEqual(profile.status_code, 200, profile.data)
        self.assertEqual(profile.data["certificates"][0]["title"], "Диплом")
        self.assertEqual(profile.data["schedule"][0]["start_time"], "09:00")
        self.assertEqual(services.status_code, 200, services.data)
        self.assertTrue(self.staff.services.filter(pk=self.service.pk).exists())
