from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import Branch, Organization, OrganizationMember, accessible_organizations


class OrganizationSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    branches_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "slug",
            "phone",
            "timezone",
            "currency",
            "is_active",
            "role",
            "branches_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "role", "branches_count", "created_at", "updated_at")

    def get_role(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_superuser:
            return OrganizationMember.Role.OWNER
        membership = obj.memberships.filter(user=request.user, is_active=True).first()
        return membership.role if membership else None

    @transaction.atomic
    def create(self, validated_data):
        organization = super().create(validated_data)
        OrganizationMember.objects.create(
            organization=organization,
            user=self.context["request"].user,
            role=OrganizationMember.Role.OWNER,
        )
        return organization


class BranchSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    specialists_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Branch
        fields = (
            "id",
            "organization",
            "organization_name",
            "name",
            "address",
            "phone",
            "timezone",
            "is_active",
            "specialists_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "organization_name",
            "specialists_count",
            "created_at",
            "updated_at",
        )

    def validate_organization(self, organization):
        request = self.context["request"]
        if not accessible_organizations(request.user).filter(pk=organization.pk).exists():
            raise serializers.ValidationError(_("Организация недоступна текущему пользователю."))
        return organization
