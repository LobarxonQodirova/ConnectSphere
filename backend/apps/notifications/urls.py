from django.urls import path
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification

app_name = "notifications"


class NotificationSerializer:
    """Inline lightweight serializer (avoids a separate file for 3 fields)."""
    pass


from rest_framework import serializers as drf_serializers
from apps.accounts.serializers import UserMinimalSerializer


class NotificationSerializer(drf_serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "sender", "notification_type", "title",
            "body", "link", "is_read", "created_at",
        ]


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Notification.objects.filter(recipient=self.request.user)
            .select_related("sender__profile")
            .order_by("-created_at")
        )


class MarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        Notification.objects.filter(pk=pk, recipient=request.user).update(is_read=True)
        return Response({"detail": "Marked as read."})


class MarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})


class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({"unread_count": count})


urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("<uuid:pk>/read/", MarkReadView.as_view(), name="mark-read"),
    path("read-all/", MarkAllReadView.as_view(), name="mark-all-read"),
    path("unread-count/", UnreadCountView.as_view(), name="unread-count"),
]
