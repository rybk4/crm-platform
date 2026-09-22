from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "specialist", "duration_minutes", "price", "currency", "is_active")
    list_filter = ("specialist__branch__organization", "specialist__branch", "is_active")
    search_fields = ("name", "specialist__first_name", "specialist__last_name")
