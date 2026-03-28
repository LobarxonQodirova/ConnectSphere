from django.urls import path

from . import views

app_name = "messaging"

urlpatterns = [
    path("threads/", views.ThreadListView.as_view(), name="thread-list"),
    path("threads/create/", views.CreateThreadView.as_view(), name="thread-create"),
    path(
        "threads/<uuid:thread_id>/messages/",
        views.ThreadMessagesView.as_view(),
        name="thread-messages",
    ),
    path(
        "threads/<uuid:thread_id>/send/",
        views.SendMessageView.as_view(),
        name="send-message",
    ),
    path(
        "threads/<uuid:thread_id>/read/",
        views.MarkThreadReadView.as_view(),
        name="mark-read",
    ),
]
