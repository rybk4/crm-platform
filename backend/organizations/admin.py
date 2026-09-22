from django.contrib import admin

from .models import Branch, Organization, OrganizationMember


class BranchInline(admin.TabularInline):
    model = Branch
    extra = 0


class MemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 0


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "currency", "is_active")
    list_filter = ("is_active", "currency")
    search_fields = ("name", "slug", "phone")
    inlines = (MemberInline, BranchInline)


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "address", "is_active")
    list_filter = ("organization", "is_active")
    search_fields = ("name", "address", "phone")


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "organization", "role", "is_active")
    list_filter = ("role", "is_active", "organization")
