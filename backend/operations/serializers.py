from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.db.models import Avg, Sum
from django.utils import timezone
from rest_framework import serializers

from services.models import StaffService
from .models import (
    Appointment, Bill, Campaign, Client, ClientLoyalty, Deal,
    LoyaltyProgram, PaymentMethod,
)


class ClientSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(source="full_name", read_only=True)
    segment = serializers.SerializerMethodField()
    visits_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    average_check = serializers.SerializerMethodField()
    currency = serializers.CharField(source="organization.currency", read_only=True)
    first_visit_at = serializers.SerializerMethodField()
    last_visit_at = serializers.SerializerMethodField()
    recent_visits = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source="create_date", read_only=True)

    class Meta:
        model = Client
        fields = (
            "id", "organization_id", "name", "last_name", "first_name", "middle_name",
            "phone_number", "email", "birthday", "gender", "status", "discount_percent",
            "height_cm", "weight_kg", "note", "segment", "visits_count", "total_spent",
            "average_check", "currency", "first_visit_at", "last_visit_at", "recent_visits",
            "created_at",
        )

    def completed(self, instance):
        return instance.appointments.filter(status=Appointment.Status.COMPLETED)

    def get_visits_count(self, instance):
        return self.completed(instance).count()

    def get_total_spent(self, instance):
        return str(self.completed(instance).aggregate(value=Sum("price"))["value"] or Decimal("0"))

    def get_average_check(self, instance):
        return str(self.completed(instance).aggregate(value=Avg("price"))["value"] or Decimal("0"))

    def get_first_visit_at(self, instance):
        item = self.completed(instance).order_by("starts_at").first()
        return item.starts_at if item else None

    def get_last_visit_at(self, instance):
        item = self.completed(instance).order_by("-starts_at").first()
        return item.starts_at if item else None

    def get_segment(self, instance):
        visits = self.get_visits_count(instance)
        last = self.get_last_visit_at(instance)
        if instance.status == Client.Status.VIP or visits >= 10:
            return "vip"
        if last and last < timezone.now() - timedelta(days=90):
            return "sleeping"
        return "new" if visits <= 1 else "regular"

    def get_recent_visits(self, instance):
        return [
            {"id": item.id, "starts_at": item.starts_at, "service_name": item.service.name, "status": item.status}
            for item in instance.appointments.select_related("service").order_by("-starts_at")[:7]
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    specialist_name = serializers.CharField(source="specialist.full_name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    client_name = serializers.CharField(source="client.full_name", read_only=True)
    client_phone = serializers.CharField(source="client.phone_number", read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    currency = serializers.CharField(source="organization.currency", read_only=True)
    created_at = serializers.DateTimeField(source="create_date", read_only=True)
    deal_status = serializers.CharField(source="deal.status", read_only=True)
    deal_payment_method = serializers.UUIDField(source="deal.payment_method_id", read_only=True)
    deal_discount = serializers.DecimalField(
        source="deal.discount", max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Appointment
        fields = (
            "id", "branch", "branch_name", "specialist", "specialist_name", "service",
            "service_name", "client", "client_name", "client_phone", "deal", "starts_at",
            "ends_at", "duration_minutes", "price", "currency", "status", "source", "comment",
            "created_at", "deal_status", "deal_payment_method", "deal_discount",
        )
        read_only_fields = ("branch", "ends_at", "price", "source", "deal")

    def validate(self, attrs):
        request = self.context["request"]
        organization_id = request.user.organization_id
        specialist = attrs.get("specialist", getattr(self.instance, "specialist", None))
        service = attrs.get("service", getattr(self.instance, "service", None))
        client = attrs.get("client", getattr(self.instance, "client", None))
        if any(item.organization_id != organization_id for item in (specialist, service, client)):
            raise serializers.ValidationError("Связанные записи принадлежат другой организации.")
        starts_at = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        duration = service.duration_minutes
        ends_at = starts_at + timedelta(minutes=duration)
        overlaps = Appointment.objects.filter(
            specialist=specialist,
            starts_at__lt=ends_at,
            ends_at__gt=starts_at,
        ).exclude(status=Appointment.Status.CANCELLED)
        if self.instance:
            overlaps = overlaps.exclude(pk=self.instance.pk)
        if overlaps.exists():
            raise serializers.ValidationError({"starts_at": "В это время у специалиста уже есть запись."})
        attrs["ends_at"] = ends_at
        staff_service = StaffService.objects.filter(staff=specialist, service=service).first()
        attrs["price"] = staff_service.effective_price if staff_service else service.price
        attrs["branch"] = specialist.branch
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        deal = Deal.objects.create(
            organization=request.user.organization,
            branch=validated_data["branch"],
            client=validated_data["client"],
            total=validated_data["price"],
            created_user=request.user,
        )
        return Appointment.objects.create(
            organization=request.user.organization,
            deal=deal,
            created_user=request.user,
            **validated_data,
        )

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        if instance.deal_id:
            instance.deal.total = instance.deal.appointments.aggregate(value=Sum("price"))["value"] or 0
            instance.deal.save(update_fields=["total", "update_date"])
        return instance


class ClientVisitSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name")
    specialist_name = serializers.CharField(source="specialist.full_name")
    duration_minutes = serializers.IntegerField()
    currency = serializers.CharField(source="organization.currency")

    class Meta:
        model = Appointment
        fields = ("id", "starts_at", "service_name", "specialist_name", "duration_minutes", "price", "currency", "status")


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ("id", "name", "commission", "commission_type", "is_active", "create_date", "update_date")


class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ("id", "name", "amount", "description", "bill_type", "payment_methods", "create_date", "update_date")

    def validate_payment_methods(self, values):
        organization_id = self.context["request"].user.organization_id
        if any(value.organization_id != organization_id for value in values):
            raise serializers.ValidationError("Способ оплаты принадлежит другой организации.")
        return values


class DealSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)
    payment_method_name = serializers.CharField(source="payment_method.name", read_only=True)
    client_name = serializers.CharField(source="client.full_name", read_only=True)

    class Meta:
        model = Deal
        fields = ("id", "client", "client_name", "status", "total", "discount", "payment_method", "payment_method_name", "payment_date", "comment", "appointments")

    def validate_payment_method(self, value):
        request = self.context.get("request")
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError("Способ оплаты принадлежит другой организации.")
        return value

    def validate_client(self, value):
        request = self.context.get("request")
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError("Клиент принадлежит другой организации.")
        return value

    def validate(self, attrs):
        total = attrs.get("total", getattr(self.instance, "total", Decimal("0")))
        discount = attrs.get("discount", getattr(self.instance, "discount", Decimal("0")))
        if discount > total:
            raise serializers.ValidationError({"discount": "Скидка не может быть больше суммы."})
        return attrs


class LoyaltyProgramSerializer(serializers.ModelSerializer):
    clients_count = serializers.IntegerField(source="client_accounts.count", read_only=True)

    class Meta:
        model = LoyaltyProgram
        fields = ("id", "kind", "name", "price", "reward_percent", "initial_balance", "visits_count", "validity_days", "services", "excluded_payment_methods", "is_active", "clients_count")

    def validate_services(self, values):
        organization_id = self.context["request"].user.organization_id
        if any(value.organization_id != organization_id for value in values):
            raise serializers.ValidationError("Услуга принадлежит другой организации.")
        return values

    def validate_excluded_payment_methods(self, values):
        organization_id = self.context["request"].user.organization_id
        if any(value.organization_id != organization_id for value in values):
            raise serializers.ValidationError("Способ оплаты принадлежит другой организации.")
        return values


class ClientLoyaltySerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source="program.name", read_only=True)

    class Meta:
        model = ClientLoyalty
        fields = ("id", "client", "program", "program_name", "balance", "remaining_visits", "expires_at")

    def validate(self, attrs):
        organization_id = self.context["request"].user.organization_id
        client = attrs.get("client", getattr(self.instance, "client", None))
        program = attrs.get("program", getattr(self.instance, "program", None))
        if client.organization_id != organization_id or program.organization_id != organization_id:
            raise serializers.ValidationError("Клиент и программа должны принадлежать организации.")
        return attrs


class CampaignSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(source="create_date", read_only=True)
    success_rate = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = ("id", "created_at", "title", "message", "photo", "recipients", "status", "total_recipients", "success_count", "success_rate")
        read_only_fields = ("status", "total_recipients", "success_count")

    def get_success_rate(self, instance):
        return round(instance.success_count * 100 / instance.total_recipients, 1) if instance.total_recipients else 0
