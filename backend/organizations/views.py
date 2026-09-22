from django.db.models import Count
from rest_framework import viewsets

from .models import Branch, accessible_organizations
from .serializers import BranchSerializer, OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return accessible_organizations(self.request.user).annotate(
            branches_count=Count("branches", distinct=True)
        )


class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer

    def get_queryset(self):
        queryset = (
            Branch.objects.filter(organization__in=accessible_organizations(self.request.user))
            .select_related("organization")
            .annotate(specialists_count=Count("specialists", distinct=True))
        )
        organization_id = self.request.query_params.get("organization")
        return queryset.filter(organization_id=organization_id) if organization_id else queryset
