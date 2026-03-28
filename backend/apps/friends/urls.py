from django.urls import path

from . import views

app_name = "friends"

urlpatterns = [
    path("", views.FriendListView.as_view(), name="friend-list"),
    path("request/", views.SendFriendRequestView.as_view(), name="send-request"),
    path("requests/received/", views.ReceivedFriendRequestsView.as_view(), name="received-requests"),
    path("requests/sent/", views.SentFriendRequestsView.as_view(), name="sent-requests"),
    path("request/<uuid:pk>/accept/", views.AcceptFriendRequestView.as_view(), name="accept-request"),
    path("request/<uuid:pk>/reject/", views.RejectFriendRequestView.as_view(), name="reject-request"),
    path("unfriend/<uuid:user_id>/", views.UnfriendView.as_view(), name="unfriend"),
    path("block/", views.BlockUserView.as_view(), name="block-user"),
    path("unblock/<uuid:user_id>/", views.UnblockUserView.as_view(), name="unblock-user"),
    path("suggestions/", views.FriendSuggestionsView.as_view(), name="friend-suggestions"),
]
