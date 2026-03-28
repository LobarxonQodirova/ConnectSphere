import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/slices/authSlice";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePosts from "../components/profile/ProfilePosts";
import EditProfile from "../components/profile/EditProfile";

export default function ProfilePage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profileData, loading } = useSelector((s) => s.auth);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (username) {
      dispatch(fetchProfile(username));
    }
  }, [dispatch, username]);

  if (loading || !profileData) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <ProfileHeader
        profileUser={profileData}
        onEditClick={() => setShowEditModal(true)}
      />

      {/* Tabs (simplified) */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b px-4">
          <button className="py-3 px-4 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600">
            Posts
          </button>
          <button className="py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            About
          </button>
          <button className="py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Friends
          </button>
          <button className="py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Photos
          </button>
        </div>
        <div className="p-4">
          <ProfilePosts userId={profileData.id} />
        </div>
      </div>

      {showEditModal && (
        <EditProfile
          profile={profileData.profile}
          onClose={() => setShowEditModal(false)}
          onSaved={() => dispatch(fetchProfile(username))}
        />
      )}
    </div>
  );
}
