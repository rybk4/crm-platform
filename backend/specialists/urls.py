from rest_framework.routers import DefaultRouter

from .views import SpecialistViewSet


router = DefaultRouter()
router.register("specialists", SpecialistViewSet, basename="specialist")

urlpatterns = router.urls
