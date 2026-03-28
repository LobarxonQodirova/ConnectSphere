import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeed } from "../../store/slices/feedSlice";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import PostCard from "./PostCard";

export default function FeedList() {
  const dispatch = useDispatch();
  const { items, loading, hasMore, page, error } = useSelector((s) => s.feed);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchFeed(1));
    }
  }, [dispatch, items.length]);

  const loadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchFeed(page + 1));
    }
  };

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
        <button
          onClick={() => dispatch(fetchFeed(1))}
          className="ml-2 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <PostCard key={item.id} feedItem={item} />
      ))}

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg font-medium">Your feed is empty</p>
          <p className="text-sm mt-1">Add friends or join groups to see posts here.</p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
