from django.test import TestCase

from .models import Profession


class ProfessionSeedTests(TestCase):
    def test_starting_list_is_loaded_in_order(self):
        codes = list(Profession.objects.values_list("code", flat=True))

        self.assertEqual(len(codes), 12)
        self.assertEqual(codes[:3], ["hair_stylist", "colorist", "barber"])
        self.assertIn("administrator", codes)
