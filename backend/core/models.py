import uuid

from django.conf import settings
from django.db import models


class RowStatus(models.IntegerChoices):
    ACTIVE = 0, "Активная"
    UPDATED = 1, "Изменённая"
    DELETED = 2, "Удалена"


class UUIDModel(models.Model):
    """UUID вместо числового id — как во всех моделях ana-partners."""

    id = models.UUIDField("Идентификатор", primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        """Массовое удаление тоже мягкое: записи получают статус «Удалена»."""
        return self.update(row_status=RowStatus.DELETED)

    def hard_delete(self):
        return super().delete()


class ActiveManager(models.Manager.from_queryset(SoftDeleteQuerySet)):
    """Менеджер по умолчанию: удалённые записи в выборки не попадают."""

    def get_queryset(self):
        return super().get_queryset().exclude(row_status=RowStatus.DELETED)


class AllManager(models.Manager.from_queryset(SoftDeleteQuerySet)):
    """Все записи, включая удалённые, — для админки и восстановления."""


class BaseMixin(models.Model):
    """
    Основа всех моделей CRM (повторяет BaseMixin из ana-partners).

    - create_date / update_date — когда создана и изменена запись;
    - row_status — 0 активная, 1 изменённая, 2 удалена;
    - created_user / updated_user — кто создал и кто изменил;
    - delete() не удаляет строку, а ставит row_status = 2.
    """

    create_date = models.DateTimeField("Дата создания", auto_now_add=True)
    update_date = models.DateTimeField("Дата обновления", auto_now=True)
    row_status = models.SmallIntegerField(
        "Статус записи", choices=RowStatus.choices, default=RowStatus.ACTIVE, db_index=True
    )
    created_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_created",
        verbose_name="Кто создал",
    )
    updated_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_updated",
        verbose_name="Кто изменил",
    )

    objects = ActiveManager()
    all_objects = AllManager()

    class Meta:
        abstract = True
        base_manager_name = "all_objects"

    def delete(self, using=None, keep_parents=False):
        """Мягкое удаление: запись остаётся в базе со статусом «Удалена»."""
        self.row_status = RowStatus.DELETED
        self.save(update_fields=["row_status", "update_date"])

    def hard_delete(self):
        return super().delete()

    def restore(self):
        self.row_status = RowStatus.ACTIVE
        self.save(update_fields=["row_status", "update_date"])

    def update(self, **fields):
        """Меняет поля и сохраняет запись одним вызовом."""
        for name, value in fields.items():
            setattr(self, name, value)
        self.save()

    @property
    def is_deleted(self):
        return self.row_status == RowStatus.DELETED

    @classmethod
    def get_active(cls):
        return cls.objects.all()
