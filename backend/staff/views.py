from rest_framework import decorators, response, serializers, viewsets

from services.models import Service, StaffService
from .models import Staff
from .serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer

    def get_queryset(self):
        return (
            Staff.objects.filter(organization_id=self.request.user.organization_id)
            .select_related("branch", "organization")
            .prefetch_related("services", "certificates", "daily_schedules__working_intervals")
        )

    @decorators.action(detail=True, methods=["put"])
    def services(self, request, pk=None):
        staff = self.get_object()
        service_ids = request.data.get("service_ids", [])
        services = Service.objects.filter(
            organization_id=request.user.organization_id, id__in=service_ids
        )
        if services.count() != len(set(service_ids)):
            raise serializers.ValidationError({"service_ids": "Одна или несколько услуг не найдены."})
        StaffService.objects.filter(staff=staff).exclude(service__in=services).delete()
        for service in services:
            StaffService.objects.get_or_create(staff=staff, service=service)
        return response.Response(StaffSerializer(staff, context={"request": request}).data)

    def perform_destroy(self, instance):
        instance.updated_user = self.request.user
        instance.delete()
