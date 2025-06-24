import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogOut, FiUser, FiEdit2, FiLock } from "react-icons/fi";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/chat")}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-4 w-fit transition-transform hover:scale-105 active:scale-95"
      >
        <FiArrowLeft />
        <span>Back to Chats</span>
      </button>

      {/* Profile Card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center animate-fade-in">
          {/* Avatar */}
          <div className="w-32 h-32 bg-gradient-to-tr from-purple-500 to-indigo-400 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg mb-4">
            {user?.username.charAt(0).toUpperCase()}
          </div>

          <p className="text-gray-500 italic mb-6">@{user?.username}</p>

          {/* Action Buttons */}
          <div className="space-y-4 w-full">
            {/* View Profile */}
            <button
              onClick={() => console.log("Viewing profile...")}
              className="w-full flex items-center justify-between px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow"
            >
              <span className="flex items-center gap-2">
                <FiUser />
                View Profile Details
              </span>
              <span className="text-gray-400 text-sm">{">"}</span>
            </button>

            {/* Edit Username */}
            <button
              onClick={() => console.log("Edit username...")}
              className="w-full flex items-center justify-between px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow"
            >
              <span className="flex items-center gap-2">
                <FiEdit2 />
                Edit Username
              </span>
              <span className="text-gray-400 text-sm">{">"}</span>
            </button>

            {/* Update Password */}
            <button
              onClick={() => console.log("Update password...")}
              className="w-full flex items-center justify-between px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow"
            >
              <span className="flex items-center gap-2">
                <FiLock />
                Update Password
              </span>
              <span className="text-gray-400 text-sm">{">"}</span>
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
        </div>
      </div>
    </div>
  );
}
