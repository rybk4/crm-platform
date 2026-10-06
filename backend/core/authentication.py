from django.conf import settings
from django.core import signing
from rest_framework import authentication, exceptions

from users.models import User


TOKEN_SALT = "crm.signed-token.v1"


def issue_token(user, kind):
    return signing.dumps({"user_id": str(user.pk), "kind": kind}, salt=TOKEN_SALT, compress=True)


def read_token(token, kind):
    max_age = (
        settings.CRM_ACCESS_TOKEN_AGE if kind == "access" else settings.CRM_REFRESH_TOKEN_AGE
    )
    try:
        payload = signing.loads(token, salt=TOKEN_SALT, max_age=max_age)
    except (signing.BadSignature, signing.SignatureExpired) as error:
        raise exceptions.AuthenticationFailed("Срок действия токена истёк.") from error
    if payload.get("kind") != kind:
        raise exceptions.AuthenticationFailed("Некорректный тип токена.")
    try:
        return User.objects.select_related("organization", "active_branch").get(
            pk=payload["user_id"], is_active=True
        )
    except (KeyError, User.DoesNotExist) as error:
        raise exceptions.AuthenticationFailed("Пользователь не найден.") from error


class SignedBearerAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if not header:
            return None
        if header[0].decode().lower() != self.keyword.lower():
            return None
        if len(header) != 2:
            raise exceptions.AuthenticationFailed("Некорректный заголовок авторизации.")
        user = read_token(header[1].decode(), "access")
        return user, header[1].decode()
