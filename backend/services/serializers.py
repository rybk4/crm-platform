from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from organizations.models import accessible_organizations

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    specialist_name = serializers.CharField(source="specialist.full_name", read_only=True)
    branch_id = serializers.IntegerField(source="specialist.branch_id", read_only=True)
    branch_name = serializers.CharField(source="specialist.branch.name", read_only=True)
    organization_id = serializers.IntegerField(
        source="specialist.branch.organization_id", read_only=True
    )

    class Meta:
        model = Service
        fields = (
            "id",
            "specialist",
            "specialist_name",
            "branch_id",
            "branch_name",
            "organization_id",
            "name",
            "description",
            "duration_minutes",
            "price",
            "currency",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "specialist_name",
            "branch_id",
            "branch_name",
            "organization_id",
            "created_at",
            "updated_at",
        )

    def validate_specialist(self, specialist):
        request = self.context["request"]
        organization_id = specialist.branch.organization_id
        if not accessible_organizations(request.user).filter(pk=organization_id).exists():
            raise serializers.ValidationError(_("Специалист недоступен текущему пользователю."))
        return specialist
