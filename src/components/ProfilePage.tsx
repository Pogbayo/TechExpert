import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiLogOut,
  FiUser,
  FiEdit2,
  FiLock,
  FiX,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useProfile } from "../context/ProfileContextFolder/ProfileContext";
import Avatar from "./Avatar";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { updateUsername, updatePassword, loading, error, setError } =
    useProfile();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleUpdateUsername = async () => {
    const success = await updateUsername(newUsername);
    if (success) {
      setShowEditUsername(false);
      setNewUsername(newUsername); // Ensure state is updated
      toast.success("Username updated successfully");
    } else if (!success) {
      toast.error("Error updating username");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const success = await updatePassword("", newPassword);
    if (success) {
      setShowEditPassword(false);
      toast.success("Password updated successfully");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] p-6 text-[var(--color-text)] transition-colors duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate("/chat")}
        className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-primary)] mb-4 w-fit transition-transform hover:scale-105 active:scale-95"
      >
        <FiArrowLeft />
        <span>Back to Chats</span>
      </button>

      {/* Profile Card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center animate-fade-in">
          {/* Avatar */}
          <Avatar
            username={user?.username || "user"}
            size="xl"
            className="shadow-lg mb-4"
          />

          <p className="text-gray-500 italic mb-6">{user?.username || "No username set"}</p>

          {/* Action Buttons */}
          <div className="space-y-4 w-full">
            {/* View Profile */}
            <button
              className="w-full flex items-center justify-between px-5 py-3 bg-[var(--color-input-bg)] hover:bg-[var(--color-border)] rounded-xl transition-transform hover:scale-105 active:scale-95 shadow"
              disabled
            >
              <span className="flex items-center gap-2">
                <FiUser />
                View Profile Details
              </span>
              <span className="text-gray-400 text-sm">{" > "}</span>
            </button>

            {/* Edit Username */}
            <button
              onClick={() => setShowEditUsername(true)}
              className="w-full flex items-center justify-between px-5 py-3 bg-[var(--color-input-bg)] hover:bg-[var(--color-border)] rounded-xl transition-transform hover:scale-105 active:scale-95 shadow"
            >
              <span className="flex items-center gap-2">
                <FiEdit2 />
                Edit Username
              </span>
              <span className="text-gray-400 text-sm">{" > "}</span>
            </button>

            {/* Update Password */}
            <button
              onClick={() => setShowEditPassword(true)}
              className="w-full flex items-center justify-between px-5 py-3 bg-[var(--color-input-bg)] hover:bg-[var(--color-border)] rounded-xl transition-transform hover:scale-105 active:scale-95 shadow"
            >
              <span className="flex items-center gap-2">
                <FiLock />
                Update Password
              </span>
              <span className="text-gray-400 text-sm">{" > "}</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-transform hover:scale-105 active:scale-95 shadow mt-4"
            >
              <FiLogOut />
              Logout
            </button>
          </div>

          {/* Edit Username Modal */}
          {showEditUsername && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-xs flex flex-col items-center relative">
                <button
                  className="absolute top-2 right-2 text-xl"
                  onClick={() => {
                    setShowEditUsername(false);
                    setError("");
                  }}
                >
                  <FiX />
                </button>
                <h2 className="text-lg font-bold mb-4">Edit Username</h2>
                <input
                  className="w-full p-2 mb-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-input-text)]"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New username"
                />
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <button
                  onClick={handleUpdateUsername}
                  className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-secondary)] transition"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Username"}
                </button>
              </div>
            </div>
          )}

          {/* Edit Password Modal */}
          {showEditPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-xs flex flex-col items-center relative">
                <button
                  className="absolute top-2 right-2 text-xl"
                  onClick={() => {
                    setShowEditPassword(false);
                    setError("");
                  }}
                >
                  <FiX />
                </button>
                <h2 className="text-lg font-bold mb-4">Update Password</h2>
                <input
                  className="w-full p-2 mb-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-input-text)]"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
                <input
                  className="w-full p-2 mb-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-input-text)]"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <button
                  //  bg-[var(--color-primary)]
                  onClick={handleUpdatePassword}
                  className="w-full
                  bg-red-400
                    text-white py-2 rounded-lg
                     hover:bg-[var(--color-secondary)] 
                     transition"
                  disabled={loading}
                >
                  {/* {loading ? "Updating..." : "Update Password"} */}
                  Not available at the moment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
