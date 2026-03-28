import uuid

from django.conf import settings
from django.db import models


class MessageThread(models.Model):
    """
    A conversation thread between two or more users.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="message_threads"
    )
    title = models.CharField(max_length=100, blank=True, help_text="Optional group chat name")
    is_group = models.BooleanField(default=False)
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "message_threads"
        ordering = ["-last_message_at"]

    def __str__(self):
        if self.title:
            return self.title
        usernames = ", ".join(
            self.participants.values_list("username", flat=True)[:3]
        )
        return f"Thread: {usernames}"

    @property
    def last_message(self):
        return self.messages.order_by("-created_at").first()


class DirectMessage(models.Model):
    """
    A single message inside a thread.
    """

    MESSAGE_TYPE_CHOICES = [
        ("text", "Text"),
        ("image", "Image"),
        ("file", "File"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(
        MessageThread, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    content = models.TextField(max_length=5000)
    message_type = models.CharField(
        max_length=10, choices=MESSAGE_TYPE_CHOICES, default="text"
    )
    attachment = models.FileField(
        upload_to="messages/attachments/%Y/%m/", blank=True, null=True
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "direct_messages"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["thread", "created_at"]),
        ]

    def __str__(self):
        return f"{self.sender.username}: {self.content[:40]}"
