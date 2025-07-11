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
      toast.error("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        resetForm();
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
        toast.error(error);
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Ensure theme is applied on mount (for direct refresh)
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-background)] px-4 text-[var(--color-text)] transition-colors duration-300">
      <div className="bg-[var(--color-background)] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[var(--color-border)]">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              resetForm();
            }}
            className={`w-1/2 py-3 rounded-b-sm font-semibold transition text-[var(--color-text)] ${
              isLogin
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-border)]"
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
            className={`w-1/2 py-3 rounded-b-sm font-semibold transition text-[var(--color-text)] ${
              !isLogin
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-border)]"
            }`}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            <h2 className="text-2xl font-medium mb-4 text-center text-[var(--color-text)]">
              Login
            </h2>
            <div>
              <label className="block mb-1 text-[var(--color-text)]">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block mb-1 text-[var(--color-text)]">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-gray-800 transition flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
            <p className="text-center text-[var(--color-text)] mt-4">
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(false);
                  resetForm();
                }}
                className="text-[var(--color-primary)] font-semibold cursor-pointer hover:underline"
              >
                Register here
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-center text-[var(--color-text)]">
              Register
            </h2>
            <div>
              <label className="block mb-1 text-[var(--color-text)]">
                Username:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />{" "}
            </div>

            <div>
              <label className="block mb-1 text-[var(--color-text)]">
                Email:
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block mb-1 text-[var(--color-text)]">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block mb-1 text-[var(--color-text)]">
                Confirm Password:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-gray-800 transition flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 animate-spin"></div>
              ) : (
                "Register"
              )}
            </button>
            <p className="text-center text-[var(--color-text)] mt-4">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(true);
                  resetForm();
                }}
                className="text-[var(--color-primary)] font-semibold cursor-pointer hover:underline"
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
