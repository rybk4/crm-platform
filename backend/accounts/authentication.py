from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _

from .jwt import TokenError, decode_token


class JWTAuthentication(BaseAuthentication):
    keyword = b"Bearer"

    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header:
            return None
        if len(header) != 2 or header[0].lower() != self.keyword.lower():
            raise AuthenticationFailed(
                _("Используйте заголовок Authorization: Bearer <token>.")
            )

        try:
            token = header[1].decode("utf-8")
            payload = decode_token(token, "access")
        except (UnicodeError, TokenError) as exc:
            raise AuthenticationFailed(str(exc)) from exc

        User = get_user_model()
        try:
            user = User.objects.get(pk=payload["sub"], is_active=True)
        except User.DoesNotExist as exc:
            raise AuthenticationFailed(_("Пользователь не найден или отключён.")) from exc

        return user, payload

    def authenticate_header(self, request):
        return "Bearer"
