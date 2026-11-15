from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.migrations.exceptions import InconsistentMigrationHistory
from django.db.migrations.loader import MigrationLoader
from django.utils import timezone


class Command(BaseCommand):
    help = (
        "migrate для разработки. Если история миграций в базе не сходится с кодом "
        "(миграции пересоздали), при DEBUG=true откладывает старую схему public "
        "в stale_<время> и накатывает миграции на чистую. При DEBUG=false — обычный migrate."
    )

    def handle(self, *args, **options):
        if settings.DEBUG and connection.vendor == "postgresql":
            try:
                MigrationLoader(connection).check_consistent_history(connection)
            except InconsistentMigrationHistory as exc:
                self._stash_schema(exc)

        call_command("migrate", interactive=False)

    def _stash_schema(self, exc):
        stale = f"stale_{timezone.now():%Y%m%d_%H%M%S}"
        self.stdout.write(self.style.WARNING(f"История миграций не сходится с кодом: {exc}"))
        with connection.cursor() as cursor:
            cursor.execute(f'ALTER SCHEMA public RENAME TO "{stale}"')
            cursor.execute("CREATE SCHEMA public")
        self.stdout.write(
            self.style.WARNING(
                f"Старые таблицы перенесены в схему {stale}, база начата заново. "
                f'Удалить: DROP SCHEMA "{stale}" CASCADE;'
            )
        )
