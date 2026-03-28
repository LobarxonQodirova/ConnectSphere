import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function SettingsPage() {
  const [privacy, setPrivacy] = useState({
    profile_visibility: "public",
    post_default_visibility: "friends",
    friend_list_visibility: "friends",
    allow_friend_requests: true,
    allow_messages_from_strangers: false,
    show_online_status: true,
    show_last_seen: true,
    searchable: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get("/auth/privacy/").then(({ data }) => setPrivacy(data)).catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/auth/privacy/", privacy);
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "friends", label: "Friends Only" },
    { value: "private", label: "Only Me" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes("Failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>

          {/* Visibility selects */}
          {[
            { field: "profile_visibility", label: "Profile Visibility" },
            { field: "post_default_visibility", label: "Default Post Visibility" },
            { field: "friend_list_visibility", label: "Friend List Visibility" },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center justify-between py-3">
              <label className="text-sm text-gray-700">{label}</label>
              <select
                value={privacy[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {visibilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication</h2>

          {/* Toggle switches */}
          {[
            { field: "allow_friend_requests", label: "Allow Friend Requests" },
            { field: "allow_messages_from_strangers", label: "Allow Messages from Non-Friends" },
            { field: "show_online_status", label: "Show Online Status" },
            { field: "show_last_seen", label: "Show Last Seen" },
            { field: "searchable", label: "Appear in Search Results" },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center justify-between py-3">
              <label className="text-sm text-gray-700">{label}</label>
              <button
                onClick={() => handleChange(field, !privacy[field])}
                className={`relative w-11 h-6 rounded-full transition ${
                  privacy[field] ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    privacy[field] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
