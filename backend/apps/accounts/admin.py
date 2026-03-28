from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import PrivacySettings, UserProfile

User = get_user_model()


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


class PrivacySettingsInline(admin.StackedInline):
    model = PrivacySettings
    can_delete = False
    verbose_name_plural = "Privacy Settings"
    fk_name = "user"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline, PrivacySettingsInline]
    list_display = [
        "username", "email", "first_name", "last_name",
        "is_verified", "is_online", "is_staff", "date_joined",
    ]
    list_filter = ["is_verified", "is_online", "is_staff", "is_superuser", "date_joined"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["-date_joined"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("ConnectSphere", {"fields": ("date_of_birth", "is_verified", "is_online", "last_seen")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Extra", {"fields": ("email", "first_name", "last_name")}),
    )
