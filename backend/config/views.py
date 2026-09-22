from django.db import connection
from django.http import JsonResponse
from django.views.decorators.cache import never_cache


def _check_database():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return False
    return True


@never_cache
def health(request):
    """Проверка готовности сервиса.

    Открыта без авторизации: её опрашивают docker healthcheck и фронтенд,
    когда показывает плашку «сервер недоступен». Отдаёт 503, если упала
    зависимость, без которой запросы всё равно не обслужить.
    """
    checks = {"database": "ok" if _check_database() else "error"}
    healthy = all(status == "ok" for status in checks.values())

    return JsonResponse(
        {"status": "ok" if healthy else "error", "checks": checks},
        status=200 if healthy else 503,
    )


@never_cache
def liveness(request):
    """Проверка живости процесса: отвечает всегда, пока WSGI-воркер жив.

    Нужна отдельно от health, чтобы оркестратор не перезапускал контейнер
    из-за недоступной базы — это лечится не рестартом приложения.
    """
    return JsonResponse({"status": "ok"})
