import uuid

from django.conf import settings
from django.db import models


class Group(models.Model):
    """Community group where users can share posts and discuss topics."""

    PRIVACY_CHOICES = [
        ("public", "Public"),
        ("private", "Private"),
        ("secret", "Secret"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True)
    description = models.TextField(max_length=2000, blank=True)
    cover_image = models.ImageField(upload_to="groups/covers/%Y/%m/", blank=True, null=True)
    avatar = models.ImageField(upload_to="groups/avatars/%Y/%m/", blank=True, null=True)
    privacy = models.CharField(max_length=10, choices=PRIVACY_CHOICES, default="public")
    rules = models.TextField(blank=True, help_text="Community rules in plain text")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="created_groups",
    )
    member_count = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "groups"
        ordering = ["-member_count"]

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    """Membership record linking a user to a group with a role."""

    ROLE_CHOICES = [
        ("member", "Member"),
        ("moderator", "Moderator"),
        ("admin", "Admin"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="group_memberships"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    is_approved = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "group_members"
        unique_together = ["group", "user"]

    def __str__(self):
        return f"{self.user.username} in {self.group.name} ({self.role})"


class GroupPost(models.Model):
    """A post made inside a group."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="group_posts"
    )
    content = models.TextField(max_length=5000)
    image = models.ImageField(upload_to="groups/posts/%Y/%m/", blank=True, null=True)
    is_pinned = models.BooleanField(default=False)
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "group_posts"
        ordering = ["-is_pinned", "-created_at"]

    def __str__(self):
        return f"{self.author.username} in {self.group.name}: {self.content[:40]}"
