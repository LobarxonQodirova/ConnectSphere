import uuid

from django.conf import settings
from django.db import models


class FriendRequest(models.Model):
    """Pending friend request between two users."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_friend_requests",
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_friend_requests",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    message = models.TextField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "friend_requests"
        unique_together = ["sender", "receiver"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

    def accept(self):
        """Accept this friend request and create a Friendship."""
        self.status = "accepted"
        self.save(update_fields=["status", "updated_at"])
        Friendship.objects.get_or_create(
            user1=min(self.sender, self.receiver, key=lambda u: u.pk),
            user2=max(self.sender, self.receiver, key=lambda u: u.pk),
        )

    def reject(self):
        self.status = "rejected"
        self.save(update_fields=["status", "updated_at"])

    def cancel(self):
        self.status = "cancelled"
        self.save(update_fields=["status", "updated_at"])


class Friendship(models.Model):
    """
    Bidirectional friendship between two users.
    user1.pk is always less than user2.pk to avoid duplicates.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_user1",
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_user2",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "friendships"
        unique_together = ["user1", "user2"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user1.username} <-> {self.user2.username}"

    @staticmethod
    def are_friends(user_a, user_b):
        u1 = min(user_a, user_b, key=lambda u: u.pk)
        u2 = max(user_a, user_b, key=lambda u: u.pk)
        return Friendship.objects.filter(user1=u1, user2=u2).exists()


class Block(models.Model):
    """Record of a user blocking another user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocking",
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocked_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "blocks"
        unique_together = ["blocker", "blocked"]

    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"

    @staticmethod
    def is_blocked(user_a, user_b):
        return Block.objects.filter(
            models.Q(blocker=user_a, blocked=user_b)
            | models.Q(blocker=user_b, blocked=user_a)
        ).exists()
