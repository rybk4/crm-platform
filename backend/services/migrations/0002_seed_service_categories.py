from django.db import migrations


# Стартовый справочник категорий. Код стабилен, название можно править в админке.
CATEGORIES = [
    ("hair", "Волосы"),
    ("nails", "Ногти"),
    ("brows_lashes", "Брови и ресницы"),
    ("face", "Лицо"),
    ("makeup", "Макияж"),
    ("massage", "Массаж и тело"),
    ("epilation", "Эпиляция"),
    ("other", "Другое"),
]


def seed(apps, schema_editor):
    ServiceCategory = apps.get_model("services", "ServiceCategory")
    for position, (code, name) in enumerate(CATEGORIES, start=1):
        ServiceCategory.objects.update_or_create(
            code=code, defaults={"name": name, "position": position * 10}
        )


def unseed(apps, schema_editor):
    ServiceCategory = apps.get_model("services", "ServiceCategory")
    ServiceCategory.objects.filter(code__in=[code for code, _ in CATEGORIES]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("services", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
