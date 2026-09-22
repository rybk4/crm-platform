from unittest.mock import patch

from django.test import TestCase
from django.urls import resolve, reverse

from config.views import health, liveness


class HealthCheckTests(TestCase):
    def test_health_route_is_wired(self):
        self.assertEqual(resolve("/api/health/").func, health)
        self.assertEqual(resolve("/api/health/live/").func, liveness)

    def test_health_reports_ok_when_database_is_reachable(self):
        response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "checks": {"database": "ok"}},
        )

    def test_health_reports_503_when_database_is_down(self):
        with patch("config.views._check_database", return_value=False):
            response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json(),
            {"status": "error", "checks": {"database": "error"}},
        )

    def test_health_does_not_require_authentication(self):
        response = self.client.get(reverse("health"))

        self.assertNotEqual(response.status_code, 401)
        self.assertNotEqual(response.status_code, 403)

    def test_health_response_is_not_cached(self):
        response = self.client.get(reverse("health"))

        self.assertIn("no-store", response["Cache-Control"])

    def test_liveness_answers_even_without_database(self):
        with patch("config.views._check_database", return_value=False):
            response = self.client.get(reverse("liveness"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
