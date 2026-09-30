from datetime import date, time

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from organizations.models import Branch, Organization
from staff.models import Staff

from .models import DailySchedule, DailyWorkingInterval


class WorkScheduleTests(TestCase):
    def setUp(self):
        organization = Organization.objects.create(name="Лаванда")
        branch = Branch.objects.create(organization=organization, name="На Абая")
        self.staff = Staff.objects.create(organization=organization, branch=branch, name="Анна")
        self.day = DailySchedule.objects.create(staff=self.staff, date=date(2026, 10, 1))

    def add_interval(self, start, end):
        return DailyWorkingInterval.objects.create(
            daily_schedule=self.day, start_time=start, end_time=end
        )

    def test_day_can_have_several_intervals(self):
        self.add_interval(time(10), time(14))
        self.add_interval(time(15), time(19))

        self.assertEqual(
            [str(item) for item in self.day.working_intervals.all()], ["10:00–14:00", "15:00–19:00"]
        )

    def test_one_day_per_date(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            DailySchedule.objects.create(staff=self.staff, date=date(2026, 10, 1))

    def test_deleted_day_frees_its_date(self):
        self.day.delete()

        DailySchedule.objects.create(staff=self.staff, date=date(2026, 10, 1), is_working=False)

        self.assertEqual(DailySchedule.objects.get(date=date(2026, 10, 1)).is_working, False)

    def test_interval_must_end_after_start(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            self.add_interval(time(18), time(10))

    def test_overlapping_interval_is_rejected(self):
        self.add_interval(time(10), time(14))
        interval = DailyWorkingInterval(
            daily_schedule=self.day, start_time=time(13), end_time=time(16)
        )

        with self.assertRaises(ValidationError):
            interval.full_clean()

    def test_touching_intervals_are_fine(self):
        self.add_interval(time(10), time(14))

        DailyWorkingInterval(
            daily_schedule=self.day, start_time=time(14), end_time=time(18)
        ).full_clean()

    def test_day_off_has_no_intervals(self):
        self.day.update(is_working=False)
        interval = DailyWorkingInterval(
            daily_schedule=self.day, start_time=time(10), end_time=time(12)
        )

        with self.assertRaises(ValidationError):
            interval.full_clean()

    def test_replacing_intervals_really_deletes_old_ones(self):
        self.add_interval(time(10), time(19))

        self.day.working_intervals.all().delete()

        self.assertFalse(DailyWorkingInterval.all_objects.exists())

    def test_validate_intervals_checks_whole_day(self):
        DailySchedule.validate_intervals([(time(15), time(19)), (time(10), time(14))])

        with self.assertRaises(ValidationError):
            DailySchedule.validate_intervals([(time(10), time(14)), (time(12), time(16))])
