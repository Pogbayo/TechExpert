import React, { useState, useEffect } from "react";
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
  const { login, register, user, isAuthChecked } = useAuth();
  const [userName, setUserName] = useState("");

  // Redirect to chat if user is already authenticated
  useEffect(() => {
    if (isAuthChecked && user) {
      navigate("/chat");
    }
  }, [user, isAuthChecked, navigate]);
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
    } catch {
      setError("Login failed.");
      toast.error("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (/\s/.test(userName)) {
      toast.error("Username must not contain spaces. Use _ or - instead.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await register(userName, email, password);
      if (result.success) {
        toast.success("Registration successful!");
        setIsLogin(true);
        resetForm();
      } else {
        setError(result.error || "Registration failed.");
        toast.error(result.error || "Registration failed.");
      }
    } catch {
      setError("Registration failed.");
      toast.error("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
    else if (name === "userName") setUserName(value);
  };

  // useEffect(() => {
  //   const applyTheme = () => {
  //     const storedTheme = localStorage.getItem("theme");
  //     if (storedTheme === "dark") {
  //       document.documentElement.classList.add("dark");
  //     } else {
  //       document.documentElement.classList.remove("dark");
  //     }
  //   };
  //   applyTheme();
  //   window.addEventListener("storage", applyTheme);
  //   return () => window.removeEventListener("storage", applyTheme);
  // }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 px-2 text-[var(--color-text)] transition-colors duration-300 overflow-hidden font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-[var(--color-border)] flex flex-col items-center animate-fade-in h-auto px-4 font-sans">
        {/* Logo/Icon */}
        <img src="https://api.iconify.design/mdi:chat-outline.svg?color=white" alt="Spag Chat Logo" className="w-14 h-14 mb-2 drop-shadow-lg bg-black rounded-full p-2" />
        <h1 className="text-2xl font-extrabold mb-1 text-black tracking-tight">Spag Chat</h1>
        <p className="mb-4 text-gray-600 text-center text-sm">Connect, chat, and share instantly.</p>
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4 w-full animate-fade-in">
            <div>
              <label className="block mb-1 text-black">Email:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleInput}
                required
                className="w-full p-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 text-black font-medium placeholder-gray-400"
                placeholder="enter your email"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleInput}
                required
                className="w-full p-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 text-black font-medium placeholder-gray-400"
                placeholder="enter your password"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 font-bold shadow-md hover:bg-gray-800 transition flex justify-center items-center border-none rounded-none"
              disabled={loading}
            >
              {loading ? (
                <span className="loader-dots">
                  <span></span><span></span><span></span>
                </span>
              ) : (
                "Login"
              )}
            </button>
            <p className="text-center mt-2 text-black text-sm">
              Don't have an account?{' '}
              <span
                onClick={() => {
                  setIsLogin(false);
                  resetForm();
                }}
                className="font-semibold cursor-pointer underline hover:opacity-80"
                style={{ color: '#6C63FF' }}
              >
                Register here
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 w-full animate-fade-in">
            <div>
              <label className="block mb-1 text-black">Username:</label>
              <input
                type="text"
                name="userName"
                value={userName}
                onChange={handleInput}
                className="w-full p-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 text-black font-medium placeholder-gray-400"
                placeholder="choose a username"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Email:</label>
              <input
                type="text"
                name="email"
                value={email}
                onChange={handleInput}
                required
                className="w-full p-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 text-black font-medium placeholder-gray-400"
                placeholder="enter your email"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleInput}
                required
                className="w-full p-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 text-black font-medium placeholder-gray-400"
                placeholder="create a password"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInput}
                required
                className="w-full p-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 text-black font-medium placeholder-gray-400"
                placeholder="confirm your password"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 font-bold shadow-md hover:bg-gray-800 transition flex justify-center items-center border-none rounded-none"
              disabled={loading}
            >
              {loading ? (
                <span className="loader-dots">
                  <span></span><span></span><span></span>
                </span>
              ) : (
                "Register"
              )}
            </button>
            <p className="text-center mt-2 text-black text-sm">
              Already have an account?{' '}
              <span
                onClick={() => {
                  setIsLogin(true);
                  resetForm();
                }}
                className="font-semibold cursor-pointer underline hover:opacity-80"
                style={{ color: '#6C63FF' }}
              >
                Login here
              </span>
            </p>
          </form>
        )}
      </div>
      <style>{`
        .loader-dots {
          display: inline-block;
          width: 24px;
          height: 16px;
          text-align: center;
        }
        .loader-dots span {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 1px;
          background: #fff;
          border-radius: 50%;
          animation: loader-dots-bounce 1.2s infinite ease-in-out both;
        }
        .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loader-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes loader-dots-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
