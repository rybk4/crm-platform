from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="name",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="user",
            name="locale",
            field=models.CharField(
                choices=[("ru", "Русский"), ("en", "English"), ("kk", "Қазақша")],
                default="ru",
                max_length=2,
            ),
        ),
    ]
