from django.contrib import admin

from .models import Specialist, SpecialistCertificate, WorkSchedule


class CertificateInline(admin.TabularInline):
    model = SpecialistCertificate
    extra = 0


class ScheduleInline(admin.TabularInline):
    model = WorkSchedule
    extra = 0


@admin.register(Specialist)
class SpecialistAdmin(admin.ModelAdmin):
    list_display = ("full_name", "branch", "job_title", "phone_number", "is_active")
    list_filter = ("branch__organization", "branch", "is_active")
    search_fields = ("first_name", "last_name", "middle_name", "phone_number")
    inlines = (ScheduleInline, CertificateInline)


@admin.register(SpecialistCertificate)
class SpecialistCertificateAdmin(admin.ModelAdmin):
    list_display = ("title", "specialist", "issued_at")


@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ("specialist", "weekday", "is_day_off", "start_time", "end_time")
    list_filter = ("weekday", "is_day_off")
