import React from "react";
import { useDispatch } from "react-redux";
import { acceptFriendRequest, rejectFriendRequest } from "../../store/slices/friendSlice";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/formatters";

export default function FriendRequest({ request }) {
  const dispatch = useDispatch();
  const { sender, message, created_at, id } = request;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <Avatar src={sender.avatar} name={sender.username} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {sender.first_name || sender.username}
          </p>
          <p className="text-xs text-gray-500">@{sender.username}</p>
          {message && (
            <p className="text-sm text-gray-600 mt-1 italic">"{message}"</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{timeAgo(created_at)}</p>
        </div>
      </div>

      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => dispatch(acceptFriendRequest(id))}
          className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium
                     rounded-lg hover:bg-indigo-700 transition"
        >
          Accept
        </button>
        <button
          onClick={() => dispatch(rejectFriendRequest(id))}
          className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium
                     rounded-lg hover:bg-gray-200 transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
