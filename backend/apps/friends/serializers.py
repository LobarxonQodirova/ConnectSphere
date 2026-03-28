from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import UserMinimalSerializer

from .models import Block, FriendRequest, Friendship

User = get_user_model()


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)
    receiver_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = FriendRequest
        fields = [
            "id", "sender", "receiver", "receiver_id",
            "status", "message", "created_at",
        ]
        read_only_fields = ["id", "sender", "receiver", "status", "created_at"]

    def validate_receiver_id(self, value):
        request_user = self.context["request"].user
        if str(value) == str(request_user.pk):
            raise serializers.ValidationError("You cannot send a friend request to yourself.")
        try:
            User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if Block.is_blocked(request_user, User.objects.get(pk=value)):
            raise serializers.ValidationError("Cannot send request to this user.")

        if FriendRequest.objects.filter(
            sender=request_user, receiver_id=value, status="pending"
        ).exists():
            raise serializers.ValidationError("Friend request already sent.")
        return value

    def create(self, validated_data):
        receiver = User.objects.get(pk=validated_data.pop("receiver_id"))
        return FriendRequest.objects.create(
            sender=self.context["request"].user,
            receiver=receiver,
            message=validated_data.get("message", ""),
        )


class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ["id", "friend", "created_at"]

    def get_friend(self, obj):
        request_user = self.context["request"].user
        friend_user = obj.user2 if obj.user1 == request_user else obj.user1
        return UserMinimalSerializer(friend_user, context=self.context).data


class BlockSerializer(serializers.ModelSerializer):
    blocked = UserMinimalSerializer(read_only=True)
    blocked_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Block
        fields = ["id", "blocked", "blocked_id", "created_at"]
        read_only_fields = ["id", "blocked", "created_at"]

    def validate_blocked_id(self, value):
        request_user = self.context["request"].user
        if str(value) == str(request_user.pk):
            raise serializers.ValidationError("You cannot block yourself.")
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError("User not found.")
        if Block.objects.filter(blocker=request_user, blocked_id=value).exists():
            raise serializers.ValidationError("User already blocked.")
        return value

    def create(self, validated_data):
        blocked_user = User.objects.get(pk=validated_data.pop("blocked_id"))
        # Remove any existing friendship
        from django.db.models import Q as DQ

        Friendship.objects.filter(
            DQ(user1=self.context["request"].user, user2=blocked_user)
            | DQ(user1=blocked_user, user2=self.context["request"].user)
        ).delete()
        return Block.objects.create(
            blocker=self.context["request"].user, blocked=blocked_user
        )
