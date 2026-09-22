from django.db.models import Count
from rest_framework import viewsets

from organizations.models import accessible_organizations

from .models import Specialist
from .serializers import SpecialistSerializer


class SpecialistViewSet(viewsets.ModelViewSet):
    serializer_class = SpecialistSerializer

    def get_queryset(self):
        queryset = (
            Specialist.objects.filter(branch__organization__in=accessible_organizations(self.request.user))
            .select_related("branch", "branch__organization")
            .prefetch_related("certificates", "schedule")
            .annotate(services_count=Count("services", distinct=True))
        )
        branch_id = self.request.query_params.get("branch")
        organization_id = self.request.query_params.get("organization")
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if organization_id:
            queryset = queryset.filter(branch__organization_id=organization_id)
        if not branch_id and not organization_id:
            if not self.request.user.active_branch_id:
                return queryset.none()
            queryset = queryset.filter(branch_id=self.request.user.active_branch_id)
        return queryset
