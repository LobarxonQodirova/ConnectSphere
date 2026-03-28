from rest_framework import serializers

from apps.posts.serializers import PostSerializer, ShareSerializer

from .models import FeedAlgorithm, FeedItem


class FeedItemSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    share = ShareSerializer(read_only=True)

    class Meta:
        model = FeedItem
        fields = [
            "id", "content_type", "post", "share",
            "score", "is_seen", "created_at",
        ]


class FeedAlgorithmSerializer(serializers.ModelSerializer):
    total_weight = serializers.FloatField(read_only=True, source="total_weight")

    class Meta:
        model = FeedAlgorithm
        fields = [
            "id", "name", "recency_weight", "engagement_weight",
            "relationship_weight", "diversity_weight",
            "is_active", "total_weight", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
