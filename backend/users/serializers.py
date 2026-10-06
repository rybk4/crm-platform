from rest_framework import serializers

from organizations.models import Branch
from .models import User


class ActiveBranchSerializer(serializers.ModelSerializer):
    organization = serializers.UUIDField(source="organization_id")
    organization_name = serializers.CharField(source="organization.name")

    class Meta:
        model = Branch
        fields = ("id", "name", "address", "organization", "organization_name")


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    phone_number = serializers.CharField(source="phone")
    active_branch_details = ActiveBranchSerializer(source="active_branch", read_only=True)
    subscription_started_at = serializers.DateTimeField(
        source="organization.subscription_started_at", read_only=True
    )
    subscription_expires_at = serializers.DateTimeField(
        source="organization.subscription_expires_at", read_only=True
    )

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "phone_number",
            "locale",
            "active_branch",
            "active_branch_details",
            "is_staff",
            "date_joined",
            "subscription_started_at",
            "subscription_expires_at",
        )
        read_only_fields = ("id", "phone_number", "is_staff", "date_joined")

    def get_name(self, instance):
        return instance.get_full_name() or instance.username

    def validate_locale(self, value):
        if value not in {"ru", "en", "kk"}:
            raise serializers.ValidationError("Неподдерживаемый язык.")
        return value

    def validate_active_branch(self, value):
        user = self.instance
        if value and user.organization_id and value.organization_id != user.organization_id:
            raise serializers.ValidationError("Филиал принадлежит другой организации.")
        return value

    def update(self, instance, validated_data):
        name = self.initial_data.get("name")
        if isinstance(name, str):
            parts = name.strip().split(maxsplit=1)
            instance.first_name = parts[0] if parts else ""
            instance.last_name = parts[1] if len(parts) > 1 else ""
        return super().update(instance, validated_data)
