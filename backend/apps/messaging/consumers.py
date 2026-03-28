"""
WebSocket consumer for real-time chat messaging.
"""
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebSocketConsumer
from django.utils import timezone

from .models import DirectMessage, MessageThread


class ChatConsumer(AsyncJsonWebSocketConsumer):
    """
    Handles WebSocket connections for a chat thread.

    URL pattern: ws/chat/<thread_id>/
    """

    async def connect(self):
        self.thread_id = self.scope["url_route"]["kwargs"]["thread_id"]
        self.room_group_name = f"chat_{self.thread_id}"
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        is_participant = await self._is_participant()
        if not is_participant:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

        # Notify others that this user is now online in this chat
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "user_id": str(self.user.pk),
                "username": self.user.username,
                "status": "online",
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive_json(self, content):
        """Handle incoming JSON messages from the WebSocket client."""
        action = content.get("action")

        if action == "message":
            message = await self._save_message(content.get("content", ""))
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message_id": str(message.pk),
                    "sender_id": str(self.user.pk),
                    "sender_username": self.user.username,
                    "content": message.content,
                    "message_type": message.message_type,
                    "created_at": message.created_at.isoformat(),
                },
            )
        elif action == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_indicator",
                    "user_id": str(self.user.pk),
                    "username": self.user.username,
                    "is_typing": content.get("is_typing", True),
                },
            )
        elif action == "read":
            await self._mark_as_read()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "messages_read",
                    "user_id": str(self.user.pk),
                    "username": self.user.username,
                },
            )

    # ---------- group send handlers ----------

    async def chat_message(self, event):
        await self.send_json(event)

    async def typing_indicator(self, event):
        if event["user_id"] != str(self.user.pk):
            await self.send_json(event)

    async def user_status(self, event):
        await self.send_json(event)

    async def messages_read(self, event):
        await self.send_json(event)

    # ---------- database helpers ----------

    @database_sync_to_async
    def _is_participant(self):
        return MessageThread.objects.filter(
            pk=self.thread_id, participants=self.user
        ).exists()

    @database_sync_to_async
    def _save_message(self, content):
        thread = MessageThread.objects.get(pk=self.thread_id)
        message = DirectMessage.objects.create(
            thread=thread,
            sender=self.user,
            content=content,
            message_type="text",
        )
        thread.last_message_at = message.created_at
        thread.save(update_fields=["last_message_at"])
        return message

    @database_sync_to_async
    def _mark_as_read(self):
        DirectMessage.objects.filter(
            thread_id=self.thread_id, is_read=False
        ).exclude(sender=self.user).update(is_read=True, read_at=timezone.now())
