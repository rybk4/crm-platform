from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from core.models import BaseMixin, UUIDModel
from core.validators import phone_validator


class Client(UUIDModel, BaseMixin):
    class Gender(models.TextChoices):
        MALE = "male", "Мужской"
        FEMALE = "female", "Женский"

    class Status(models.TextChoices):
        BASIC = "basic", "Обычный"
        VIP = "vip", "VIP"
        BLOCKED = "blocked", "Заблокирован"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="clients")
    first_name = models.CharField("Имя", max_length=80)
    last_name = models.CharField("Фамилия", max_length=80, blank=True)
    middle_name = models.CharField("Отчество", max_length=80, blank=True)
    phone_number = models.CharField("Телефон", max_length=20, validators=[phone_validator])
    email = models.EmailField("Email", blank=True)
    birthday = models.DateField("Дата рождения", blank=True, null=True)
    gender = models.CharField("Пол", max_length=10, choices=Gender.choices, blank=True)
    status = models.CharField("Статус", max_length=10, choices=Status.choices, default=Status.BASIC)
    discount_percent = models.PositiveSmallIntegerField("Скидка, %", blank=True, null=True, validators=[MaxValueValidator(100)])
    height_cm = models.PositiveSmallIntegerField("Рост, см", blank=True, null=True)
    weight_kg = models.DecimalField("Вес, кг", max_digits=5, decimal_places=1, blank=True, null=True)
    note = models.TextField("Заметка", blank=True)
    photo = models.ImageField("Фото", upload_to="client_photos/", blank=True)

    class Meta:
        ordering = ("last_name", "first_name")
        constraints = [models.UniqueConstraint(fields=("organization", "phone_number"), name="client_phone_per_organization")]

    @property
    def full_name(self):
        return " ".join(filter(None, (self.last_name, self.first_name, self.middle_name)))

    def __str__(self):
        return self.full_name or self.phone_number


class PaymentMethod(UUIDModel, BaseMixin):
    class CommissionType(models.TextChoices):
        PERCENT = "percent", "Процент"
        FIXED = "fixed", "Фиксированная"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="payment_methods")
    name = models.CharField("Название", max_length=100)
    commission = models.DecimalField("Комиссия", max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal("0"))])
    commission_type = models.CharField("Тип комиссии", max_length=10, choices=CommissionType.choices, default=CommissionType.PERCENT)
    is_active = models.BooleanField("Активен", default=True)

    class Meta:
        ordering = ("name",)
        constraints = [models.UniqueConstraint(fields=("organization", "name"), name="payment_method_name_per_organization")]

    def __str__(self):
        return self.name


class Deal(UUIDModel, BaseMixin):
    class Status(models.TextChoices):
        OPEN = "open", "Открыта"
        PAID = "paid", "Оплачена"
        CANCELLED = "cancelled", "Отменена"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="deals")
    branch = models.ForeignKey("organizations.Branch", on_delete=models.PROTECT, related_name="deals")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="deals")
    status = models.CharField("Статус", max_length=12, choices=Status.choices, default=Status.OPEN)
    total = models.DecimalField("Сумма", max_digits=12, decimal_places=2, default=0)
    discount = models.DecimalField("Скидка", max_digits=12, decimal_places=2, default=0)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT, related_name="deals", blank=True, null=True)
    payment_date = models.DateTimeField("Дата оплаты", blank=True, null=True)
    comment = models.TextField("Комментарий", blank=True)


