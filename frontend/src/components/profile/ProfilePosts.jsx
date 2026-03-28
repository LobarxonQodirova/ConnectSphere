import React, { useEffect, useState } from "react";
import postApi from "../../api/postApi";
import PostCard from "../feed/PostCard";

export default function ProfilePosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    postApi
      .getFeed(1)
      .then(({ data }) => {
        // Filter feed items for this user's posts
        const userPosts = (data.results || []).filter(
          (item) => item.post?.author?.id === userId
        );
        setPosts(userPosts);
        setHasMore(!!data.next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setLoading(true);
    postApi
      .getFeed(page + 1)
      .then(({ data }) => {
        const userPosts = (data.results || []).filter(
          (item) => item.post?.author?.id === userId
        );
        setPosts((prev) => [...prev, ...userPosts]);
        setPage((p) => p + 1);
        setHasMore(!!data.next);
      })
      .finally(() => setLoading(false));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((item) => (
        <PostCard key={item.id} feedItem={item} />
      ))}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
