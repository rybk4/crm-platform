from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase

from organizations.models import Branch, Organization
from staff.models import Staff

from .models import Service, ServiceCategory, StaffService


class ServiceTestCase(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Лаванда")
        branch = Branch.objects.create(organization=self.organization, name="На Абая")
        self.staff = Staff.objects.create(organization=self.organization, branch=branch, name="Анна")
        self.nails = ServiceCategory.objects.get(code="nails")

    def make_service(self, **fields):
        defaults = {
            "organization": self.organization,
            "category": self.nails,
            "name": "Маникюр",
            "duration_minutes": 60,
            "price": Decimal("8000"),
        }
        return Service.objects.create(**{**defaults, **fields})


class ServiceCategoryTests(ServiceTestCase):
    def test_starting_categories_are_loaded(self):
        codes = list(ServiceCategory.objects.values_list("code", flat=True))

        self.assertEqual(codes[:2], ["hair", "nails"])
        self.assertEqual(len(codes), 8)


class ServiceTests(ServiceTestCase):
    def test_currency_comes_from_organization(self):
        self.assertEqual(self.make_service().currency, "KZT")

    def test_name_is_unique_within_organization(self):
        self.make_service()

        with self.assertRaises(IntegrityError), transaction.atomic():
            self.make_service()

    def test_same_name_is_fine_in_another_organization(self):
        other = Organization.objects.create(name="Другая")

        self.make_service()
        self.make_service(organization=other)

        self.assertEqual(Service.objects.filter(name="Маникюр").count(), 2)

    def test_deleted_service_frees_its_name(self):
        self.make_service().delete()

        self.make_service()

        self.assertEqual(Service.all_objects.filter(name="Маникюр").count(), 2)

    def test_price_range_is_checked(self):
        service = self.make_service(price_max=Decimal("5000"))

        with self.assertRaises(ValidationError) as error:
            service.full_clean()

        self.assertIn("price_max", error.exception.message_dict)

    def test_category_in_use_cannot_be_hard_deleted(self):
        self.make_service()

        with self.assertRaises(ProtectedError):
            self.nails.hard_delete()


class StaffServiceTests(ServiceTestCase):
    def test_empty_price_and_duration_fall_back_to_service(self):
        service = self.make_service(price_max=Decimal("12000"))
        link = StaffService.objects.create(staff=self.staff, service=service)

        self.assertEqual(link.effective_price, Decimal("8000"))
        self.assertEqual(link.effective_price_max, Decimal("12000"))
        self.assertEqual(link.effective_duration_minutes, 60)
        self.assertEqual(list(self.staff.services.all()), [service])

    def test_own_price_overrides_service(self):
        service = self.make_service(price_max=Decimal("12000"))
        link = StaffService.objects.create(
            staff=self.staff, service=service, price=Decimal("10000"), duration_minutes=90
        )

        self.assertEqual(link.effective_price, Decimal("10000"))
        self.assertIsNone(link.effective_price_max)
        self.assertEqual(link.effective_duration_minutes, 90)

    def test_service_from_other_organization_is_rejected(self):
        other = Organization.objects.create(name="Другая")
        link = StaffService(staff=self.staff, service=self.make_service(organization=other))

        with self.assertRaises(ValidationError) as error:
            link.full_clean()

        self.assertIn("service", error.exception.message_dict)

    def test_price_max_needs_own_price(self):
        link = StaffService(staff=self.staff, service=self.make_service(), price_max=Decimal("9000"))

        with self.assertRaises(ValidationError) as error:
            link.full_clean()

        self.assertIn("price_max", error.exception.message_dict)

    def test_same_service_twice_is_rejected(self):
        service = self.make_service()
        StaffService.objects.create(staff=self.staff, service=service)

        with self.assertRaises(IntegrityError), transaction.atomic():
            StaffService.objects.create(staff=self.staff, service=service)

    def test_removal_is_real(self):
        link = StaffService.objects.create(staff=self.staff, service=self.make_service())

        link.delete()

        self.assertEqual(self.staff.services.count(), 0)
