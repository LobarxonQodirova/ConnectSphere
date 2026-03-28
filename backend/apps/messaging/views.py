from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DirectMessage, MessageThread
from .serializers import (
    CreateThreadSerializer,
    DirectMessageSerializer,
    MessageThreadSerializer,
    SendMessageSerializer,
)


class ThreadListView(generics.ListAPIView):
    """List all message threads for the authenticated user."""

    serializer_class = MessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            MessageThread.objects.filter(participants=self.request.user)
            .prefetch_related("participants__profile", "messages")
            .order_by("-last_message_at")
        )


class CreateThreadView(generics.CreateAPIView):
    """Create a new message thread or return an existing one."""

    serializer_class = CreateThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread = serializer.save()
        return Response(
            MessageThreadSerializer(thread, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ThreadMessagesView(generics.ListAPIView):
    """List all messages in a specific thread (paginated)."""

    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            DirectMessage.objects.filter(
                thread_id=self.kwargs["thread_id"],
                thread__participants=self.request.user,
                is_deleted=False,
            )
            .select_related("sender__profile")
            .order_by("-created_at")
        )


class SendMessageView(APIView):
    """Send a message in a thread via REST (non-WebSocket)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, thread_id):
        try:
            thread = MessageThread.objects.get(
                pk=thread_id, participants=request.user
            )
        except MessageThread.DoesNotExist:
            return Response(
                {"detail": "Thread not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = SendMessageSerializer(
            data=request.data, context={"request": request, "thread": thread}
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        return Response(
            DirectMessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )


class MarkThreadReadView(APIView):
    """Mark all messages in a thread as read for the current user."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, thread_id):
        updated = DirectMessage.objects.filter(
            thread_id=thread_id,
            thread__participants=request.user,
            is_read=False,
        ).exclude(sender=request.user).update(is_read=True, read_at=timezone.now())
        return Response({"marked_read": updated}, status=status.HTTP_200_OK)
