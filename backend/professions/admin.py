from django.contrib import admin

from core.admin import BaseMixinAdmin

from .models import Profession


@admin.register(Profession)
class ProfessionAdmin(BaseMixinAdmin):
    list_display = ("name", "code", "position", "row_status")
    list_editable = ("position",)
    search_fields = ("name", "code")
    prepopulated_fields = {"code": ("name",)}
