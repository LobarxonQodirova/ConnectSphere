import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../../store/slices/friendSlice";
import Avatar from "../common/Avatar";

export default function FriendList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg font-medium">No friends yet</p>
        <p className="text-sm mt-1">Send friend requests to start connecting.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((friendship) => {
        const friend = friendship.friend;
        if (!friend) return null;
        return (
          <div
            key={friendship.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center space-x-3 hover:shadow-sm transition"
          >
            <Avatar
              src={friend.avatar}
              name={friend.username}
              size="lg"
              showStatus
              isOnline={friend.is_online}
            />
            <div className="flex-1 min-w-0">
              <Link
                to={`/profile/${friend.username}`}
                className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate block"
              >
                {friend.first_name || friend.username}
              </Link>
              <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
            </div>
            <Link
              to={`/messages?user=${friend.id}`}
              className="text-indigo-600 hover:text-indigo-800 p-2"
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
