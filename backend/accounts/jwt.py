from datetime import datetime, timezone
from uuid import uuid4

import jwt
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class TokenError(Exception):
    pass


def _encode_token(user, token_type, lifetime):
    issued_at = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.pk),
        "phone_number": user.phone_number,
        "token_type": token_type,
        "iat": issued_at,
        "exp": issued_at + lifetime,
        "jti": uuid4().hex,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_token_pair(user):
    return {
        "access": _encode_token(user, "access", settings.JWT_ACCESS_LIFETIME),
        "refresh": _encode_token(user, "refresh", settings.JWT_REFRESH_LIFETIME),
    }


def create_access_token(user):
    return _encode_token(user, "access", settings.JWT_ACCESS_LIFETIME)


def decode_token(token, expected_type):
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["sub", "token_type", "iat", "exp", "jti"]},
        )
    except jwt.PyJWTError as exc:
        raise TokenError(_("Токен недействителен или истёк.")) from exc

    if payload.get("token_type") != expected_type:
        raise TokenError(_("Тип токена недействителен."))
    return payload
