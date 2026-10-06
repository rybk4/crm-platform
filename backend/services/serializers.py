from rest_framework import serializers

from staff.models import Staff
from .models import Service, ServiceCategory, StaffService


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ("id", "name", "code", "position")


class ServiceSerializer(serializers.ModelSerializer):
    specialist = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True)
    specialist_name = serializers.SerializerMethodField()
    branch_id = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    organization_id = serializers.UUIDField(read_only=True)
    currency = serializers.CharField(source="organization.currency", read_only=True)
    specialists = serializers.SerializerMethodField()
    specialist_names = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Service
        fields = (
            "id", "specialist", "specialist_name", "branch_id", "branch_name",
            "organization_id", "name", "description", "duration_minutes", "price",
            "price_max", "currency", "category", "category_name", "specialists",
            "specialist_names", "is_active",
        )
        extra_kwargs = {"category": {"required": False}}

    def primary_staff(self, instance):
        prefetched = list(instance.staff.all())
        return prefetched[0] if prefetched else None

    def get_specialist_name(self, instance):
        staff = self.primary_staff(instance)
        return staff.full_name if staff else ""

    def get_specialists(self, instance):
        return [item.pk for item in instance.staff.all()]

    def get_specialist_names(self, instance):
        return [item.full_name for item in instance.staff.all()]

    def get_branch_id(self, instance):
        staff = self.primary_staff(instance)
        return staff.branch_id if staff else None

    def get_branch_name(self, instance):
        staff = self.primary_staff(instance)
        return staff.branch.name if staff else ""

    def validate_specialist(self, value):
        if value.organization_id != self.context["request"].user.organization_id:
            raise serializers.ValidationError("Специалист принадлежит другой организации.")
        return value

    def to_representation(self, instance):
        result = super().to_representation(instance)
        staff = self.primary_staff(instance)
        result["specialist"] = staff.pk if staff else None
        return result

    def create(self, validated_data):
        specialist = validated_data.pop("specialist")
        category = validated_data.pop("category", None) or ServiceCategory.objects.first()
        if category is None:
            raise serializers.ValidationError({"name": "Справочник категорий услуг пуст."})
        service = Service.objects.create(
            organization=self.context["request"].user.organization,
            category=category,
            created_user=self.context["request"].user,
            **validated_data,
        )
        StaffService.objects.create(staff=specialist, service=service)
        return service

    def update(self, instance, validated_data):
        specialist = validated_data.pop("specialist", None)
        instance = super().update(instance, validated_data)
        if specialist:
            StaffService.objects.get_or_create(staff=specialist, service=instance)
        return instance
