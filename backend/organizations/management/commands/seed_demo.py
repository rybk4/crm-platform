from datetime import time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from organizations.models import Branch, Organization, OrganizationMember
from services.models import Service
from specialists.models import Specialist, SpecialistCertificate, WorkSchedule


class Command(BaseCommand):
    help = "Создаёт идемпотентные демонстрационные данные CRM"

    @transaction.atomic
    def handle(self, *args, **options):
        organization, _ = Organization.objects.update_or_create(
            slug="masterskaya",
            defaults={
                "name": "Сеть «Мастерская»",
                "phone": "+77005550101",
                "timezone": "Asia/Almaty",
                "currency": "KZT",
                "is_active": True,
            },
        )
        central, _ = Branch.objects.update_or_create(
            organization=organization,
            name="Центральный филиал",
            defaults={
                "address": "ул. Абая, 42",
                "phone": "+77005550102",
                "is_active": True,
            },
        )
        dostyk, _ = Branch.objects.update_or_create(
            organization=organization,
            name="Филиал на Достык",
            defaults={
                "address": "пр. Достык, 118",
                "phone": "+77005550103",
                "is_active": True,
            },
        )

        for user in get_user_model().objects.filter(is_active=True):
            role = (
                OrganizationMember.Role.OWNER
                if user.is_superuser
                else OrganizationMember.Role.MANAGER
            )
            OrganizationMember.objects.update_or_create(
                organization=organization,
                user=user,
                defaults={"role": role, "is_active": True},
            )
            if user.active_branch_id is None:
                user.active_branch = central
                user.save(update_fields=["active_branch"])

        anna = self._specialist(
            central,
            first_name="Анна",
            last_name="Смирнова",
            middle_name="Олеговна",
            job_title="Стилист-колорист",
            phone_number="+77015550111",
            bio="Специалист по сложным окрашиваниям и восстановлению волос.",
        )
        damir = self._specialist(
            dostyk,
            first_name="Дамир",
            last_name="Алиев",
            middle_name="Русланович",
            job_title="Барбер",
            phone_number="+77025550112",
            bio="Мужские стрижки, оформление бороды и персональный подбор образа.",
        )

        SpecialistCertificate.objects.update_or_create(
            specialist=anna,
            title="Color Expert",
            defaults={"image_url": "https://example.com/certificates/color-expert.jpg"},
        )
        self._schedule(anna, saturday=True)
        self._schedule(damir, saturday=True)

        self._service(anna, "Сложное окрашивание", 180, "35000.00")
        self._service(anna, "Женская стрижка", 75, "12000.00")
        self._service(damir, "Мужская стрижка", 60, "8000.00")
        self._service(damir, "Стрижка + борода", 90, "12000.00")

        self.stdout.write(
            self.style.SUCCESS(
                "Демо-данные готовы: 1 организация, 2 филиала, 2 специалиста, 4 услуги."
            )
        )

    @staticmethod
    def _specialist(branch, **defaults):
        specialist, _ = Specialist.objects.update_or_create(
            branch=branch,
            phone_number=defaults["phone_number"],
            defaults={**defaults, "is_active": True},
        )
        return specialist

    @staticmethod
    def _schedule(specialist, saturday=False):
        for weekday in range(7):
            is_day_off = weekday == 6 or (weekday == 5 and not saturday)
            WorkSchedule.objects.update_or_create(
                specialist=specialist,
                weekday=weekday,
                defaults={
                    "is_day_off": is_day_off,
                    "start_time": None if is_day_off else time(9, 0),
                    "end_time": None if is_day_off else time(18, 0),
                    "break_start": None,
                    "break_end": None,
                },
            )

    @staticmethod
    def _service(specialist, name, duration, price):
        Service.objects.update_or_create(
            specialist=specialist,
            name=name,
            defaults={
                "duration_minutes": duration,
                "price": price,
                "currency": "KZT",
                "is_active": True,
            },
        )
