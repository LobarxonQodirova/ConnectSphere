import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads, setActiveThread } from "../../store/slices/messageSlice";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/formatters";

export default function ConversationList() {
  const dispatch = useDispatch();
  const { threads, activeThreadId, loading } = useSelector((s) => s.messages);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchThreads());
  }, [dispatch]);

  if (loading && threads.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {threads.map((thread) => {
        const isActive = thread.id === activeThreadId;
        const otherUser = thread.participants?.find((p) => p.id !== user?.id);
        const displayName =
          thread.title || otherUser?.first_name || otherUser?.username || "Chat";
        const lastMsg = thread.last_message;

        return (
          <button
            key={thread.id}
            onClick={() => dispatch(setActiveThread(thread.id))}
            className={`w-full flex items-center space-x-3 px-3 py-3 text-left transition
              ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}
          >
            <Avatar
              src={otherUser?.avatar}
              name={displayName}
              size="md"
              showStatus
              isOnline={otherUser?.is_online}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                {lastMsg && (
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                    {timeAgo(lastMsg.created_at)}
                  </span>
                )}
              </div>
              {lastMsg && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {lastMsg.sender?.id === user?.id ? "You: " : ""}
                  {lastMsg.content}
                </p>
              )}
            </div>
            {thread.unread_count > 0 && (
              <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {thread.unread_count > 9 ? "9+" : thread.unread_count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
