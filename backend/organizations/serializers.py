import base64
import binascii
import uuid

from django.core.files.base import ContentFile
from django.db import transaction
from rest_framework import serializers

from .models import Branch, City, Organization, OrganizationPhoto


def absolute_media_url(request, field):
    if not field:
        return None
    url = field.url
    return request.build_absolute_uri(url) if request else url


def data_url_file(value, prefix):
    if not isinstance(value, str) or not value.startswith("data:image/"):
        return None
    try:
        header, encoded = value.split(",", 1)
        extension = header.split("/")[1].split(";")[0].replace("jpeg", "jpg")
        return ContentFile(base64.b64decode(encoded), name=f"{prefix}-{uuid.uuid4()}.{extension}")
    except (ValueError, binascii.Error) as error:
        raise serializers.ValidationError("Некорректное изображение.") from error


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ("id", "name")


class BranchSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = Branch
        fields = (
            "id", "organization", "organization_name", "name", "address",
            "phone", "timezone", "is_active",
        )
        read_only_fields = ("organization",)


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ("id", "name", "phone", "email", "city", "address", "timezone", "currency")


class OrganizationPhotoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationPhoto
        fields = ("id", "url")

    def get_url(self, instance):
        return absolute_media_url(self.context.get("request"), instance.image)


class OrganizationProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    photos = OrganizationPhotoSerializer(many=True, read_only=True)
    photo_urls = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    class Meta:
        model = Organization
        fields = (
            "id", "name", "phone", "email", "city", "address", "working_days",
            "description", "avatar_url", "photos", "photo_urls",
        )

    def get_avatar_url(self, instance):
        return absolute_media_url(self.context.get("request"), instance.avatar)

    @transaction.atomic
    def update(self, instance, validated_data):
        photo_urls = validated_data.pop("photo_urls", None)
        avatar_file = data_url_file(self.initial_data.get("avatar_url"), "avatar")
        if avatar_file:
            instance.avatar = avatar_file
        instance = super().update(instance, validated_data)
        if photo_urls is not None:
            retained_ids = []
            for position, value in enumerate(photo_urls):
                filename = value.rsplit("/", 1)[-1]
                existing = instance.photos.filter(image__endswith=filename).first()
                if existing:
                    existing.position = position
                    existing.save(update_fields=["position", "update_date"])
                    retained_ids.append(existing.pk)
                    continue
                image = data_url_file(value, "organization")
                if image:
                    photo = OrganizationPhoto.objects.create(
                        organization=instance, image=image, position=position
                    )
                    retained_ids.append(photo.pk)
            instance.photos.exclude(pk__in=retained_ids).delete()
        return instance
