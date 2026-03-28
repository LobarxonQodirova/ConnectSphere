from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = "groups"

router = DefaultRouter()
router.register(r"", views.GroupViewSet, basename="group")

urlpatterns = [
    path(
        "<slug:slug>/posts/",
        views.GroupPostListCreateView.as_view(),
        name="group-posts",
    ),
    path("", include(router.urls)),
]
