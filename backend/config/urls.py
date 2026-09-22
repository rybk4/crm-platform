from django.contrib import admin
from django.urls import include, path

from .views import health, liveness


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/health/live/", liveness, name="liveness"),
    path("api/auth/", include("accounts.urls")),
    path("api/users/", include("users.urls")),
    path("api/", include("organizations.urls")),
    path("api/", include("specialists.urls")),
    path("api/", include("services.urls")),
]
