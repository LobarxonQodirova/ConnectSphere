from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import UserMinimalSerializer

from .models import DirectMessage, MessageThread

User = get_user_model()


class DirectMessageSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)

    class Meta:
        model = DirectMessage
        fields = [
            "id", "sender", "content", "message_type",
            "attachment", "is_read", "read_at", "created_at",
        ]
        read_only_fields = ["id", "sender", "is_read", "read_at", "created_at"]


class MessageThreadSerializer(serializers.ModelSerializer):
    participants = UserMinimalSerializer(many=True, read_only=True)
    last_message = DirectMessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = [
            "id", "participants", "title", "is_group",
            "last_message", "unread_count",
            "last_message_at", "created_at",
        ]
        read_only_fields = ["id", "last_message_at", "created_at"]

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if request:
            return obj.messages.filter(is_read=False).exclude(
                sender=request.user
            ).count()
        return 0


class CreateThreadSerializer(serializers.Serializer):
    """Create or retrieve an existing direct-message thread."""

    participant_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1
    )
    title = serializers.CharField(max_length=100, required=False, default="")

    def validate_participant_ids(self, value):
        request_user = self.context["request"].user
        if str(request_user.pk) in [str(v) for v in value]:
            raise serializers.ValidationError(
                "You don't need to include yourself; you are added automatically."
            )
        users = User.objects.filter(pk__in=value)
        if users.count() != len(value):
            raise serializers.ValidationError("One or more users not found.")
        return value

    def create(self, validated_data):
        request_user = self.context["request"].user
        participant_ids = validated_data["participant_ids"]
        all_ids = sorted([str(request_user.pk)] + [str(pid) for pid in participant_ids])

        is_group = len(participant_ids) > 1

        # For 1-on-1 chats, reuse existing thread
        if not is_group:
            existing = (
                MessageThread.objects.filter(is_group=False, participants=request_user)
                .filter(participants__pk=participant_ids[0])
                .first()
            )
            if existing and existing.participants.count() == 2:
                return existing

        thread = MessageThread.objects.create(
            title=validated_data.get("title", ""),
            is_group=is_group,
        )
        thread.participants.add(request_user, *User.objects.filter(pk__in=participant_ids))
        return thread


class SendMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectMessage
        fields = ["content", "message_type", "attachment"]

    def create(self, validated_data):
        thread = self.context["thread"]
        sender = self.context["request"].user
        message = DirectMessage.objects.create(
            thread=thread, sender=sender, **validated_data
        )
        thread.last_message_at = message.created_at
        thread.save(update_fields=["last_message_at"])
        return message
