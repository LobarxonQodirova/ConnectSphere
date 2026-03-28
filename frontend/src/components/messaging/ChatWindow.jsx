import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, sendMessage } from "../../store/slices/messageSlice";
import useWebSocket from "../../hooks/useWebSocket";
import MessageList from "./MessageList";
import Avatar from "../common/Avatar";

export default function ChatWindow({ threadId, threadInfo }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { sendingMessage, messagesByThread } = useSelector((s) => s.messages);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const threadData = messagesByThread[threadId] || { messages: [], hasMore: false };
  const messages = threadData.messages;

  // WebSocket connection for real-time chat
  const wsUrl = threadId
    ? `${process.env.REACT_APP_WS_URL || "ws://localhost/ws"}/chat/${threadId}/?token=${localStorage.getItem("access_token")}`
    : null;

  const { sendJsonMessage, isConnected } = useWebSocket(wsUrl);

  useEffect(() => {
    if (threadId) {
      dispatch(fetchMessages({ threadId, page: 1 }));
    }
  }, [dispatch, threadId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    if (isConnected) {
      sendJsonMessage({ action: "message", content: text });
    } else {
      dispatch(sendMessage({ threadId, content: text }));
    }

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose from your existing chats or start a new one.</p>
        </div>
      </div>
    );
  }

  const otherParticipant = threadInfo?.participants?.find((p) => p.id !== user?.id);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200 bg-white">
        <Avatar
          src={otherParticipant?.avatar}
          name={otherParticipant?.username || threadInfo?.title || "Chat"}
          size="sm"
          showStatus
          isOnline={otherParticipant?.is_online}
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {threadInfo?.title || otherParticipant?.first_name || otherParticipant?.username || "Chat"}
          </p>
          <p className="text-xs text-gray-500">
            {isConnected ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={user?.id} />

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={sendingMessage || !inputValue.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
                       hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
