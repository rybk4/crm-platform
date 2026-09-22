import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "admin"


class Command(BaseCommand):
    help = (
        "Создаёт суперпользователя для входа в админку (по умолчанию admin/admin). "
        "Идемпотентна: существующего пользователя не трогает, только доводит права."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            default=os.environ.get("DJANGO_ADMIN_USERNAME", DEFAULT_USERNAME),
        )
        parser.add_argument(
            "--password",
            default=os.environ.get("DJANGO_ADMIN_PASSWORD", DEFAULT_PASSWORD),
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Создать даже при DEBUG=False. По умолчанию команда там ничего не делает.",
        )
        parser.add_argument(
            "--reset-password",
            action="store_true",
            help="Переустановить пароль, если пользователь уже есть.",
        )

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]

        # Пароль по умолчанию слабый, поэтому вне разработки команда молча
        # выходит с успехом: она стоит в цепочке запуска контейнера и не должна
        # ронять его на проде.
        if not settings.DEBUG and not options["force"]:
            self.stdout.write(
                self.style.WARNING(
                    "DEBUG=False — суперпользователь не создаётся. "
                    "Нужен всё равно: manage.py createdevadmin --force --password <свой>."
                )
            )
            return

        if not password:
            raise CommandError("Пароль не может быть пустым.")

        user_model = get_user_model()
        user = user_model.objects.filter(username=username).first()

        if user is None:
            user_model.objects.create_superuser(username, password)
            self.stdout.write(
                self.style.SUCCESS(f"Суперпользователь «{username}» создан, пароль: {password}")
            )
            return

        updated = []
        for field in ("is_staff", "is_superuser", "is_active"):
            if not getattr(user, field):
                setattr(user, field, True)
                updated.append(field)

        if options["reset_password"]:
            user.set_password(password)
            updated.append("password")

        if updated:
            user.save(update_fields=updated)
            self.stdout.write(
                self.style.SUCCESS(f"Пользователь «{username}» обновлён: {', '.join(updated)}.")
            )
        else:
            self.stdout.write(f"Пользователь «{username}» уже есть, изменений не нужно.")
