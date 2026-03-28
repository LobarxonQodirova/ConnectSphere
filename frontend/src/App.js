import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import FriendsPage from "./pages/FriendsPage";
import GroupsPage from "./pages/GroupsPage";
import SettingsPage from "./pages/SettingsPage";

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex max-w-7xl mx-auto pt-16">
        <Sidebar />
        <main className="flex-1 p-4 ml-64">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AuthLayout>
              <HomePage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <PrivateRoute>
            <AuthLayout>
              <ProfilePage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <AuthLayout>
              <MessagesPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <PrivateRoute>
            <AuthLayout>
              <FriendsPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <PrivateRoute>
            <AuthLayout>
              <GroupsPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <AuthLayout>
              <SettingsPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
