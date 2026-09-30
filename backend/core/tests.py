import uuid

from django.test import TestCase

from organizations.models import City

from .models import RowStatus


class BaseMixinTests(TestCase):
    """Поведение BaseMixin проверяем на простейшей модели — справочнике городов."""

    def test_id_is_uuid_and_status_active_by_default(self):
        city = City.objects.create(name="Алматы")

        self.assertIsInstance(city.id, uuid.UUID)
        self.assertEqual(city.row_status, RowStatus.ACTIVE)
        self.assertIsNotNone(city.create_date)

    def test_delete_is_soft(self):
        city = City.objects.create(name="Алматы")

        city.delete()

        self.assertFalse(City.objects.filter(pk=city.pk).exists())
        self.assertEqual(City.all_objects.get(pk=city.pk).row_status, RowStatus.DELETED)

    def test_queryset_delete_is_soft_too(self):
        City.objects.create(name="Алматы")
        City.objects.create(name="Астана")

        City.objects.all().delete()

        self.assertEqual(City.objects.count(), 0)
        self.assertEqual(City.all_objects.count(), 2)

    def test_restore_and_hard_delete(self):
        city = City.objects.create(name="Алматы")
        city.delete()

        city.restore()
        self.assertTrue(City.objects.filter(pk=city.pk).exists())

        city.hard_delete()
        self.assertFalse(City.all_objects.filter(pk=city.pk).exists())

    def test_updated_rows_stay_visible(self):
        City.objects.create(name="Алматы", row_status=RowStatus.UPDATED)

        self.assertEqual(City.get_active().count(), 1)

    def test_update_sets_fields_and_saves(self):
        city = City.objects.create(name="Алматы")

        city.update(name="Астана")

        self.assertEqual(City.objects.get(pk=city.pk).name, "Астана")
