from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.jwt import create_token_pair
from organizations.models import Branch, Organization, OrganizationMember
from specialists.models import Specialist


class OrganizationApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("manager", phone_number="+77001112233")
        self.organization = Organization.objects.create(name="Test", slug="test")
        OrganizationMember.objects.create(organization=self.organization, user=self.user)
        self.branch = Branch.objects.create(
            organization=self.organization, name="First", address="Test address"
        )
        tokens = create_token_pair(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    def test_member_can_create_nested_specialist_and_service(self):
        specialist_response = self.client.post(
            "/api/specialists/",
            {
                "branch": self.branch.pk,
                "first_name": "Анна",
                "last_name": "Смирнова",
                "schedule": [
                    {
                        "weekday": 0,
                        "is_day_off": False,
                        "start_time": "09:00",
                        "end_time": "18:00",
                    }
                ],
                "certificates": [
                    {"title": "Expert", "image_url": "https://example.com/cert.jpg"}
                ],
            },
            format="json",
        )
        self.assertEqual(specialist_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(specialist_response.data["schedule"]), 1)

        service_response = self.client.post(
            "/api/services/",
            {
                "specialist": specialist_response.data["id"],
                "name": "Стрижка",
                "duration_minutes": 60,
                "price": "9000.00",
            },
            format="json",
        )
        self.assertEqual(service_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(service_response.data["branch_id"], self.branch.pk)

    def test_user_cannot_see_another_organization(self):
        other = Organization.objects.create(name="Hidden", slug="hidden")
        Branch.objects.create(organization=other, name="Secret", address="Nowhere")

        organizations = self.client.get("/api/organizations/")
        branches = self.client.get("/api/branches/")

        self.assertEqual([item["id"] for item in organizations.data], [self.organization.pk])
        self.assertEqual([item["id"] for item in branches.data], [self.branch.pk])

    def test_active_branch_scopes_specialist_list_automatically(self):
        second_branch = Branch.objects.create(
            organization=self.organization, name="Second", address="Second address"
        )
        visible = Specialist.objects.create(
            branch=self.branch, first_name="Visible", last_name="Master"
        )
        Specialist.objects.create(
            branch=second_branch, first_name="Hidden", last_name="Master"
        )
        self.user.active_branch = self.branch
        self.user.save(update_fields=["active_branch"])

        response = self.client.get("/api/specialists/")

        self.assertEqual([item["id"] for item in response.data], [visible.pk])
