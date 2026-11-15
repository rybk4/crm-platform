from collections import Counter
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import NAMESPACE_URL, uuid5
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from operations.models import Appointment, Client, Deal, PaymentMethod
from organizations.models import Branch
from professions.models import Profession
from services.models import Service, ServiceCategory, StaffService
from staff.models import Staff, StaffProfession
from work_schedule.models import DailySchedule, DailyWorkingInterval


SPECIALISTS = [
    ("Айгерим", "Сапарова", "hair_stylist", "hair", "Стилист", [
        ("Женская стрижка", 60, "12000"), ("Укладка волос", 45, "8000")]),
    ("Данияр", "Омаров", "barber", "hair", "Барбер", [
        ("Мужская стрижка", 45, "7000"), ("Оформление бороды", 30, "4500")]),
    ("Алина", "Ким", "nail_master", "nails", "Мастер маникюра", [
        ("Маникюр с покрытием", 90, "11000"), ("Педикюр с покрытием", 90, "14000")]),
    ("Мадина", "Ахметова", "brow_master", "brows_lashes", "Бровист", [
        ("Коррекция и окрашивание бровей", 30, "4500"), ("Ламинирование бровей", 60, "9000")]),
    ("София", "Иванова", "cosmetologist", "face", "Косметолог", [
        ("Уход за лицом", 60, "18000"), ("Массаж лица", 45, "10000")]),
    ("Тимур", "Нурланов", "massage_therapist", "massage", "Массажист", [
        ("Общий массаж", 60, "16000"), ("Массаж спины", 30, "9000")]),
]
CLIENT_NAMES = [
    ("Анна", "Соколова"), ("Аружан", "Серикова"), ("Дмитрий", "Волков"),
    ("Динара", "Оспанова"), ("Екатерина", "Смирнова"), ("Ерлан", "Касымов"),
    ("Жанель", "Муратова"), ("Илья", "Петров"), ("Карина", "Ли"),
    ("Лаура", "Нуртаева"), ("Мария", "Кузнецова"), ("Никита", "Орлов"),
    ("Ольга", "Морозова"), ("Рамиль", "Ахметов"), ("Салтанат", "Толеуова"),
    ("Татьяна", "Ким"), ("Фариза", "Абдрахманова"), ("Юлия", "Белова"),
    ("Алихан", "Сулейменов"), ("Виктория", "Попова"), ("Дарья", "Зайцева"),
    ("Руслан", "Беков"), ("Сабина", "Ибраева"), ("Эльмира", "Каримова"),
]
SLOTS = [(9, 0), (10, 45), (14, 0), (16, 0)]


def demo_id(key):
    return uuid5(NAMESPACE_URL, f"crm-platform:journal-demo:v1:{key}")


def add(model, counts, label, defaults=None, **lookup):
    obj, created = model.all_objects.get_or_create(**lookup, defaults=defaults or {})
    counts[label] += int(created)
    return obj


