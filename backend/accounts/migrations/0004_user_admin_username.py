import django.core.validators
from django.db import migrations, models


def populate_usernames(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    for user in User.objects.all().iterator():
        phone_suffix = (user.phone_number or str(user.pk)).lstrip("+")
        user.username = f"phone_{phone_suffix}"
        user.save(update_fields=["username"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_alter_user_phone_number"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="username",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.RunPython(populate_usernames, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=150, unique=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="phone_number",
            field=models.CharField(
                blank=True,
                max_length=16,
                null=True,
                unique=True,
                validators=[
                    django.core.validators.RegexValidator(
                        message="Введите номер в международном формате, например +77001234567.",
                        regex=r"^\+[1-9]\d{7,14}$",
                    )
                ],
            ),
        ),
    ]
