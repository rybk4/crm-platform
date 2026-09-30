from django.contrib import admin

from .models import RowStatus


class BaseMixinAdmin(admin.ModelAdmin):
    """Админка моделей на BaseMixin: видит удалённые записи и сама ставит автора."""

    list_filter = ("row_status",)
    readonly_fields = ("create_date", "update_date", "created_user", "updated_user")
    actions = ("restore_selected",)

    def get_queryset(self, request):
        return self.model.all_objects.all()

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_user = request.user
        obj.updated_user = request.user
        super().save_model(request, obj, form, change)

    @admin.action(description="Восстановить выбранные")
    def restore_selected(self, request, queryset):
        queryset.update(row_status=RowStatus.ACTIVE)