class Command(BaseCommand):
    help = "Добавляет тестовые данные журнала без очистки базы и перезаписи существующих записей."

    def add_arguments(self, parser):
        parser.add_argument("--branch", help="UUID филиала; по умолчанию все активные филиалы.")
        parser.add_argument("--date", help="Центральная дата YYYY-MM-DD; по умолчанию сегодня в часовом поясе филиала.")

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Тестовое заполнение доступно только при DEBUG=true.")
        anchor = None
        if options["date"]:
            try:
                anchor = date.fromisoformat(options["date"])
            except ValueError as exc:
                raise CommandError("Дата должна иметь формат YYYY-MM-DD.") from exc
        branches = Branch.objects.filter(is_active=True).select_related("organization")
        if options["branch"]:
            branches = branches.filter(pk=options["branch"])
        if not branches.exists():
            raise CommandError("Активные филиалы не найдены.")
        total = Counter()
        for branch in branches:
            tz = ZoneInfo(branch.timezone)
            today = anchor or timezone.localdate(timezone=tz)
            counts = self.seed_branch(branch, today, tz)
            total.update(counts)
            self.stdout.write(f"{branch}: {today - timedelta(days=3)} — {today + timedelta(days=7)}; добавлено записей: {counts['appointments']}")
        self.stdout.write(self.style.SUCCESS(f"Создано: {dict(total)}"))

    def seed_branch(self, branch, today, tz):
        counts = Counter()
        org = branch.organization
        clients = [add(Client, counts, "clients", organization=org,
            phone_number=f"+7700900{index + 1:04d}", defaults={
                "first_name": first, "last_name": last,
                "email": f"client{index + 1}@example.test",
                "birthday": date(1985 + index % 16, index % 12 + 1, index % 27 + 1),
                "status": Client.Status.VIP if index % 7 == 0 else Client.Status.BASIC,
                "note": "Тестовый клиент для проверки журнала.",
            }) for index, (first, last) in enumerate(CLIENT_NAMES)]
        methods = [add(PaymentMethod, counts, "payment_methods", organization=org, name=name)
            for name in ("Наличные", "Банковская карта", "Kaspi QR")]
        for index, (first, last, profession_code, category_code, title, specs) in enumerate(SPECIALISTS):
            staff = add(Staff, counts, "specialists", id=demo_id(f"{branch.pk}:staff:{index}"), defaults={
                "organization": org, "branch": branch, "name": first, "surname": last,
                "title": title, "phone": f"+7700901{index + 1:04d}",
                "career_start_date": date(2017 + index % 4, 1, 1),
                "bio": "Тестовый специалист для проверки записей и расписания.",
            })
            if staff.is_deleted or not staff.is_active:
                continue
            profession = Profession.objects.get(code=profession_code)
            add(StaffProfession, counts, "professions", staff=staff, profession=profession,
                defaults={"is_primary": True})
            category = ServiceCategory.objects.get(code=category_code)
            services = []
            for name, duration, price in specs:
                service = add(Service, counts, "services", organization=org, name=name,
                    defaults={"category": category, "duration_minutes": duration, "price": Decimal(price)})
                if service.is_deleted or not service.is_active:
                    continue
                add(StaffService, counts, "staff_services", staff=staff, service=service)
                services.append(service)
            if not services:
                continue
            for offset in range(-3, 8):
                day = today + timedelta(days=offset)
                schedule = add(DailySchedule, counts, "schedules", staff=staff, date=day)
                if not schedule.is_working or schedule.is_deleted:
                    continue
                for start, end in ((time(9), time(13)), (time(14), time(19))):
                    add(DailyWorkingInterval, counts, "working_intervals", daily_schedule=schedule,
                        start_time=start, end_time=end)
                for slot, (hour, minute) in enumerate(SLOTS):
                    service = services[(slot + offset) % len(services)]
                    client = clients[(index * 4 + slot + offset) % len(clients)]
                    if not client.is_deleted:
                        self.seed_appointment(branch, staff, service, client, methods,
                            day, tz, offset, index, slot, hour, minute, counts)
        return counts

    def seed_appointment(self, branch, staff, service, client, methods,
            day, tz, offset, index, slot, hour, minute, counts):
        key = f"{branch.pk}:{day}:{index}:{slot}"
        appointment_id = demo_id(f"{key}:appointment")
        if Appointment.all_objects.filter(pk=appointment_id).exists():
            return
        statuses = ("completed", "completed", "no_show", "cancelled") if offset < 0 else (
            ("confirmed", "pending", "confirmed", "pending", "cancelled") if offset > 0
            else ("completed", "confirmed", "pending", "cancelled", "no_show"))
        status = statuses[(index + slot) % len(statuses)]
        start = datetime.combine(day, time(hour, minute), tzinfo=tz) + timedelta(minutes=15 * (index % 2))
        end = start + timedelta(minutes=service.duration_minutes)
        paid = status == Appointment.Status.COMPLETED
        cancelled = status in (Appointment.Status.CANCELLED, Appointment.Status.NO_SHOW)
        deal = add(Deal, counts, "deals", id=demo_id(f"{key}:deal"), defaults={
            "organization": branch.organization, "branch": branch, "client": client,
            "status": Deal.Status.PAID if paid else Deal.Status.CANCELLED if cancelled else Deal.Status.OPEN,
            "total": service.price,
            "discount": service.price * Decimal("0.10") if (index + slot) % 5 == 0 else Decimal("0"),
            "payment_method": methods[(index + slot) % len(methods)] if paid else None,
            "payment_date": end if paid else None,
            "comment": "Тестовая сделка для проверки оплаты в журнале.",
        })
        appointment = Appointment(
            id=appointment_id, organization=branch.organization, branch=branch, specialist=staff,
            service=service, client=client, deal=deal, starts_at=start, ends_at=end,
            price=service.price, status=status, source=("crm", "phone", "online")[(index + slot) % 3],
            comment=("Первый визит. Уточнить пожелания перед началом." if slot == 0 else
                "Постоянный клиент. Предпочитает оплату картой." if slot == 1 else
                "Тестовая запись для проверки журнала."),
        )
        appointment.full_clean()
        appointment.save()
        counts["appointments"] += 1
