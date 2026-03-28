from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "profile/<str:username>/",
        views.ProfileView.as_view(),
        name="profile-detail",
    ),
    path("profile/", views.ProfileUpdateView.as_view(), name="profile-update"),
    path("privacy/", views.PrivacySettingsView.as_view(), name="privacy-settings"),
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
]
