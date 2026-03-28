"""
WebSocket URL routing for the messaging app.
Imported by config/routing.py for inclusion in the top-level router.
"""
from django.urls import re_path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<thread_id>[0-9a-f-]+)/$", ChatConsumer.as_asgi()),
]
