from django.contrib.auth import get_user_model
from django.utils.text import slugify
from rest_framework import serializers

from apps.accounts.serializers import UserMinimalSerializer

from .models import Group, GroupMember, GroupPost

User = get_user_model()


class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ["id", "user", "role", "is_approved", "joined_at"]
        read_only_fields = ["id", "joined_at"]


class GroupSerializer(serializers.ModelSerializer):
    creator = UserMinimalSerializer(read_only=True)
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            "id", "name", "slug", "description", "cover_image", "avatar",
            "privacy", "rules", "creator", "member_count",
            "is_active", "is_member", "user_role", "created_at",
        ]
        read_only_fields = ["id", "slug", "creator", "member_count", "created_at"]

    def get_is_member(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user, is_approved=True).exists()
        return False

    def get_user_role(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            return member.role if member else None
        return None

    def create(self, validated_data):
        user = self.context["request"].user
        slug = slugify(validated_data["name"])
        base_slug = slug
        counter = 1
        while Group.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        group = Group.objects.create(creator=user, slug=slug, **validated_data)
        GroupMember.objects.create(group=group, user=user, role="admin")
        return group


class GroupPostSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)

    class Meta:
        model = GroupPost
        fields = [
            "id", "author", "content", "image", "is_pinned",
            "like_count", "comment_count", "is_approved", "created_at",
        ]
        read_only_fields = [
            "id", "author", "like_count", "comment_count",
            "is_approved", "created_at",
        ]
