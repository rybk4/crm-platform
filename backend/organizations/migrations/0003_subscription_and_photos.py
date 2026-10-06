import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("organizations", "0002_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(model_name="organization", name="subscription_started_at", field=models.DateTimeField(blank=True, null=True, verbose_name="Подписка началась")),
        migrations.AddField(model_name="organization", name="subscription_expires_at", field=models.DateTimeField(blank=True, null=True, verbose_name="Подписка истекает")),
        migrations.CreateModel(
            name="OrganizationPhoto",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name="Идентификатор")),
                ("create_date", models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")),
                ("update_date", models.DateTimeField(auto_now=True, verbose_name="Дата обновления")),
                ("row_status", models.SmallIntegerField(choices=[(0, "Активная"), (1, "Изменённая"), (2, "Удалена")], db_index=True, default=0, verbose_name="Статус записи")),
                ("image", models.ImageField(upload_to="organization_photos/", verbose_name="Фотография")),
                ("position", models.PositiveSmallIntegerField(default=0, verbose_name="Порядок")),
                ("created_user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(app_label)s_%(class)s_created", to=settings.AUTH_USER_MODEL, verbose_name="Кто создал")),
                ("updated_user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(app_label)s_%(class)s_updated", to=settings.AUTH_USER_MODEL, verbose_name="Кто изменил")),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="photos", to="organizations.organization", verbose_name="Организация")),
            ],
            options={"verbose_name": "Фотография организации", "verbose_name_plural": "Фотографии организации", "ordering": ("position", "create_date")},
        ),
    ]
