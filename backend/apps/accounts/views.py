from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import PrivacySettings, UserProfile
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    PrivacySettingsSerializer,
    RegisterSerializer,
    UserDetailSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns JWT tokens with user data."""

    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Handle user registration."""

    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserDetailSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """Blacklist the refresh token on logout."""

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"detail": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(generics.RetrieveAPIView):
    """Retrieve a user profile by username."""

    serializer_class = UserDetailSerializer
    lookup_field = "username"
    queryset = User.objects.select_related("profile", "privacy").all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ProfileUpdateView(generics.UpdateAPIView):
    """Update the authenticated user's profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class PrivacySettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update the authenticated user's privacy settings."""

    serializer_class = PrivacySettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        settings, _ = PrivacySettings.objects.get_or_create(user=self.request.user)
        return settings


class ChangePasswordView(APIView):
    """Allow authenticated users to change their password."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )
