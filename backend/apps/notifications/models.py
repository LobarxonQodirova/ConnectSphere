import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """In-app notification for a user."""

    TYPE_CHOICES = [
        ("like", "Like"),
        ("comment", "Comment"),
        ("share", "Share"),
        ("friend_request", "Friend Request"),
        ("friend_accept", "Friend Accept"),
        ("group_invite", "Group Invite"),
        ("group_post", "Group Post"),
        ("mention", "Mention"),
        ("story_view", "Story View"),
        ("message", "Message"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = models.TextField(max_length=500, blank=True)
    link = models.CharField(max_length=500, blank=True, help_text="Frontend route to navigate to")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "-created_at"]),
            models.Index(fields=["recipient", "is_read"]),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} -> {self.recipient.username}"
