from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from organizations.models import Branch, Organization
from services.models import Service, ServiceCategory, StaffService
from staff.models import Staff
from .models import Client


class OperationsApiTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Тест", phone="+77001112233")
        self.branch = Branch.objects.create(organization=self.organization, name="Центр")
        self.user = get_user_model().objects.create_user(
            username="owner", organization=self.organization, active_branch=self.branch
        )
        category = ServiceCategory.objects.create(name="Стрижки", code="cuts")
        self.staff = Staff.objects.create(
            name="Алия", surname="Ким", organization=self.organization, branch=self.branch
        )
        self.service = Service.objects.create(
            organization=self.organization,
            category=category,
            name="Стрижка",
            duration_minutes=60,
            price="12000",
        )
        StaffService.objects.create(staff=self.staff, service=self.service)
        self.client = Client.objects.create(
            organization=self.organization, first_name="Анна", phone_number="+77005554433"
        )
        self.api = APIClient()
        self.api.force_authenticate(self.user)

    def test_appointment_creates_deal_and_appears_in_analytics(self):
        starts_at = timezone.now() - timedelta(days=1)
        response = self.api.post(
            "/api/appointments/",
            {
                "specialist": str(self.staff.pk),
                "service": str(self.service.pk),
                "client": str(self.client.pk),
                "starts_at": starts_at.isoformat(),
                "status": "completed",
                "comment": "",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["duration_minutes"], 60)
        self.assertIsNotNone(response.data["deal"])

        analytics = self.api.get("/api/analytics/summary/?period=30")
        self.assertEqual(analytics.status_code, 200)
        self.assertEqual(analytics.data["appointments"]["value"], 1)

    def test_client_data_is_isolated_by_organization(self):
        other = Organization.objects.create(name="Чужая")
        Client.objects.create(organization=other, first_name="Скрытый", phone_number="+77009998877")
        response = self.api.get("/api/clients/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Анна")

    def test_deal_payment_completes_appointment(self):
        appointment = self.api.post(
            "/api/appointments/",
            {
                "specialist": str(self.staff.pk),
                "service": str(self.service.pk),
                "client": str(self.client.pk),
                "starts_at": (timezone.now() + timedelta(days=2)).isoformat(),
                "status": "confirmed",
                "comment": "",
            },
            format="json",
        )
        method = self.api.post(
            "/api/payment-methods/",
            {"name": "Карта", "commission": "1.5", "commission_type": "percent", "is_active": True},
            format="json",
        )
        paid = self.api.patch(
            f'/api/deals/{appointment.data["deal"]}/close/',
            {"payment_method": method.data["id"], "discount": "500", "comment": "Оплачено"},
            format="json",
        )

        self.assertEqual(paid.status_code, 200, paid.data)
        appointment = self.api.get(f'/api/appointments/{appointment.data["id"]}/')
        self.assertEqual(appointment.data["status"], "completed")
        self.assertEqual(appointment.data["deal_status"], "paid")

    def test_campaign_is_queued_when_webhook_is_not_configured(self):
        response = self.api.post(
            "/api/campaigns/",
            {
                "title": "Возвращайтесь",
                "message": "Дарим скидку на следующий визит",
                "recipients": ["+77005554433"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], "queued")
        self.assertEqual(response.data["success_count"], 0)
