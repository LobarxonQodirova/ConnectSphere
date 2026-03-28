import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleLike, removePost } from "../../store/slices/feedSlice";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/formatters";

export default function PostCard({ feedItem }) {
  const dispatch = useDispatch();
  const post = feedItem?.post;
  const [showComments, setShowComments] = useState(false);

  if (!post) return null;

  const { author, content, media, like_count, comment_count, share_count, is_liked, created_at } = post;

  const handleLike = () => {
    dispatch(toggleLike({ postId: post.id, isLiked: is_liked, reaction: "like" }));
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${author.username}`} className="flex items-center space-x-3">
          <Avatar src={author.avatar} name={author.username} size="md" showStatus isOnline={author.is_online} />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {author.first_name || author.username}
            </p>
            <p className="text-xs text-gray-500">{timeAgo(created_at)}</p>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{content}</p>
      </div>

      {/* Media grid */}
      {media && media.length > 0 && (
        <div className={`grid ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-0.5`}>
          {media.map((m) => (
            <div key={m.id} className="relative aspect-square overflow-hidden">
              {m.media_type === "video" ? (
                <video src={m.file} className="w-full h-full object-cover" controls />
              ) : (
                <img src={m.file} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
        <span>{like_count} likes</span>
        <div className="space-x-3">
          <span>{comment_count} comments</span>
          <span>{share_count} shares</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium transition
            ${is_liked ? "text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <svg className="w-5 h-5 mr-1.5" fill={is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21H4a1 1 0 01-1-1v-8a1 1 0 011-1h3l2.75-5.5A1.5 1.5 0 0111 4.5V10z" />
          </svg>
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </article>
  );
}
