"""
Feed generation service.
Computes the personalized feed for a user by scoring posts from
friends, groups, and public content according to the active algorithm.
"""
import math
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from apps.friends.models import Friendship
from apps.posts.models import Post

from .models import FeedAlgorithm, FeedItem


def _get_active_algorithm():
    """Return the active FeedAlgorithm or sensible defaults."""
    try:
        return FeedAlgorithm.objects.get(is_active=True)
    except FeedAlgorithm.DoesNotExist:
        return FeedAlgorithm(
            recency_weight=0.3,
            engagement_weight=0.4,
            relationship_weight=0.2,
            diversity_weight=0.1,
        )


def _recency_score(post, max_age_hours=72):
    """Score between 0..1 based on how recent the post is."""
    age = (timezone.now() - post.created_at).total_seconds() / 3600
    return max(0.0, 1.0 - (age / max_age_hours))


def _engagement_score(post):
    """Score based on normalised engagement metrics."""
    total = post.like_count + post.comment_count * 2 + post.share_count * 3
    return 1.0 - (1.0 / (1.0 + math.log1p(total)))


def _relationship_score(user, post_author, friend_ids):
    """Score based on whether the author is a friend."""
    if post_author.pk in friend_ids:
        return 1.0
    return 0.2  # public content from non-friends


def compute_feed(user, limit=50):
    """
    Build or refresh the feed for the given user.
    Returns the list of newly scored FeedItem instances.
    """
    algo = _get_active_algorithm()

    friend_ids = set()
    for fs in Friendship.objects.filter(Q(user1=user) | Q(user2=user)):
        friend_ids.add(fs.user1_id if fs.user2_id == user.pk else fs.user2_id)

    cutoff = timezone.now() - timedelta(hours=72)
    candidate_posts = (
        Post.objects.filter(created_at__gte=cutoff)
        .filter(
            Q(author_id__in=friend_ids, visibility__in=["friends", "public"])
            | Q(visibility="public")
            | Q(author=user)
        )
        .select_related("author")
        .distinct()
        .order_by("-created_at")[:200]
    )

    # Remove old feed items for this user and regenerate
    FeedItem.objects.filter(user=user, created_at__lt=cutoff).delete()

    items = []
    seen_authors = set()
    for post in candidate_posts:
        recency = _recency_score(post)
        engagement = _engagement_score(post)
        relationship = _relationship_score(user, post.author, friend_ids)

        # Simple diversity: penalise if we already have many items from same author
        diversity = 1.0 if post.author_id not in seen_authors else 0.5
        seen_authors.add(post.author_id)

        score = (
            algo.recency_weight * recency
            + algo.engagement_weight * engagement
            + algo.relationship_weight * relationship
            + algo.diversity_weight * diversity
        )

        item, _ = FeedItem.objects.update_or_create(
            user=user,
            post=post,
            defaults={"score": round(score, 6), "content_type": "post"},
        )
        items.append(item)

    items.sort(key=lambda i: (-i.score, i.created_at))
    return items[:limit]
