import React, { useEffect, useRef } from "react";
import Avatar from "../common/Avatar";
import { formatMessageTime } from "../../utils/formatters";

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg, idx) => {
        const isOwn = msg.sender?.id === currentUserId || msg.sender_id === currentUserId;
        const showAvatar =
          !isOwn && (idx === 0 || messages[idx - 1]?.sender?.id !== msg.sender?.id);

        return (
          <div
            key={msg.id || idx}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            {!isOwn && showAvatar && (
              <Avatar
                src={msg.sender?.avatar}
                name={msg.sender?.username || msg.sender_username || ""}
                size="xs"
                className="mr-2 mt-1"
              />
            )}
            {!isOwn && !showAvatar && <div className="w-8 mr-2" />}
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${
                isOwn
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  isOwn ? "text-indigo-200" : "text-gray-400"
                }`}
              >
                {formatMessageTime(msg.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
