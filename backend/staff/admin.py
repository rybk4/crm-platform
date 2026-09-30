from django.contrib import admin

from core.admin import BaseMixinAdmin

from .models import Staff, StaffProfession


class StaffProfessionInline(admin.TabularInline):
    model = StaffProfession
    extra = 0
    fields = ("profession", "is_primary")
    autocomplete_fields = ("profession",)


@admin.register(Staff)
class StaffAdmin(BaseMixinAdmin):
    list_display = ("full_name", "title", "phone", "organization", "branch", "is_active", "row_status")
    list_filter = ("row_status", "is_active", "professions", "organization", "branch")
    search_fields = ("surname", "name", "patronymic", "phone", "title")
    autocomplete_fields = ("user",)
    inlines = (StaffProfessionInline,)
