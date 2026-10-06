from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from core.models import BaseMixin, UUIDModel
from core.validators import phone_validator
from organizations.models import Branch, Organization
from professions.models import Profession


class Staff(UUIDModel, BaseMixin):
    """
    Специалист (сотрудник) — по модели Staff из ana-partners.

    Убраны: online_appointment, salary, last_visit, date_created, login, slug,
    rating / ratings_count. Добавлены: branch, is_active и title.
    Профессии берутся из общего справочника, а не заводятся каждым салоном.
    """

    name = models.CharField("Имя", max_length=50)
    surname = models.CharField("Фамилия", max_length=50, blank=True)
    patronymic = models.CharField("Отчество", max_length=50, blank=True)
    phone = models.CharField(
        "Номер телефона", max_length=20, blank=True, validators=[phone_validator]
    )
    career_start_date = models.DateField("Начало карьеры", blank=True, null=True)
    title = models.CharField(
        "Должность в салоне",
        max_length=100,
        blank=True,
        help_text="Своё название: «Топ-стилист», «Старший мастер». Профессии — из справочника.",
    )
    bio = models.TextField("О специалисте", blank=True)
    photo = models.ImageField("Фото", upload_to="staff_photos/", blank=True)
    photo_url = models.URLField("Ссылка на фото", blank=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="staff",
        verbose_name="Организация",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="staff",
        verbose_name="Филиал",
    )
    professions = models.ManyToManyField(
        Profession,
        through="StaffProfession",
        related_name="staff",
        blank=True,
        verbose_name="Профессии",
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff",
        verbose_name="Аккаунт",
    )
    is_active = models.BooleanField(
        "Работает",
        default=True,
        help_text="Снимите, если сотрудник уволен или не работает. Удаление — это row_status.",
    )
    vacation_start = models.DateField("Начало отпуска", blank=True, null=True)
    vacation_end = models.DateField("Окончание отпуска", blank=True, null=True)
    payout_model = models.CharField(
        "Схема выплаты",
        max_length=16,
        choices=(("percent", "Процент"), ("fixed", "За услугу"), ("salary", "Оклад")),
        default="percent",
    )
    payout_value = models.DecimalField("Значение выплаты", max_digits=12, decimal_places=2, default=40)

    class Meta:
        verbose_name = "Сотрудник"
        verbose_name_plural = "Сотрудники"
        ordering = ("surname", "name")

    def __str__(self):
        return self.full_name

    @property
    def full_name(self):
        return " ".join(filter(None, (self.surname, self.name, self.patronymic)))

    @property
    def primary_profession(self):
        link = self.staff_professions.filter(is_primary=True).select_related("profession").first()
        return link.profession if link else None

    def clean(self):
        super().clean()
        if self.branch_id and self.organization_id and self.branch.organization_id != self.organization_id:
            raise ValidationError({"branch": "Филиал должен принадлежать организации сотрудника."})


class StaffCertificate(UUIDModel, BaseMixin):
    staff = models.ForeignKey(
        Staff, on_delete=models.CASCADE, related_name="certificates", verbose_name="Сотрудник"
    )
    title = models.CharField("Название", max_length=255)
    image_url = models.URLField("Ссылка на изображение")
    issued_at = models.DateField("Дата выдачи", blank=True, null=True)
    position = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ("position", "create_date")
        verbose_name = "Сертификат сотрудника"
        verbose_name_plural = "Сертификаты сотрудников"


class StaffProfession(UUIDModel, BaseMixin):
    """
    Профессия сотрудника. Одна из них может быть основной — её видно на карточке.

    Удаление здесь настоящее: это связь, а не запись с историей. Мягко удалённая
    связь продолжала бы показываться в staff.professions и мешала бы добавить
    ту же профессию снова.
    """

    staff = models.ForeignKey(
        Staff, on_delete=models.CASCADE, related_name="staff_professions", verbose_name="Сотрудник"
    )
    profession = models.ForeignKey(
        Profession,
        on_delete=models.PROTECT,
        related_name="staff_links",
        verbose_name="Профессия",
    )
    is_primary = models.BooleanField("Основная", default=False)

    objects = models.Manager()
    all_objects = models.Manager()

    class Meta:
        verbose_name = "Профессия сотрудника"
        verbose_name_plural = "Профессии сотрудников"
        constraints = [
            models.UniqueConstraint(fields=("staff", "profession"), name="staff_profession_unique"),
            models.UniqueConstraint(
                fields=("staff",),
                condition=models.Q(is_primary=True),
                name="staff_single_primary_profession",
            ),
        ]

    def __str__(self):
        return f"{self.staff} — {self.profession}"

    def delete(self, using=None, keep_parents=False):
        return self.hard_delete()
