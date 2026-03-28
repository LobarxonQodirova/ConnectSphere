from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import PrivacySettings, UserProfile

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that includes user data in the token response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserMinimalSerializer(self.user).data
        return data


class UserMinimalSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for nested representations."""

    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "avatar", "is_online"]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
            return obj.profile.avatar.url
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the UserProfile model."""

    class Meta:
        model = UserProfile
        fields = [
            "avatar", "cover_photo", "bio", "location", "website",
            "gender", "phone_number", "occupation", "education",
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user detail serializer."""

    profile = UserProfileSerializer(read_only=True)
    friend_count = serializers.IntegerField(read_only=True)
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "date_of_birth", "is_verified", "is_online", "last_seen",
            "date_joined", "profile", "friend_count", "post_count",
        ]
        read_only_fields = ["id", "is_verified", "date_joined"]

    def get_post_count(self, obj):
        return obj.posts.count() if hasattr(obj, "posts") else 0


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "username", "password", "password_confirm",
            "first_name", "last_name",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        PrivacySettings.objects.create(user=user)
        return user


class PrivacySettingsSerializer(serializers.ModelSerializer):
    """Serializer for user privacy settings."""

    class Meta:
        model = PrivacySettings
        exclude = ["id", "user"]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
