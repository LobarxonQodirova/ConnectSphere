"""
Notification creation service.
Creates a Notification record and pushes it in real-time via WebSocket.
"""
import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification

logger = logging.getLogger(__name__)


def create_notification(
    recipient,
    notification_type,
    title,
    body="",
    link="",
    sender=None,
):
    """
    Persist a notification and broadcast it over WebSocket.

    Args:
        recipient: User instance that receives the notification.
        notification_type: One of Notification.TYPE_CHOICES values.
        title: Short headline text.
        body: Optional detail text.
        link: Optional frontend route to deep-link.
        sender: Optional User that triggered the notification.
    """
    # Don't notify yourself
    if sender and sender.pk == recipient.pk:
        return None

    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        body=body,
        link=link,
    )

    # Push via WebSocket
    channel_layer = get_channel_layer()
    group_name = f"notifications_{recipient.pk}"

    payload = {
        "id": str(notification.pk),
        "type_label": notification_type,
        "title": title,
        "body": body,
        "link": link,
        "sender": sender.username if sender else None,
        "created_at": notification.created_at.isoformat(),
    }

    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {"type": "send_notification", "notification": payload},
        )
    except Exception as exc:
        logger.warning("Failed to push notification via WS: %s", exc)

    return notification


def notify_post_liked(post, liker):
    """Notify the post author that someone liked their post."""
    create_notification(
        recipient=post.author,
        sender=liker,
        notification_type="like",
        title=f"{liker.username} liked your post",
        link=f"/posts/{post.pk}",
    )


def notify_post_commented(post, commenter, comment_text):
    """Notify the post author about a new comment."""
    preview = comment_text[:80] + "..." if len(comment_text) > 80 else comment_text
    create_notification(
        recipient=post.author,
        sender=commenter,
        notification_type="comment",
        title=f"{commenter.username} commented on your post",
        body=preview,
        link=f"/posts/{post.pk}",
    )


def notify_friend_request(friend_request):
    """Notify a user they received a friend request."""
    create_notification(
        recipient=friend_request.receiver,
        sender=friend_request.sender,
        notification_type="friend_request",
        title=f"{friend_request.sender.username} sent you a friend request",
        link="/friends/requests",
    )


def notify_friend_accepted(friend_request):
    """Notify the sender that their friend request was accepted."""
    create_notification(
        recipient=friend_request.sender,
        sender=friend_request.receiver,
        notification_type="friend_accept",
        title=f"{friend_request.receiver.username} accepted your friend request",
        link=f"/profile/{friend_request.receiver.username}",
    )
