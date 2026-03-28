import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends, fetchRequests } from "../store/slices/friendSlice";
import FriendList from "../components/friends/FriendList";
import FriendRequest from "../components/friends/FriendRequest";
import FriendSuggestions from "../components/friends/FriendSuggestions";

const tabs = [
  { key: "friends", label: "All Friends" },
  { key: "requests", label: "Requests" },
  { key: "suggestions", label: "Suggestions" },
];

export default function FriendsPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("friends");
  const { requests } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(fetchFriends());
    dispatch(fetchRequests());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Friends</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.key === "requests" && requests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "friends" && <FriendList />}
      {activeTab === "requests" && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg font-medium">No pending requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requests.map((req) => (
                <FriendRequest key={req.id} request={req} />
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === "suggestions" && <FriendSuggestions />}
    </div>
  );
}
