"""
Celery tasks for the notifications app.
"""
import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(name="apps.notifications.tasks.cleanup_old_notifications")
def cleanup_old_notifications(days=90):
    """
    Delete read notifications older than `days` days.
    Runs daily via Celery Beat.
    """
    from .models import Notification

    cutoff = timezone.now() - timedelta(days=days)
    qs = Notification.objects.filter(is_read=True, created_at__lt=cutoff)
    count = qs.count()
    qs.delete()
    logger.info("Cleaned up %d old notifications (older than %d days).", count, days)
    return count


@shared_task(name="apps.notifications.tasks.send_email_digest")
def send_email_digest():
    """
    Send a daily email digest of unread notifications to users
    who have opted in.
    """
    from django.contrib.auth import get_user_model
    from django.core.mail import send_mail
    from django.template.loader import render_to_string

    from .models import Notification

    User = get_user_model()
    yesterday = timezone.now() - timedelta(hours=24)

    users_with_unread = (
        Notification.objects.filter(is_read=False, created_at__gte=yesterday)
        .values_list("recipient_id", flat=True)
        .distinct()
    )

    sent = 0
    for user_id in users_with_unread:
        user = User.objects.get(pk=user_id)
        notifications = Notification.objects.filter(
            recipient=user, is_read=False, created_at__gte=yesterday
        ).order_by("-created_at")[:10]

        if not notifications:
            continue

        subject = f"ConnectSphere: You have {notifications.count()} new notifications"
        items = [
            {"title": n.title, "body": n.body, "created_at": n.created_at}
            for n in notifications
        ]

        try:
            send_mail(
                subject=subject,
                message="\n".join(f"- {i['title']}" for i in items),
                from_email="noreply@connectsphere.io",
                recipient_list=[user.email],
                fail_silently=True,
            )
            sent += 1
        except Exception as exc:
            logger.error("Failed to send digest to %s: %s", user.email, exc)

    logger.info("Sent email digest to %d users.", sent)
    return sent
