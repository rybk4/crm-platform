from django.db import migrations


# Стартовый справочник. Код — стабильный идентификатор, название можно править в админке.
PROFESSIONS = [
    ("hair_stylist", "Парикмахер-стилист"),
    ("colorist", "Колорист"),
    ("barber", "Барбер"),
    ("nail_master", "Мастер маникюра"),
    ("pedicure_master", "Мастер педикюра"),
    ("brow_master", "Бровист"),
    ("lash_maker", "Лэшмейкер"),
    ("makeup_artist", "Визажист"),
    ("cosmetologist", "Косметолог"),
    ("massage_therapist", "Массажист"),
    ("epilation_master", "Мастер эпиляции"),
    ("administrator", "Администратор"),
]


def seed(apps, schema_editor):
    Profession = apps.get_model("professions", "Profession")
    for position, (code, name) in enumerate(PROFESSIONS, start=1):
        Profession.objects.update_or_create(
            code=code, defaults={"name": name, "position": position * 10}
        )


def unseed(apps, schema_editor):
    Profession = apps.get_model("professions", "Profession")
    Profession.objects.filter(code__in=[code for code, _ in PROFESSIONS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("professions", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
