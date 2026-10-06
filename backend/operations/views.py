from datetime import timedelta
from decimal import Decimal
import json
from urllib import error as urlerror
from urllib import request as urlrequest

from django.conf import settings
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import decorators, response, status, viewsets
from rest_framework.views import APIView

from .models import Appointment, Bill, Campaign, Client, ClientLoyalty, Deal, LoyaltyProgram, PaymentMethod
from .serializers import (
    AppointmentSerializer, BillSerializer, CampaignSerializer, ClientLoyaltySerializer,
    ClientSerializer, ClientVisitSerializer, DealSerializer, LoyaltyProgramSerializer,
    PaymentMethodSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    organization_field = "organization_id"

    def get_queryset(self):
        return self.queryset.filter(**{self.organization_field: self.request.user.organization_id})

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization, created_user=self.request.user)

    def perform_destroy(self, instance):
        instance.updated_user = self.request.user
        instance.delete()


class ClientViewSet(OrganizationViewSet):
    queryset = Client.objects.select_related("organization")
    serializer_class = ClientSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_value = self.request.query_params.get("status")
        service = self.request.query_params.get("service")
        visit_date = self.request.query_params.get("visit_date")
        if status_value:
            queryset = queryset.filter(status=status_value)
        if service:
            queryset = queryset.filter(appointments__service_id=service)
        if visit_date:
            queryset = queryset.filter(appointments__starts_at__date=visit_date)
        return queryset.distinct()

    @decorators.action(detail=True, methods=["get"])
    def visits(self, request, pk=None):
        client = self.get_object()
        visits = client.appointments.select_related("service", "specialist", "organization").order_by("-starts_at")
        return response.Response(ClientVisitSerializer(visits, many=True).data)


