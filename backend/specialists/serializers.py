from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from organizations.models import accessible_organizations

from .models import Specialist, SpecialistCertificate, WorkSchedule


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialistCertificate
        fields = ("id", "title", "image_url", "issued_at", "position")
        read_only_fields = ("id",)


class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = (
            "id",
            "weekday",
            "is_day_off",
            "start_time",
            "end_time",
            "break_start",
            "break_end",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        instance = WorkSchedule(**attrs)
        try:
            instance.clean()
        except Exception as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict) from exc
            raise serializers.ValidationError(exc.messages) from exc
        return attrs


class SpecialistSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    organization_id = serializers.IntegerField(source="branch.organization_id", read_only=True)
    organization_name = serializers.CharField(source="branch.organization.name", read_only=True)
    full_name = serializers.CharField(read_only=True)
    services_count = serializers.IntegerField(read_only=True)
    certificates = CertificateSerializer(many=True, required=False)
    schedule = WorkScheduleSerializer(many=True, required=False)

    class Meta:
        model = Specialist
        fields = (
            "id",
            "branch",
            "branch_name",
            "organization_id",
            "organization_name",
            "first_name",
            "last_name",
            "middle_name",
            "full_name",
            "job_title",
            "phone_number",
            "photo_url",
            "bio",
            "is_active",
            "services_count",
            "certificates",
            "schedule",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "branch_name",
            "organization_id",
            "organization_name",
            "full_name",
            "services_count",
            "created_at",
            "updated_at",
        )

    def validate_branch(self, branch):
        request = self.context["request"]
        if not accessible_organizations(request.user).filter(pk=branch.organization_id).exists():
            raise serializers.ValidationError(_("Филиал недоступен текущему пользователю."))
        return branch

    def validate_schedule(self, schedule):
        weekdays = [item["weekday"] for item in schedule]
        if len(weekdays) != len(set(weekdays)):
            raise serializers.ValidationError(_("День недели можно указать только один раз."))
        return schedule

    @staticmethod
    def _replace_nested(specialist, certificates, schedule):
        if certificates is not None:
            specialist.certificates.all().delete()
            SpecialistCertificate.objects.bulk_create(
                [SpecialistCertificate(specialist=specialist, **item) for item in certificates]
            )
        if schedule is not None:
            specialist.schedule.all().delete()
            WorkSchedule.objects.bulk_create(
                [WorkSchedule(specialist=specialist, **item) for item in schedule]
            )

    @transaction.atomic
    def create(self, validated_data):
        certificates = validated_data.pop("certificates", [])
        schedule = validated_data.pop("schedule", [])
        specialist = Specialist.objects.create(**validated_data)
        self._replace_nested(specialist, certificates, schedule)
        return specialist

    @transaction.atomic
    def update(self, instance, validated_data):
        certificates = validated_data.pop("certificates", None)
        schedule = validated_data.pop("schedule", None)
        specialist = super().update(instance, validated_data)
        self._replace_nested(specialist, certificates, schedule)
        return specialist
