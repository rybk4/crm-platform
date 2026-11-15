from datetime import date
from io import StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from operations.models import Appointment, Client, Deal
from organizations.models import Branch, Organization
from services.models import Service
from staff.models import Staff
from users.models import User
from work_schedule.models import DailySchedule


@override_settings(DEBUG=True)
class SeedJournalTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Компания")
        self.branch = Branch.objects.create(organization=self.org, name="Центр")
        self.user = User.objects.create_user(
            username="owner", organization=self.org, active_branch=self.branch
        )

    def seed(self):
        call_command("seedjournal", branch=str(self.branch.pk), date="2026-10-21", stdout=StringIO())

    def test_seeds_a_complete_journal_visible_through_api(self):
        self.seed()
        self.assertEqual(Staff.objects.filter(branch=self.branch).count(), 6)
        self.assertEqual(Service.objects.filter(organization=self.org).count(), 12)
        self.assertEqual(Client.objects.filter(organization=self.org).count(), 24)
        self.assertEqual(DailySchedule.objects.count(), 66)
        self.assertEqual(Appointment.objects.count(), 264)
        self.assertEqual(Deal.objects.count(), 264)
        api = APIClient()
        api.force_authenticate(self.user)
        response = api.get("/api/appointments/", {"date": "2026-10-21"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 24)
        self.assertEqual({item["status"] for item in response.data}, set(Appointment.Status.values))
        self.assertTrue(all(item["deal"] for item in response.data))
        for appointment in Appointment.objects.select_related("specialist", "service", "client", "deal"):
            self.assertEqual(appointment.specialist.organization_id, self.org.pk)
            self.assertEqual(appointment.client.organization_id, self.org.pk)
            self.assertEqual(appointment.service.organization_id, self.org.pk)
            self.assertEqual(appointment.deal.organization_id, self.org.pk)
            self.assertGreater(appointment.ends_at, appointment.starts_at)
        self.assertFalse(Appointment.objects.filter(
            starts_at__date__gt=date(2026, 10, 21), status="completed"
        ).exists())

    def test_rerunning_preserves_edits_and_does_not_recreate_deleted_data(self):
        self.seed()
        appointment = Appointment.objects.first()
        appointment.comment = "Изменено пользователем"
        appointment.save(update_fields=["comment"])
        deleted = Appointment.objects.exclude(pk=appointment.pk).first()
        deleted.delete()
        self.seed()
        appointment.refresh_from_db()
        self.assertEqual(appointment.comment, "Изменено пользователем")
        self.assertEqual(Appointment.all_objects.count(), 264)
        self.assertEqual(Appointment.objects.count(), 263)
        self.assertEqual(Deal.objects.count(), 264)
        self.assertEqual(Client.objects.count(), 24)

    @override_settings(DEBUG=False)
    def test_refuses_to_seed_when_debug_is_disabled(self):
        with self.assertRaises(CommandError):
            self.seed()
        self.assertFalse(Appointment.objects.exists())
        self.assertFalse(Staff.objects.exists())
