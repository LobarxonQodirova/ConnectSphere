import React, { useCallback, useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/formatters";
import api from "../../api/axiosConfig";

/**
 * Fullscreen modal to view stories one by one with auto-advance.
 */
export default function StoryViewer({ stories, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const story = stories[currentIndex];
  const duration = (story?.duration || 5) * 1000; // ms

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  // Mark the story as viewed on the backend
  useEffect(() => {
    if (story?.id) {
      api.get(`/stories/${story.id}/`).catch(() => {});
    }
  }, [story?.id]);

  // Auto-advance timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 100 / (duration / 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex, duration, goNext]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{
                width:
                  idx < currentIndex
                    ? "100%"
                    : idx === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Avatar src={story.author?.avatar} name={story.author?.username} size="sm" />
          <div>
            <p className="text-white text-sm font-semibold">{story.author?.username}</p>
            <p className="text-white/60 text-xs">{timeAgo(story.created_at)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md mx-auto h-full flex items-center justify-center">
        {story.media_type === "text" ? (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor: story.background_color }}
          >
            <p className="text-white text-2xl font-bold text-center" style={{ fontStyle: story.font_style }}>
              {story.text_content}
            </p>
          </div>
        ) : story.media_type === "video" ? (
          <video
            src={story.media_file}
            autoPlay
            muted
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            src={story.media_file}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        )}

        {/* Navigation tap zones */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 cursor-pointer" onClick={goPrev} />
          <div className="w-1/2 cursor-pointer" onClick={goNext} />
        </div>
      </div>

      {/* View count */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs">
        {story.view_count} views
      </div>
    </div>
  );
}
