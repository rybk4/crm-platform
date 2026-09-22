from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from organizations.models import Branch, Organization, OrganizationMember


@override_settings(DEBUG=True)
class CurrentUserTests(APITestCase):
    def setUp(self):
        login = self.client.post(
            "/api/auth/otp/verify/",
            {"phone_number": "+77001234567", "code": "123456"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_current_user_profile_can_update_locale(self):
        response = self.client.patch(
            "/api/users/me/",
            {"locale": "kk"},
            format="json",
            HTTP_ACCEPT_LANGUAGE="kk",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["locale"], "kk")
        self.assertEqual(response.data["phone_number"], "+77001234567")

    def test_current_user_profile_rejects_unknown_locale(self):
        response = self.client.patch(
            "/api/users/me/",
            {"locale": "de"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("locale", response.data)

    def test_current_user_can_select_branch_from_own_organization(self):
        user = self.client.get("/api/users/me/").wsgi_request.user
        organization = Organization.objects.create(name="Workspace", slug="workspace")
        OrganizationMember.objects.create(organization=organization, user=user)
        branch = Branch.objects.create(organization=organization, name="Center", address="Main 1")

        response = self.client.patch(
            "/api/users/me/",
            {"active_branch": branch.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["active_branch"], branch.pk)
        self.assertEqual(response.data["active_branch_details"]["name"], "Center")

    def test_current_user_cannot_select_unavailable_branch(self):
        organization = Organization.objects.create(name="Hidden", slug="hidden-user-test")
        branch = Branch.objects.create(organization=organization, name="Secret", address="Hidden")

        response = self.client.patch(
            "/api/users/me/",
            {"active_branch": branch.pk},
            format="json",
            HTTP_ACCEPT_LANGUAGE="en",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["active_branch"][0]),
            "The branch is not available to the current user.",
        )