class AppointmentViewSet(OrganizationViewSet):
    queryset = Appointment.objects.select_related("organization", "branch", "specialist", "service", "client", "deal")
    serializer_class = AppointmentSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        for parameter, field in (("specialist", "specialist_id"), ("status", "status"), ("client", "client_id")):
            value = self.request.query_params.get(parameter)
            if value:
                queryset = queryset.filter(**{field: value})
        date = self.request.query_params.get("date")
        if date:
            queryset = queryset.filter(starts_at__date=date)
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            queryset = queryset.filter(starts_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(starts_at__date__lte=date_to)
        return queryset


class PaymentMethodViewSet(OrganizationViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer


class BillViewSet(OrganizationViewSet):
    queryset = Bill.objects.prefetch_related("payment_methods")
    serializer_class = BillSerializer


class DealViewSet(OrganizationViewSet):
    queryset = Deal.objects.select_related("client", "payment_method").prefetch_related("appointments__service", "appointments__specialist")
    serializer_class = DealSerializer

    @decorators.action(detail=True, methods=["patch"])
    def close(self, request, pk=None):
        deal = self.get_object()
        serializer = DealSerializer(deal, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data.get("payment_method", deal.payment_method):
            return response.Response(
                {"payment_method": ["Выберите способ оплаты."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save(status=Deal.Status.PAID, payment_date=request.data.get("payment_date") or timezone.now())
        deal.appointments.update(status=Appointment.Status.COMPLETED)
        return response.Response(DealSerializer(deal).data)


class LoyaltyProgramViewSet(OrganizationViewSet):
    queryset = LoyaltyProgram.objects.prefetch_related("services", "excluded_payment_methods", "client_accounts")
    serializer_class = LoyaltyProgramSerializer


class ClientLoyaltyViewSet(viewsets.ModelViewSet):
    serializer_class = ClientLoyaltySerializer
    queryset = ClientLoyalty.objects.select_related("client", "program")

    def get_queryset(self):
        return self.queryset.filter(client__organization_id=self.request.user.organization_id)


class CampaignViewSet(OrganizationViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

    def perform_create(self, serializer):
        recipients = serializer.validated_data.get("recipients", [])
        delivery_status = Campaign.Status.QUEUED
        success_count = 0
        if settings.CRM_CAMPAIGN_WEBHOOK_URL:
            payload = json.dumps(
                {
                    "title": serializer.validated_data["title"],
                    "message": serializer.validated_data["message"],
                    "recipients": recipients,
                }
            ).encode()
            headers = {"Content-Type": "application/json"}
            if settings.CRM_CAMPAIGN_WEBHOOK_TOKEN:
                headers["Authorization"] = f"Bearer {settings.CRM_CAMPAIGN_WEBHOOK_TOKEN}"
            webhook_request = urlrequest.Request(
                settings.CRM_CAMPAIGN_WEBHOOK_URL,
                data=payload,
                headers=headers,
                method="POST",
            )
            try:
                with urlrequest.urlopen(webhook_request, timeout=10) as webhook_response:
                    response_payload = json.loads(webhook_response.read() or b"{}")
                delivery_status = Campaign.Status.SENT
                success_count = int(response_payload.get("success_count", len(recipients)))
            except (OSError, ValueError, urlerror.URLError):
                delivery_status = Campaign.Status.FAILED
        serializer.save(
            organization=self.request.user.organization,
            created_user=self.request.user,
            status=delivery_status,
            total_recipients=len(recipients),
            success_count=min(success_count, len(recipients)),
        )


class AnalyticsSummaryView(APIView):
    def get(self, request):
        try:
            period = int(request.query_params.get("period", 30))
        except ValueError:
            period = 30
        period = period if period in {7, 30, 90} else 30
        end = timezone.now()
        start = end - timedelta(days=period)
        previous_start = start - timedelta(days=period)
        current = Appointment.objects.filter(organization=request.user.organization, starts_at__gte=start, starts_at__lt=end)
        previous = Appointment.objects.filter(organization=request.user.organization, starts_at__gte=previous_start, starts_at__lt=start)

        def metrics(queryset):
            completed = queryset.filter(status=Appointment.Status.COMPLETED)
            revenue = completed.aggregate(value=Sum("price"))["value"] or Decimal("0")
            count = queryset.count()
            return revenue, count, revenue / completed.count() if completed.count() else Decimal("0")

        revenue, appointments, average = metrics(current)
        previous_revenue, previous_appointments, previous_average = metrics(previous)
        new_clients = Client.objects.filter(organization=request.user.organization, create_date__gte=start).count()
        previous_clients = Client.objects.filter(organization=request.user.organization, create_date__gte=previous_start, create_date__lt=start).count()
        daily = current.filter(status=Appointment.Status.COMPLETED).annotate(date=TruncDate("starts_at")).values("date").annotate(value=Sum("price")).order_by("date")
        status_breakdown = current.values("status").annotate(count=Count("id")).order_by("status")
        top_services = current.filter(status=Appointment.Status.COMPLETED).values("service_id", "service__name").annotate(appointments_count=Count("id"), revenue=Sum("price")).order_by("-revenue")[:8]
        loads = current.values("specialist_id", "specialist__name", "specialist__surname").annotate(booked=Sum("service__duration_minutes"), revenue=Sum("price")).order_by("-booked")
        payload = {
            "period_days": period, "currency": request.user.organization.currency,
            "revenue": {"value": float(revenue), "previous": float(previous_revenue)},
            "appointments": {"value": appointments, "previous": previous_appointments},
            "new_clients": {"value": new_clients, "previous": previous_clients},
            "average_check": {"value": float(average), "previous": float(previous_average)},
            "load_percent": {"value": 0, "previous": 0},
            "cancel_rate": {"value": round(current.filter(status=Appointment.Status.CANCELLED).count() * 100 / appointments, 1) if appointments else 0, "previous": 0},
            "revenue_by_day": [{"date": str(item["date"]), "value": float(item["value"])} for item in daily],
            "specialist_load": [{"specialist_id": item["specialist_id"], "specialist_name": f'{item["specialist__surname"]} {item["specialist__name"]}'.strip(), "booked_minutes": item["booked"] or 0, "available_minutes": period * 480, "load_percent": round((item["booked"] or 0) * 100 / (period * 480), 1), "revenue": str(item["revenue"] or 0)} for item in loads],
            "top_services": [{"service_id": item["service_id"], "service_name": item["service__name"], "appointments_count": item["appointments_count"], "revenue": str(item["revenue"] or 0)} for item in top_services],
            "status_breakdown": list(status_breakdown),
        }
        return response.Response(payload)
