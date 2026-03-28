import React from "react";
import { useSelector } from "react-redux";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";

export default function MessagesPage() {
  const { threads, activeThreadId } = useSelector((s) => s.messages);
  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 6rem)" }}>
      {/* Conversation sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>

      {/* Chat area */}
      <ChatWindow threadId={activeThreadId} threadInfo={activeThread} />
    </div>
  );
}
