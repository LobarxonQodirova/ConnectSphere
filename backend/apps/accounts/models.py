import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.username

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def friend_count(self):
        from apps.friends.models import Friendship

        return Friendship.objects.filter(
            models.Q(user1=self) | models.Q(user2=self)
        ).count()


class UserProfile(models.Model):
    """Extended profile information linked to a User."""

    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
        ("N", "Prefer not to say"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    avatar = models.ImageField(upload_to="avatars/%Y/%m/", blank=True, null=True)
    cover_photo = models.ImageField(upload_to="covers/%Y/%m/", blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    education = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_profiles"

    def __str__(self):
        return f"Profile of {self.user.username}"


class PrivacySettings(models.Model):
    """Privacy configuration for a user."""

    VISIBILITY_CHOICES = [
        ("public", "Public"),
        ("friends", "Friends Only"),
        ("private", "Only Me"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="privacy"
    )
    profile_visibility = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default="public"
    )
    post_default_visibility = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default="friends"
    )
    friend_list_visibility = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default="friends"
    )
    allow_friend_requests = models.BooleanField(default=True)
    allow_messages_from_strangers = models.BooleanField(default=False)
    show_online_status = models.BooleanField(default=True)
    show_last_seen = models.BooleanField(default=True)
    searchable = models.BooleanField(default=True)

    class Meta:
        db_table = "privacy_settings"
        verbose_name_plural = "Privacy settings"

    def __str__(self):
        return f"Privacy settings for {self.user.username}"
