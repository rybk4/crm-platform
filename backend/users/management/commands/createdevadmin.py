from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Создаёт суперпользователя для разработки. При DEBUG=false ничего не делает без --force."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=None)
        parser.add_argument("--password", default=None)
        parser.add_argument("--force", action="store_true")

    def handle(self, *args, username=None, password=None, force=False, **options):
        if not settings.DEBUG and not force:
            self.stdout.write("DEBUG=false — суперпользователь не создан (нужен --force).")
            return

        from environ import Env

        env = Env()
        username = username or env("DJANGO_ADMIN_USERNAME", default="admin")
        password = password or env("DJANGO_ADMIN_PASSWORD", default="admin")
        User = get_user_model()

        if User.objects.filter(username=username).exists():
            self.stdout.write(f"Пользователь {username} уже есть — не трогаю.")
            return

        User.objects.create_superuser(username=username, password=password)
        self.stdout.write(self.style.SUCCESS(f"Создан суперпользователь {username}."))
