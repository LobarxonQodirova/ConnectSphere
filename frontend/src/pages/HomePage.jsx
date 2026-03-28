import React, { useState } from "react";
import StoryBar from "../components/stories/StoryBar";
import StoryViewer from "../components/stories/StoryViewer";
import StoryCreator from "../components/stories/StoryCreator";
import CreatePost from "../components/feed/CreatePost";
import FeedList from "../components/feed/FeedList";
import FriendSuggestions from "../components/friends/FriendSuggestions";

export default function HomePage() {
  const [viewingStories, setViewingStories] = useState(null);
  const [creatingStory, setCreatingStory] = useState(false);

  return (
    <div className="flex space-x-6">
      {/* Main feed column */}
      <div className="flex-1 max-w-2xl">
        <StoryBar
          onViewStory={(stories) => setViewingStories(stories)}
          onCreateStory={() => setCreatingStory(true)}
        />
        <CreatePost />
        <div className="mt-4">
          <FeedList />
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block w-80 space-y-4">
        <FriendSuggestions />

        {/* Trending section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Trending</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="hover:text-indigo-600 cursor-pointer">#technology</p>
            <p className="hover:text-indigo-600 cursor-pointer">#photography</p>
            <p className="hover:text-indigo-600 cursor-pointer">#travel</p>
            <p className="hover:text-indigo-600 cursor-pointer">#fitness</p>
            <p className="hover:text-indigo-600 cursor-pointer">#cooking</p>
          </div>
        </div>
      </aside>

      {/* Story modals */}
      {viewingStories && (
        <StoryViewer
          stories={viewingStories}
          onClose={() => setViewingStories(null)}
        />
      )}
      {creatingStory && (
        <StoryCreator
          onClose={() => setCreatingStory(false)}
          onCreated={() => window.location.reload()}
        />
      )}
    </div>
  );
}