class Appointment(UUIDModel, BaseMixin):
    class Status(models.TextChoices):
        PENDING = "pending", "Ожидает"
        CONFIRMED = "confirmed", "Подтверждена"
        COMPLETED = "completed", "Завершена"
        CANCELLED = "cancelled", "Отменена"
        NO_SHOW = "no_show", "Не пришёл"

    class Source(models.TextChoices):
        CRM = "crm", "CRM"
        ONLINE = "online", "Онлайн"
        PHONE = "phone", "Телефон"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="appointments")
    branch = models.ForeignKey("organizations.Branch", on_delete=models.PROTECT, related_name="appointments")
    specialist = models.ForeignKey("staff.Staff", on_delete=models.PROTECT, related_name="appointments")
    service = models.ForeignKey("services.Service", on_delete=models.PROTECT, related_name="appointments")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="appointments")
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, related_name="appointments", blank=True, null=True)
    starts_at = models.DateTimeField("Начало")
    ends_at = models.DateTimeField("Окончание")
    price = models.DecimalField("Цена", max_digits=12, decimal_places=2)
    status = models.CharField("Статус", max_length=12, choices=Status.choices, default=Status.PENDING)
    source = models.CharField("Источник", max_length=10, choices=Source.choices, default=Source.CRM)
    comment = models.TextField("Комментарий", blank=True)

    class Meta:
        ordering = ("starts_at",)
        indexes = [models.Index(fields=("organization", "starts_at")), models.Index(fields=("specialist", "starts_at"))]

    def clean(self):
        if self.ends_at and self.starts_at and self.ends_at <= self.starts_at:
            raise ValidationError({"ends_at": "Окончание должно быть позже начала."})

    @property
    def duration_minutes(self):
        return int((self.ends_at - self.starts_at).total_seconds() // 60)


class Bill(UUIDModel, BaseMixin):
    class BillType(models.TextChoices):
        INCOME = "income", "Доход"
        EXPENSE = "expense", "Расход"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="bills")
    name = models.CharField("Название", max_length=120)
    amount = models.DecimalField("Сумма", max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    description = models.TextField("Описание", blank=True)
    bill_type = models.CharField("Тип", max_length=10, choices=BillType.choices)
    payment_methods = models.ManyToManyField(PaymentMethod, related_name="bills", blank=True)

    class Meta:
        ordering = ("-create_date",)


class LoyaltyProgram(UUIDModel, BaseMixin):
    class Kind(models.TextChoices):
        BONUS = "bonus", "Бонусная карта"
        SUBSCRIPTION = "subscription", "Абонемент"
        CERTIFICATE = "certificate", "Сертификат"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="loyalty_programs")
    kind = models.CharField("Тип", max_length=16, choices=Kind.choices)
    name = models.CharField("Название", max_length=120)
    price = models.DecimalField("Цена", max_digits=12, decimal_places=2, default=0)
    reward_percent = models.DecimalField("Бонус, %", max_digits=5, decimal_places=2, default=0)
    initial_balance = models.DecimalField("Начальный баланс", max_digits=12, decimal_places=2, default=0)
    visits_count = models.PositiveIntegerField("Количество посещений", blank=True, null=True)
    validity_days = models.PositiveIntegerField("Срок, дней", blank=True, null=True)
    services = models.ManyToManyField("services.Service", related_name="loyalty_programs", blank=True)
    excluded_payment_methods = models.ManyToManyField(PaymentMethod, related_name="excluded_loyalty_programs", blank=True)
    is_active = models.BooleanField("Активна", default=True)

    class Meta:
        ordering = ("kind", "name")


class ClientLoyalty(UUIDModel, BaseMixin):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="loyalty_accounts")
    program = models.ForeignKey(LoyaltyProgram, on_delete=models.PROTECT, related_name="client_accounts")
    balance = models.DecimalField("Баланс", max_digits=12, decimal_places=2, default=0)
    remaining_visits = models.PositiveIntegerField("Осталось посещений", blank=True, null=True)
    expires_at = models.DateTimeField("Действует до", blank=True, null=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("client", "program"), name="client_loyalty_program_unique")]


class Campaign(UUIDModel, BaseMixin):
    class Status(models.TextChoices):
        DRAFT = "draft", "Черновик"
        QUEUED = "queued", "В очереди"
        SENT = "sent", "Отправлена"
        FAILED = "failed", "Ошибка"

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="campaigns")
    title = models.CharField("Название", max_length=160)
    message = models.TextField("Сообщение")
    photo = models.ImageField("Изображение", upload_to="campaigns/", blank=True)
    recipients = models.JSONField("Получатели", default=list)
    status = models.CharField("Статус", max_length=10, choices=Status.choices, default=Status.DRAFT)
    total_recipients = models.PositiveIntegerField("Получателей", default=0)
    success_count = models.PositiveIntegerField("Доставлено", default=0)

    class Meta:
        ordering = ("-create_date",)
