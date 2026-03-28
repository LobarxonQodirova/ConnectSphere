from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Block, FriendRequest, Friendship
from .serializers import BlockSerializer, FriendRequestSerializer, FriendshipSerializer


class SendFriendRequestView(generics.CreateAPIView):
    """Send a new friend request."""

    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ReceivedFriendRequestsView(generics.ListAPIView):
    """List all pending friend requests received by the current user."""

    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            FriendRequest.objects.filter(
                receiver=self.request.user, status="pending"
            )
            .select_related("sender__profile", "receiver__profile")
        )


class SentFriendRequestsView(generics.ListAPIView):
    """List all pending friend requests sent by the current user."""

    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            FriendRequest.objects.filter(
                sender=self.request.user, status="pending"
            )
            .select_related("sender__profile", "receiver__profile")
        )


class AcceptFriendRequestView(APIView):
    """Accept a pending friend request."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(
                pk=pk, receiver=request.user, status="pending"
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        friend_request.accept()
        return Response(
            {"detail": "Friend request accepted."},
            status=status.HTTP_200_OK,
        )


class RejectFriendRequestView(APIView):
    """Reject a pending friend request."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(
                pk=pk, receiver=request.user, status="pending"
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        friend_request.reject()
        return Response(
            {"detail": "Friend request rejected."},
            status=status.HTTP_200_OK,
        )


class FriendListView(generics.ListAPIView):
    """List all friends of the current user."""

    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(
            Q(user1=self.request.user) | Q(user2=self.request.user)
        ).select_related("user1__profile", "user2__profile")


class UnfriendView(APIView):
    """Remove a friend (delete the Friendship record)."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id):
        deleted, _ = Friendship.objects.filter(
            Q(user1=request.user, user2_id=user_id)
            | Q(user1_id=user_id, user2=request.user)
        ).delete()
        if not deleted:
            return Response(
                {"detail": "Friendship not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class BlockUserView(generics.CreateAPIView):
    """Block another user."""

    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]


class UnblockUserView(APIView):
    """Unblock a user."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id):
        deleted, _ = Block.objects.filter(
            blocker=request.user, blocked_id=user_id
        ).delete()
        if not deleted:
            return Response(
                {"detail": "Block not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class FriendSuggestionsView(APIView):
    """Suggest friends based on mutual connections."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        user = request.user

        # Gather current friend IDs
        friend_ids = set()
        for fs in Friendship.objects.filter(Q(user1=user) | Q(user2=user)):
            friend_ids.add(fs.user1_id if fs.user2_id == user.pk else fs.user2_id)

        blocked_ids = set(
            Block.objects.filter(Q(blocker=user) | Q(blocked=user)).values_list(
                "blocker_id", flat=True
            )
        ) | set(
            Block.objects.filter(Q(blocker=user) | Q(blocked=user)).values_list(
                "blocked_id", flat=True
            )
        )

        exclude_ids = friend_ids | blocked_ids | {user.pk}

        # Friends of friends, ranked by mutual count
        from django.db.models import Count

        suggestions = (
            User.objects.filter(
                Q(friendship_user1__user2_id__in=friend_ids)
                | Q(friendship_user2__user1_id__in=friend_ids)
            )
            .exclude(pk__in=exclude_ids)
            .annotate(mutual_count=Count("id"))
            .order_by("-mutual_count")[:20]
        )

        from apps.accounts.serializers import UserMinimalSerializer

        data = UserMinimalSerializer(
            suggestions, many=True, context={"request": request}
        ).data
        return Response(data)
