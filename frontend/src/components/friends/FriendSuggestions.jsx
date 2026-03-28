import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuggestions } from "../../store/slices/friendSlice";
import friendApi from "../../api/friendApi";
import Avatar from "../common/Avatar";

export default function FriendSuggestions() {
  const dispatch = useDispatch();
  const { suggestions } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  const handleAddFriend = async (userId) => {
    try {
      await friendApi.sendFriendRequest(userId);
      dispatch(fetchSuggestions());
    } catch (err) {
      console.error("Failed to send friend request:", err);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">People You May Know</h3>
      <div className="space-y-3">
        {suggestions.slice(0, 5).map((user) => (
          <div key={user.id} className="flex items-center space-x-3">
            <Avatar src={user.avatar} name={user.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.first_name || user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
            <button
              onClick={() => handleAddFriend(user.id)}
              className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50
                         rounded-full hover:bg-indigo-100 transition"
            >
              Add Friend
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
