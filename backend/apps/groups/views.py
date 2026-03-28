from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Group, GroupMember, GroupPost
from .serializers import GroupMemberSerializer, GroupPostSerializer, GroupSerializer


class IsGroupAdminOrReadOnly(permissions.BasePermission):
    """Only group admins can edit the group; anyone can read."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return GroupMember.objects.filter(
            group=obj, user=request.user, role="admin"
        ).exists()


class GroupViewSet(viewsets.ModelViewSet):
    """CRUD operations for groups."""

    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Group.objects.filter(is_active=True).select_related("creator__profile")

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def join(self, request, slug=None):
        """Join a group."""
        group = self.get_object()
        if GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(
                {"detail": "Already a member."}, status=status.HTTP_400_BAD_REQUEST
            )
        is_approved = group.privacy == "public"
        GroupMember.objects.create(
            group=group, user=request.user, is_approved=is_approved
        )
        if is_approved:
            group.member_count += 1
            group.save(update_fields=["member_count"])
        msg = "Joined successfully." if is_approved else "Join request sent."
        return Response({"detail": msg}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def leave(self, request, slug=None):
        """Leave a group."""
        group = self.get_object()
        deleted, _ = GroupMember.objects.filter(
            group=group, user=request.user
        ).delete()
        if deleted:
            group.member_count = max(0, group.member_count - 1)
            group.save(update_fields=["member_count"])
        return Response(
            {"detail": "Left the group."}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["get"])
    def members(self, request, slug=None):
        """List members of a group."""
        group = self.get_object()
        members = GroupMember.objects.filter(
            group=group, is_approved=True
        ).select_related("user__profile")
        serializer = GroupMemberSerializer(
            members, many=True, context={"request": request}
        )
        return Response(serializer.data)


class GroupPostListCreateView(generics.ListCreateAPIView):
    """List or create posts within a group."""

    serializer_class = GroupPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            GroupPost.objects.filter(
                group__slug=self.kwargs["slug"], is_approved=True
            )
            .select_related("author__profile")
        )

    def perform_create(self, serializer):
        group = Group.objects.get(slug=self.kwargs["slug"])
        if not GroupMember.objects.filter(
            group=group, user=self.request.user, is_approved=True
        ).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be a member to post in this group.")
        serializer.save(author=self.request.user, group=group)
