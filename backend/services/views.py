from rest_framework import viewsets

from organizations.models import accessible_organizations

from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        queryset = Service.objects.filter(
            specialist__branch__organization__in=accessible_organizations(self.request.user)
        ).select_related("specialist", "specialist__branch")
        specialist_id = self.request.query_params.get("specialist")
        branch_id = self.request.query_params.get("branch")
        organization_id = self.request.query_params.get("organization")
        if specialist_id:
            queryset = queryset.filter(specialist_id=specialist_id)
        if branch_id:
            queryset = queryset.filter(specialist__branch_id=branch_id)
        if organization_id:
            queryset = queryset.filter(specialist__branch__organization_id=organization_id)
        if not branch_id and not specialist_id and not organization_id:
            if not self.request.user.active_branch_id:
                return queryset.none()
            queryset = queryset.filter(specialist__branch_id=self.request.user.active_branch_id)
        return queryset
