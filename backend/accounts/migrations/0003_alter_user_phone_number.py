import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_profile_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="phone_number",
            field=models.CharField(
                max_length=16,
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
