from django.contrib import admin

from core.admin import BaseMixinAdmin

from .models import Branch, City, Organization, OrganizationPhoto


@admin.register(City)
class CityAdmin(BaseMixinAdmin):
    list_display = ("name", "row_status")
    search_fields = ("name",)


class BranchInline(admin.TabularInline):
    model = Branch
    extra = 0
    fields = ("name", "address", "phone", "timezone", "is_active")


@admin.register(Organization)
class OrganizationAdmin(BaseMixinAdmin):
    list_display = ("name", "city", "phone", "email", "row_status")
    list_filter = ("row_status", "city")
    search_fields = ("name", "phone", "email")
    inlines = (BranchInline,)


@admin.register(Branch)
class BranchAdmin(BaseMixinAdmin):
    list_display = ("name", "organization", "address", "is_active", "row_status")
    list_filter = ("row_status", "is_active", "organization")
    search_fields = ("name", "address")


@admin.register(OrganizationPhoto)
class OrganizationPhotoAdmin(BaseMixinAdmin):
    list_display = ("organization", "position", "row_status")
