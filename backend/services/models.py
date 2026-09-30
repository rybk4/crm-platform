from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from core.models import BaseMixin, RowStatus, UUIDModel
from organizations.models import Organization
from staff.models import Staff


not_deleted = ~models.Q(row_status=RowStatus.DELETED)


class ServiceCategory(UUIDModel, BaseMixin):
    """
    Общий справочник категорий («Волосы», «Ногти»…), как и профессии.

    В ana-partners категории заводит каждый салон, а slug у них уникален
    на всю систему — второй салон с категорией «Маникюр» получает ошибку.
    """

    name = models.CharField("Название", max_length=100, unique=True)
    code = models.SlugField("Код", max_length=50, unique=True)
    position = models.PositiveSmallIntegerField("Порядок в списке", default=0)

    class Meta:
        verbose_name = "Категория услуг"
        verbose_name_plural = "Категории услуг"
        ordering = ("position", "name")

    def __str__(self):
        return self.name


def validate_price_range(price, price_max, field="price_max"):
    if price is not None and price_max is not None and price_max < price:
        raise ValidationError({field: "Верхняя граница цены не может быть меньше нижней."})


class Service(UUIDModel, BaseMixin):
    """
    Услуга салона: у каждой организации свой список, свои названия и цены.

    Цена и длительность здесь — значения по умолчанию; у конкретного мастера
    их можно переопределить в StaffService.
    """

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="services",
        verbose_name="Организация",
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="services",
        verbose_name="Категория",
    )
    name = models.CharField("Название", max_length=150)
    description = models.TextField("Описание", blank=True)
    duration_minutes = models.PositiveIntegerField(
        "Длительность, мин", validators=[MinValueValidator(5)]
    )
    price = models.DecimalField(
        "Цена", max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))]
    )
    price_max = models.DecimalField(
        "Цена до",
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Заполните, если цена «от … до». Пусто — фиксированная цена.",
    )
    staff = models.ManyToManyField(
        Staff,
        through="StaffService",
        related_name="services",
        blank=True,
        verbose_name="Мастера",
    )
    is_active = models.BooleanField(
        "Доступна для записи",
        default=True,
        help_text="Снимите, чтобы временно убрать услугу, не удаляя её.",
    )

    class Meta:
        verbose_name = "Услуга"
        verbose_name_plural = "Услуги"
        ordering = ("category__position", "name")
        constraints = [
            # Уникально только среди не удалённых: удалённую услугу можно завести заново.
            models.UniqueConstraint(
                fields=("organization", "name"),
                condition=not_deleted,
                name="service_unique_name_in_organization",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def currency(self):
        return self.organization.currency

    def clean(self):
        super().clean()
        validate_price_range(self.price, self.price_max)


class StaffService(UUIDModel, BaseMixin):
    """
    Услуга в работе у конкретного мастера (в ana-partners — StaffServices).

    Пустые цена и длительность означают «как в услуге»: салон меняет базовую
    цену в одном месте, и она подтягивается ко всем мастерам без своей цены.
    Удаление настоящее — по той же причине, что у StaffProfession.
    """

    staff = models.ForeignKey(
        Staff, on_delete=models.CASCADE, related_name="staff_services", verbose_name="Мастер"
    )
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name="staff_services", verbose_name="Услуга"
    )
    duration_minutes = models.PositiveIntegerField(
        "Своя длительность, мин", blank=True, null=True, validators=[MinValueValidator(5)]
    )
    price = models.DecimalField(
        "Своя цена",
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal("0"))],
    )
    price_max = models.DecimalField(
        "Своя цена до",
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal("0"))],
    )

    objects = models.Manager()
    all_objects = models.Manager()

    class Meta:
        verbose_name = "Услуга мастера"
        verbose_name_plural = "Услуги мастеров"
        constraints = [
            models.UniqueConstraint(fields=("staff", "service"), name="staff_service_unique"),
        ]

    def __str__(self):
        return f"{self.staff} — {self.service}"

    def delete(self, using=None, keep_parents=False):
        return self.hard_delete()

    @property
    def effective_duration_minutes(self):
        return self.duration_minutes or self.service.duration_minutes

    @property
    def effective_price(self):
        return self.price if self.price is not None else self.service.price

    @property
    def effective_price_max(self):
        """Своя «цена до» есть только вместе со своей ценой, иначе берём из услуги."""
        return self.price_max if self.price is not None else self.service.price_max

    def clean(self):
        super().clean()
        if (
            self.staff_id
            and self.service_id
            and self.staff.organization_id != self.service.organization_id
        ):
            raise ValidationError({"service": "Услуга должна быть из организации мастера."})
        if self.price_max is not None and self.price is None:
            raise ValidationError({"price_max": "Укажите свою цену, прежде чем задавать «цену до»."})
        validate_price_range(self.price, self.price_max)
