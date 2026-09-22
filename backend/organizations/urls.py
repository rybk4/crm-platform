from rest_framework.routers import DefaultRouter

from .views import BranchViewSet, OrganizationViewSet


router = DefaultRouter()
router.register("organizations", OrganizationViewSet, basename="organization")
router.register("branches", BranchViewSet, basename="branch")

urlpatterns = router.urls
