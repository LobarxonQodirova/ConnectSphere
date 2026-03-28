import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import Avatar from "../common/Avatar";

/**
 * Horizontal scrollable bar showing friend stories at the top of the feed.
 */
export default function StoryBar({ onViewStory, onCreateStory }) {
  const [storiesByUser, setStoriesByUser] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stories/")
      .then(({ data }) => {
        const results = data.results || data;
        // Group stories by author
        const grouped = {};
        results.forEach((story) => {
          const authorId = story.author.id;
          if (!grouped[authorId]) {
            grouped[authorId] = {
              author: story.author,
              stories: [],
              hasUnviewed: false,
            };
          }
          grouped[authorId].stories.push(story);
          if (!story.is_viewed) {
            grouped[authorId].hasUnviewed = true;
          }
        });
        setStoriesByUser(Object.values(grouped));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide">
        {/* Create story button */}
        <button
          onClick={onCreateStory}
          className="flex flex-col items-center flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[11px] text-gray-500 mt-1">Your story</span>
        </button>

        {/* Friend stories */}
        {storiesByUser.map((group) => (
          <button
            key={group.author.id}
            onClick={() => onViewStory(group.stories)}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div
              className={`p-0.5 rounded-full ${
                group.hasUnviewed
                  ? "bg-gradient-to-tr from-indigo-500 to-pink-500"
                  : "bg-gray-300"
              }`}
            >
              <Avatar
                src={group.author.avatar}
                name={group.author.username}
                size="lg"
                className="border-2 border-white rounded-full"
              />
            </div>
            <span className="text-[11px] text-gray-600 mt-1 truncate max-w-[64px]">
              {group.author.first_name || group.author.username}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
