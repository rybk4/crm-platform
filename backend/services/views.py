from rest_framework import viewsets

from .models import Service, ServiceCategory
from .serializers import ServiceCategorySerializer, ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        return (
            Service.objects.filter(organization_id=self.request.user.organization_id)
            .select_related("organization", "category")
            .prefetch_related("staff__branch")
        )

    def perform_destroy(self, instance):
        instance.updated_user = self.request.user
        instance.delete()


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceCategorySerializer
    queryset = ServiceCategory.objects.all()
