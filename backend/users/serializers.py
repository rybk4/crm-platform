from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from organizations.models import Branch, accessible_organizations


class ActiveBranchSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = Branch
        fields = ("id", "name", "address", "organization", "organization_name")


class UserSerializer(serializers.ModelSerializer):
    active_branch_details = ActiveBranchSerializer(source="active_branch", read_only=True)

    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "phone_number",
            "name",
            "locale",
            "active_branch",
            "active_branch_details",
            "is_staff",
            "date_joined",
        )
        read_only_fields = ("id", "phone_number", "is_staff", "date_joined")

    def validate_active_branch(self, branch):
        user = self.instance or self.context["request"].user
        if branch is None:
            return None
        if not accessible_organizations(user).filter(pk=branch.organization_id).exists():
            raise serializers.ValidationError(_("Филиал недоступен текущему пользователю."))
        return branch


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("username", "phone_number", "name", "locale")

    def create(self, validated_data):
        return self.Meta.model.objects.create_user(**validated_data)
