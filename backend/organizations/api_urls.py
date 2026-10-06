from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BranchViewSet, CityListView, OrganizationProfileView, OrganizationViewSet


router = DefaultRouter()
router.register("organizations", OrganizationViewSet, basename="organization")
router.register("branches", BranchViewSet, basename="branch")

urlpatterns = [
    path("", include(router.urls)),
    path("cities/", CityListView.as_view(), name="city-list"),
    path("organization/profile/", OrganizationProfileView.as_view(), name="organization-profile"),
]
