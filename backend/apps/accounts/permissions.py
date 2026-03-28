from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission: only the owner of an object can modify it.
    Read access is granted to any authenticated user.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, "user"):
            return obj.user == request.user
        return obj == request.user


class IsProfileOwner(permissions.BasePermission):
    """Only the profile owner can view/edit their own sensitive data."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to any user, write access only to admins."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
