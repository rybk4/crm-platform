from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("organizations", "0002_initial"),
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="locale",
            field=models.CharField(default="ru", max_length=2, verbose_name="Язык интерфейса"),
        ),
        migrations.AddField(
            model_name="user",
            name="active_branch",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="active_users",
                to="organizations.branch",
                verbose_name="Активный филиал",
            ),
        ),
    ]
