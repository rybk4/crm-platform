from rest_framework import generics, viewsets
from rest_framework.exceptions import NotFound

from .models import Branch, City, Organization
from .serializers import (
    BranchSerializer,
    CitySerializer,
    OrganizationProfileSerializer,
    OrganizationSerializer,
)


class OrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(pk=self.request.user.organization_id)


class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer

    def get_queryset(self):
        return Branch.objects.filter(organization_id=self.request.user.organization_id)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization, created_user=self.request.user)


class CityListView(generics.ListAPIView):
    serializer_class = CitySerializer
    queryset = City.objects.all()


class OrganizationProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = OrganizationProfileSerializer

    def get_object(self):
        if not self.request.user.organization_id:
            raise NotFound("Организация не назначена.")
        return Organization.objects.prefetch_related("photos").get(
            pk=self.request.user.organization_id
        )
