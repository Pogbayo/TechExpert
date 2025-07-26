import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";

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

  // Validation states
  const [userNameValid, setUserNameValid] = useState(false);
  const [userNameTouched, setUserNameTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false
  });

  // Validation patterns
  const userNameRegex = /^[a-zA-Z0-9_-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = {
    length: (pass: string) => pass.length >= 9,
    uppercase: (pass: string) => /[A-Z]/.test(pass),
    number: (pass: string) => /\d/.test(pass),
    symbol: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass)
  };

  // Username validation
  useEffect(() => {
    if (userNameTouched) {
      setUserNameValid(userNameRegex.test(userName) && userName.length >= 3);
    }
  }, [userName, userNameTouched]);

  // Email validation
  useEffect(() => {
    if (emailTouched) {
      setEmailValid(emailRegex.test(email));
    }
  }, [email, emailTouched]);

  // Password validation
  useEffect(() => {
    if (passwordTouched) {
      const newStrength = {
        length: passwordRegex.length(password),
        uppercase: passwordRegex.uppercase(password),
        number: passwordRegex.number(password),
        symbol: passwordRegex.symbol(password)
      };
      setPasswordStrength(newStrength);
      setPasswordValid(Object.values(newStrength).every(Boolean));
    }
  }, [password, passwordTouched]);

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
    setUserNameValid(false);
    setUserNameTouched(false);
    setEmailValid(false);
    setEmailTouched(false);
    setPasswordValid(false);
    setPasswordTouched(false);
    setPasswordStrength({
      length: false,
      uppercase: false,
      number: false,
      symbol: false
    });
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
    
    // Validation checks
    if (!userNameValid) {
      toast.error("Please enter a valid username (letters, numbers, _ or - only, minimum 3 characters).");
      return;
    }
    
    if (!emailValid) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    if (!passwordValid) {
      toast.error("Please ensure your password meets all requirements.");
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
    if (name === "userName") {
      setUserName(value);
      if (!userNameTouched) setUserNameTouched(true);
    }
    else if (name === "email") {
      setEmail(value);
      if (!emailTouched) setEmailTouched(true);
    }
    else if (name === "password") {
      setPassword(value);
      if (!passwordTouched) setPasswordTouched(true);
    }
    else if (name === "confirmPassword") setConfirmPassword(value);
  };

  const getPasswordStrengthColor = () => {
    const validCount = Object.values(passwordStrength).filter(Boolean).length;
    if (validCount === 0) return "bg-gray-200";
    if (validCount <= 2) return "bg-red-500";
    if (validCount === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const validCount = Object.values(passwordStrength).filter(Boolean).length;
    if (validCount === 0) return "Enter password";
    if (validCount <= 2) return "Weak";
    if (validCount === 3) return "Medium";
    return "Strong";
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
                style={{ fontSize: '16px' }} // Prevent iOS zoom
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
                style={{ fontSize: '16px' }} // Prevent iOS zoom
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
              <label className="block mb-1 text-black">Username: <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  name="userName"
                  value={userName}
                  onChange={handleInput}
                  required
                  className={`w-full p-3 pr-10 border rounded bg-gray-50 focus:outline-none focus:ring-2 text-black font-medium placeholder-gray-400 ${
                    userNameTouched 
                      ? userNameValid 
                        ? 'border-green-500 focus:ring-green-300' 
                        : 'border-red-500 focus:ring-red-300'
                      : 'border-gray-200 focus:ring-gray-300'
                  }`}
                  placeholder="choose a username"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                {userNameTouched && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {userNameValid ? (
                      <FiCheck className="text-green-500 text-lg" />
                    ) : (
                      <FiX className="text-red-500 text-lg" />
                    )}
                  </div>
                )}
              </div>
              {userNameTouched && !userNameValid && (
                <p className="text-red-500 text-xs mt-1">
                  Username must be one word with letters, numbers, _ or - only (minimum 3 characters)
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-black">Email: <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInput}
                  required
                  className={`w-full p-3 pr-10 border rounded bg-gray-50 focus:outline-none focus:ring-2 text-black font-medium placeholder-gray-400 ${
                    emailTouched 
                      ? emailValid 
                        ? 'border-green-500 focus:ring-green-300' 
                        : 'border-red-500 focus:ring-red-300'
                      : 'border-gray-200 focus:ring-gray-300'
                  }`}
                  placeholder="enter your email"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                {emailTouched && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValid ? (
                      <FiCheck className="text-green-500 text-lg" />
                    ) : (
                      <FiX className="text-red-500 text-lg" />
                    )}
                  </div>
                )}
              </div>
              {emailTouched && !emailValid && (
                <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-black">Password: <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleInput}
                  required
                  className={`w-full p-3 pr-20 border rounded bg-gray-50 focus:outline-none focus:ring-2 text-black font-medium placeholder-gray-400 ${
                    passwordTouched 
                      ? passwordValid 
                        ? 'border-green-500 focus:ring-green-300' 
                        : 'border-red-500 focus:ring-red-300'
                      : 'border-gray-200 focus:ring-gray-300'
                  }`}
                  placeholder="create a password"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {passwordTouched && (
                    <div>
                      {passwordValid ? (
                        <FiCheck className="text-green-500 text-lg" />
                      ) : (
                        <FiX className="text-red-500 text-lg" />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordTouched && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPasswordStrengthColor()} text-white`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ 
                        width: `${(Object.values(passwordStrength).filter(Boolean).length / 4) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Password Requirements */}
              {passwordTouched && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600 font-medium">Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordStrength.length ? <FiCheck size={12} /> : <FiX size={12} />}
                      At least 9 characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordStrength.uppercase ? <FiCheck size={12} /> : <FiX size={12} />}
                      At least one uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordStrength.number ? <FiCheck size={12} /> : <FiX size={12} />}
                      At least one number
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.symbol ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordStrength.symbol ? <FiCheck size={12} /> : <FiX size={12} />}
                      At least one symbol (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 text-black">Confirm Password: <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInput}
                  required
                  className={`w-full p-3 pr-10 border rounded bg-gray-50 focus:outline-none focus:ring-2 text-black font-medium placeholder-gray-400 ${
                    confirmPassword 
                      ? password === confirmPassword 
                        ? 'border-green-500 focus:ring-green-300' 
                        : 'border-red-500 focus:ring-red-300'
                      : 'border-gray-200 focus:ring-gray-300'
                  }`}
                  placeholder="confirm your password"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {confirmPassword && (
                    <div>
                      {password === confirmPassword ? (
                        <FiCheck className="text-green-500 text-lg" />
                      ) : (
                        <FiX className="text-red-500 text-lg" />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
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
