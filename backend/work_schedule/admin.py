from django.contrib import admin

from core.admin import BaseMixinAdmin

from .models import DailySchedule, DailyWorkingInterval


class DailyWorkingIntervalInline(admin.TabularInline):
    model = DailyWorkingInterval
    extra = 0
    fields = ("start_time", "end_time")


@admin.register(DailySchedule)
class DailyScheduleAdmin(BaseMixinAdmin):
    list_display = ("staff", "date", "is_working", "row_status")
    list_filter = ("row_status", "is_working", "staff__branch")
    search_fields = ("staff__surname", "staff__name")
    date_hierarchy = "date"
    autocomplete_fields = ("staff",)
    inlines = (DailyWorkingIntervalInline,)
