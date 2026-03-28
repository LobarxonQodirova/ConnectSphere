from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FeedItem
from .serializers import FeedItemSerializer
from .services import compute_feed


class FeedView(generics.ListAPIView):
    """
    Return the personalised feed for the authenticated user.
    Generates / refreshes on every request (could be cached in production).
    """

    serializer_class = FeedItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        compute_feed(self.request.user)
        return (
            FeedItem.objects.filter(user=self.request.user)
            .select_related("post__author__profile", "share__user__profile")
            .prefetch_related("post__media", "post__hashtags")
            .order_by("-score", "-created_at")
        )


class MarkFeedSeenView(APIView):
    """Mark feed items as seen."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_ids = request.data.get("item_ids", [])
        if item_ids:
            FeedItem.objects.filter(
                user=request.user, id__in=item_ids
            ).update(is_seen=True)
        return Response({"detail": "Marked as seen."}, status=status.HTTP_200_OK)
