import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Avatar from "../components/common/Avatar";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("discover"); // "discover" | "my"

  useEffect(() => {
    setLoading(true);
    api
      .get("/groups/")
      .then(({ data }) => setGroups(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredGroups =
    filter === "my"
      ? groups.filter((g) => g.is_member)
      : groups;

  const handleJoin = async (slug) => {
    try {
      await api.post(`/groups/${slug}/join/`);
      setGroups((prev) =>
        prev.map((g) =>
          g.slug === slug
            ? { ...g, is_member: true, member_count: g.member_count + 1 }
            : g
        )
      );
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">
          Create Group
        </button>
      </div>

      {/* Filter */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 max-w-xs">
        {[
          { key: "discover", label: "Discover" },
          { key: "my", label: "My Groups" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              filter === tab.key
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg font-medium">No groups found</p>
          <p className="text-sm mt-1">Create one or explore public groups.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition"
            >
              {/* Cover */}
              <div className="h-28 bg-gradient-to-r from-indigo-400 to-purple-400">
                {group.cover_image && (
                  <img src={group.cover_image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar src={group.avatar} name={group.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{group.name}</h3>
                    <p className="text-xs text-gray-500">
                      {group.privacy} &middot; {group.member_count} members
                    </p>
                  </div>
                </div>
                {group.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{group.description}</p>
                )}
                <div className="mt-3">
                  {group.is_member ? (
                    <span className="text-xs text-green-600 font-medium">Joined</span>
                  ) : (
                    <button
                      onClick={() => handleJoin(group.slug)}
                      className="w-full py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
