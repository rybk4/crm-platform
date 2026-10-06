import django.db.models.deletion
import uuid

from django.conf import settings

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("staff", "0003_staff_title_staffprofession_staff_professions_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="staff",
            name="photo_url",
            field=models.URLField(blank=True, verbose_name="Ссылка на фото"),
        ),
        migrations.AddField(
            model_name="staff",
            name="vacation_start",
            field=models.DateField(blank=True, null=True, verbose_name="Начало отпуска"),
        ),
        migrations.AddField(
            model_name="staff",
            name="vacation_end",
            field=models.DateField(blank=True, null=True, verbose_name="Окончание отпуска"),
        ),
        migrations.AddField(
            model_name="staff",
            name="payout_model",
            field=models.CharField(choices=[("percent", "Процент"), ("fixed", "За услугу"), ("salary", "Оклад")], default="percent", max_length=16, verbose_name="Схема выплаты"),
        ),
        migrations.AddField(
            model_name="staff",
            name="payout_value",
            field=models.DecimalField(decimal_places=2, default=40, max_digits=12, verbose_name="Значение выплаты"),
        ),
        migrations.CreateModel(
            name="StaffCertificate",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name="Идентификатор")),
                ("create_date", models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")),
                ("update_date", models.DateTimeField(auto_now=True, verbose_name="Дата обновления")),
                ("row_status", models.SmallIntegerField(choices=[(0, "Активная"), (1, "Изменённая"), (2, "Удалена")], db_index=True, default=0, verbose_name="Статус записи")),
                ("title", models.CharField(max_length=255, verbose_name="Название")),
                ("image_url", models.URLField(verbose_name="Ссылка на изображение")),
                ("issued_at", models.DateField(blank=True, null=True, verbose_name="Дата выдачи")),
                ("position", models.PositiveIntegerField(default=0, verbose_name="Порядок")),
                ("created_user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(app_label)s_%(class)s_created", to=settings.AUTH_USER_MODEL, verbose_name="Кто создал")),
                ("updated_user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(app_label)s_%(class)s_updated", to=settings.AUTH_USER_MODEL, verbose_name="Кто изменил")),
                ("staff", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to="staff.staff", verbose_name="Сотрудник")),
            ],
            options={"verbose_name": "Сертификат сотрудника", "verbose_name_plural": "Сертификаты сотрудников", "ordering": ("position", "create_date")},
        ),
    ]
