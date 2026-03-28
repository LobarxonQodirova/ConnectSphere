"""
WebSocket consumer for real-time notifications.
"""
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebSocketConsumer


class NotificationConsumer(AsyncJsonWebSocketConsumer):
    """
    Sends real-time notifications to authenticated users.
    Each user is placed in a personal group: notifications_<user_id>.
    """

    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        self.group_name = f"notifications_{self.user.pk}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send unread count on connect
        unread = await self._get_unread_count()
        await self.send_json({"type": "unread_count", "count": unread})

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )

    async def receive_json(self, content):
        action = content.get("action")
        if action == "mark_read":
            notification_id = content.get("notification_id")
            if notification_id:
                await self._mark_as_read(notification_id)
                unread = await self._get_unread_count()
                await self.send_json({"type": "unread_count", "count": unread})
        elif action == "mark_all_read":
            await self._mark_all_read()
            await self.send_json({"type": "unread_count", "count": 0})

    # ---------- group send handlers ----------

    async def send_notification(self, event):
        """Called when a notification is pushed from the backend via channel layer."""
        await self.send_json({
            "type": "notification",
            "notification": event["notification"],
        })

    # ---------- database helpers ----------

    @database_sync_to_async
    def _get_unread_count(self):
        from .models import Notification

        return Notification.objects.filter(
            recipient=self.user, is_read=False
        ).count()

    @database_sync_to_async
    def _mark_as_read(self, notification_id):
        from .models import Notification

        Notification.objects.filter(
            pk=notification_id, recipient=self.user
        ).update(is_read=True)

    @database_sync_to_async
    def _mark_all_read(self):
        from .models import Notification

        Notification.objects.filter(
            recipient=self.user, is_read=False
        ).update(is_read=True)
