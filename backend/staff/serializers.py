from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from work_schedule.models import DailySchedule, DailyWorkingInterval
from .models import Staff, StaffCertificate


def media_url(request, field):
    if not field:
        return ""
    return request.build_absolute_uri(field.url) if request else field.url


class StaffCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffCertificate
        fields = ("id", "title", "image_url", "issued_at", "position")
        read_only_fields = ("id",)


class WorkScheduleSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True, required=False)
    weekday = serializers.IntegerField(min_value=0, max_value=6)
    is_day_off = serializers.BooleanField()
    start_time = serializers.TimeField(allow_null=True, required=False)
    end_time = serializers.TimeField(allow_null=True, required=False)
    break_start = serializers.TimeField(allow_null=True, required=False)
    break_end = serializers.TimeField(allow_null=True, required=False)

    def validate(self, attrs):
        if not attrs["is_day_off"] and (not attrs.get("start_time") or not attrs.get("end_time")):
            raise serializers.ValidationError("Для рабочего дня укажите начало и конец.")
        if attrs.get("start_time") and attrs.get("end_time") and attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("Конец рабочего дня должен быть позже начала.")
        return attrs


class StaffSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="name")
    last_name = serializers.CharField(source="surname", allow_blank=True)
    middle_name = serializers.CharField(source="patronymic", allow_blank=True, required=False)
    job_title = serializers.CharField(source="title", allow_blank=True, required=False)
    phone_number = serializers.CharField(source="phone", allow_blank=True, required=False)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    organization_id = serializers.UUIDField(read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    full_name = serializers.CharField(read_only=True)
    photo_url = serializers.URLField(required=False, allow_blank=True)
    services_count = serializers.SerializerMethodField()
    certificates = StaffCertificateSerializer(many=True, required=False)
    schedule = WorkScheduleSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Staff
        fields = (
            "id", "branch", "branch_name", "organization_id", "organization_name",
            "first_name", "last_name", "middle_name", "full_name", "job_title",
            "phone_number", "photo_url", "bio", "is_active", "services_count",
            "certificates", "schedule", "vacation_start", "vacation_end",
            "payout_model", "payout_value",
        )

    def get_services_count(self, instance):
        return instance.services.count()

    def to_representation(self, instance):
        result = super().to_representation(instance)
        result["photo_url"] = instance.photo_url or media_url(self.context.get("request"), instance.photo)
        result["schedule"] = self.schedule_representation(instance)
        return result

    def schedule_representation(self, instance):
        today = timezone.localdate()
        end = today + timedelta(days=13)
        days = {
            item.date.weekday(): item
            for item in instance.daily_schedules.filter(date__range=(today, end)).prefetch_related(
                "working_intervals"
            )
        }
        result = []
        for weekday in range(7):
            day = days.get(weekday)
            intervals = list(day.working_intervals.all()) if day else []
            result.append(
                {
                    "id": str(day.pk) if day else None,
                    "weekday": weekday,
                    "is_day_off": not day.is_working if day else weekday >= 5,
                    "start_time": intervals[0].start_time.strftime("%H:%M") if intervals else None,
                    "end_time": intervals[-1].end_time.strftime("%H:%M") if intervals else None,
                    "break_start": intervals[0].end_time.strftime("%H:%M") if len(intervals) > 1 else None,
                    "break_end": intervals[1].start_time.strftime("%H:%M") if len(intervals) > 1 else None,
                }
            )
        return result

    def validate_branch(self, value):
        organization = self.context["request"].user.organization
        if value.organization_id != organization.id:
            raise serializers.ValidationError("Филиал принадлежит другой организации.")
        return value

    def validate(self, attrs):
        start = attrs.get("vacation_start", getattr(self.instance, "vacation_start", None))
        end = attrs.get("vacation_end", getattr(self.instance, "vacation_end", None))
        if start and end and end < start:
            raise serializers.ValidationError({"vacation_end": "Окончание отпуска раньше начала."})
        return attrs

    def sync_certificates(self, instance, certificates):
        instance.certificates.all().delete()
        request = self.context["request"]
        StaffCertificate.objects.bulk_create(
            [StaffCertificate(staff=instance, created_user=request.user, **item) for item in certificates]
        )

    def sync_schedule(self, instance, schedule):
        if not schedule:
            return
        by_weekday = {item["weekday"]: item for item in schedule}
        today = timezone.localdate()
        for offset in range(56):
            date = today + timedelta(days=offset)
            weekday = date.weekday()
            if weekday not in by_weekday:
                continue
            config = by_weekday[weekday]
            day, _ = DailySchedule.objects.update_or_create(
                staff=instance,
                date=date,
                defaults={"is_working": not config["is_day_off"]},
            )
            day.working_intervals.all().delete()
            if config["is_day_off"]:
                continue
            intervals = []
            start = config.get("start_time")
            end = config.get("end_time")
            break_start = config.get("break_start")
            break_end = config.get("break_end")
            if break_start and break_end:
                intervals = [(start, break_start), (break_end, end)]
            else:
                intervals = [(start, end)]
            DailySchedule.validate_intervals(intervals)
            DailyWorkingInterval.objects.bulk_create(
                [DailyWorkingInterval(daily_schedule=day, start_time=item[0], end_time=item[1]) for item in intervals]
            )

    @transaction.atomic
    def create(self, validated_data):
        schedule = validated_data.pop("schedule", [])
        certificates = validated_data.pop("certificates", [])
        instance = Staff.objects.create(
            organization=self.context["request"].user.organization,
            created_user=self.context["request"].user,
            **validated_data,
        )
        self.sync_schedule(instance, schedule)
        self.sync_certificates(instance, certificates)
        return instance

    @transaction.atomic
    def update(self, instance, validated_data):
        schedule = validated_data.pop("schedule", None)
        certificates = validated_data.pop("certificates", None)
        instance = super().update(instance, validated_data)
        if schedule is not None:
            self.sync_schedule(instance, schedule)
        if certificates is not None:
            self.sync_certificates(instance, certificates)
        return instance
