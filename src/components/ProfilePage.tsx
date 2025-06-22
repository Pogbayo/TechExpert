import { useAuth } from "../context/AuthContextFolder/useAuth";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">My Profile</h1>
        <div className="text-center mb-4">
          <div className="w-24 h-24 mx-auto bg-blue-300 rounded-full flex items-center justify-center text-white text-4xl">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-semibold mt-2">{user?.username}</h2>
          <p className="text-gray-600">{user?.username}</p>
        </div>
        <button
          onClick={() => logout()}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
