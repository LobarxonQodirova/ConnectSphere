from django.contrib import admin

from .models import Group, GroupMember, GroupPost


class GroupMemberInline(admin.TabularInline):
    model = GroupMember
    extra = 0
    readonly_fields = ["joined_at"]


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "privacy", "creator", "member_count", "is_active", "created_at"]
    list_filter = ["privacy", "is_active", "created_at"]
    search_fields = ["name", "slug", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [GroupMemberInline]
    readonly_fields = ["id", "member_count", "created_at", "updated_at"]


@admin.register(GroupPost)
class GroupPostAdmin(admin.ModelAdmin):
    list_display = ["author", "group", "short_content", "is_pinned", "is_approved", "created_at"]
    list_filter = ["is_pinned", "is_approved", "created_at"]
    search_fields = ["content", "author__username", "group__name"]

    def short_content(self, obj):
        return obj.content[:60]
    short_content.short_description = "Content"
