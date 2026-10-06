from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import health, liveness


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/health/live/", liveness, name="liveness"),
    path("api/", include("users.api_urls")),
    path("api/", include("organizations.api_urls")),
    path("api/", include("staff.api_urls")),
    path("api/", include("services.api_urls")),
    path("api/", include("operations.api_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
