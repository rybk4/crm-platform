from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/users/", include("users.urls")),
    path("api/", include("organizations.urls")),
    path("api/", include("specialists.urls")),
    path("api/", include("services.urls")),
]
