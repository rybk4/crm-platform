from django.contrib import admin

from core.admin import BaseMixinAdmin

from .models import Service, ServiceCategory, StaffService


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(BaseMixinAdmin):
    list_display = ("name", "code", "position", "row_status")
    list_editable = ("position",)
    search_fields = ("name", "code")
    prepopulated_fields = {"code": ("name",)}


class StaffServiceInline(admin.TabularInline):
    model = StaffService
    extra = 0
    fields = ("staff", "duration_minutes", "price", "price_max")
    autocomplete_fields = ("staff",)


@admin.register(Service)
class ServiceAdmin(BaseMixinAdmin):
    list_display = (
        "name",
        "organization",
        "category",
        "duration_minutes",
        "price",
        "price_max",
        "is_active",
        "row_status",
    )
    list_filter = ("row_status", "is_active", "category", "organization")
    search_fields = ("name", "description")
    autocomplete_fields = ("category",)
    inlines = (StaffServiceInline,)
