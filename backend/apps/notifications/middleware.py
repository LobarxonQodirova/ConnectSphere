"""
JWT authentication middleware for Django Channels WebSocket connections.
"""
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_string):
    """Validate a JWT access token and return the corresponding user."""
    try:
        token = AccessToken(token_string)
        user_id = token.payload.get("user_id")
        return User.objects.get(pk=user_id)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Authenticate WebSocket connections using a JWT token supplied as a
    query parameter: ws://host/ws/path/?token=<access_token>
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get("token", [])

        if token_list:
            scope["user"] = await get_user_from_token(token_list[0])
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
