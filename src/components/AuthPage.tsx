import React, { useState } from "react";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [userName, setUserName] = useState("");
  const resetForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success.success) {
        toast.success("Login successful!");
        navigate("/chat");
      } else {
        toast.error(success.error ?? "");
      }
    } catch (err: unknown) {
      console.log(err);
      setError("Login failed.");
      toast.success("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    resetForm();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const success = await register(userName, email, password);
      if (success.success) {
        toast.success("Registration successful!");
        setIsLogin(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
        toast.success("Registration failed");
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              resetForm();
            }}
            className={`w-1/2 py-3 rounded-b-sm font-semibold transition ${
              isLogin ? "bg-black text-white" : "bg-gray-200 text-gray-700"
            }`}
            disabled={loading}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              resetForm();
            }}
            className={`w-1/2 py-3 rounded-b-sm font-semibold transition ${
              !isLogin ? "bg-black text-white" : "bg-gray-200 text-gray-700"
            }`}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            <h2 className="text-2xl font-medium mb-4 text-center text-gray-800">
              Login
            </h2>
            <div>
              <label className="block mb-1 text-gray-600">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
            <p className="text-center text-gray-600 mt-4">
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(false);
                  resetForm();
                }}
                className="text-black font-semibold cursor-pointer hover:underline"
              >
                Register here
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
              Register
            </h2>
            <div>
              <label className="block mb-1 text-gray-600">Username:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />{" "}
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Email:</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">
                Confirm Password:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 animate-spin"></div>
              ) : (
                "Register"
              )}
            </button>
            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(true);
                  resetForm();
                }}
                className="text-black font-semibold cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
