import React from "react";
import { useSelector } from "react-redux";
import Avatar from "../common/Avatar";
import { formatDate } from "../../utils/formatters";

export default function ProfileHeader({ profileUser, onEditClick }) {
  const { user } = useSelector((s) => s.auth);
  const isOwnProfile = user?.id === profileUser?.id;

  if (!profileUser) return null;

  const profile = profileUser.profile || {};

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Cover photo */}
      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        {profile.cover_photo && (
          <img
            src={profile.cover_photo}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile info */}
      <div className="px-6 pb-6">
        <div className="flex items-end -mt-12 mb-4">
          <Avatar
            src={profile.avatar}
            name={profileUser.username}
            size="xl"
            showStatus
            isOnline={profileUser.is_online}
            className="ring-4 ring-white"
          />
          <div className="ml-auto mt-14 flex space-x-2">
            {isOwnProfile ? (
              <button
                onClick={onEditClick}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
                           text-gray-700 hover:bg-gray-50 transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                  Add Friend
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          {profileUser.first_name} {profileUser.last_name}
        </h1>
        <p className="text-gray-500">@{profileUser.username}</p>

        {profile.bio && (
          <p className="text-gray-700 mt-2 text-sm">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          {profile.location && (
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{profile.location}</span>
            </span>
          )}
          {profile.occupation && (
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{profile.occupation}</span>
            </span>
          )}
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Joined {formatDate(profileUser.date_joined)}</span>
          </span>
        </div>

        <div className="flex space-x-6 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{profileUser.friend_count || 0}</p>
            <p className="text-xs text-gray-500">Friends</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{profileUser.post_count || 0}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
