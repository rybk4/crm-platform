from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnalyticsSummaryView, AppointmentViewSet, BillViewSet, CampaignViewSet,
    ClientLoyaltyViewSet, ClientViewSet, DealViewSet, LoyaltyProgramViewSet,
    PaymentMethodViewSet,
)


router = DefaultRouter()
router.register("clients", ClientViewSet, basename="client")
router.register("appointments", AppointmentViewSet, basename="appointment")
router.register("deals", DealViewSet, basename="deal")
router.register("bills", BillViewSet, basename="bill")
router.register("payment-methods", PaymentMethodViewSet, basename="payment-method")
router.register("loyalty/programs", LoyaltyProgramViewSet, basename="loyalty-program")
router.register("loyalty/accounts", ClientLoyaltyViewSet, basename="loyalty-account")
router.register("campaigns", CampaignViewSet, basename="campaign")

urlpatterns = [
    path("", include(router.urls)),
    path("analytics/summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),
]
