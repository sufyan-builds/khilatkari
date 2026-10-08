import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, User, ArrowRight, AlertCircle, WifiOff, ShieldX, ServerCrash } from "lucide-react";
import { authService } from "../../services/auth";
import axios from "axios";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("sufian");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"connection" | "auth" | "server" | "unknown" | "">("");

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      setErrorType("unknown");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ username, password });
      if (res.success) {
        const from = (location.state as any)?.from?.pathname || "/admin";
        navigate(from, { replace: true });
      } else {
        // Non-2xx but Axios didn't throw (shouldn't normally happen, but guard anyway)
        setErrorType("auth");
        setError(res.message || "Invalid credentials. Please verify username and password.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMsg = err.response?.data?.message;

        if (!err.response) {
          // Network failure — backend unreachable
          setErrorType("connection");
          setError(
            "Cannot reach the backend server. Please make sure the API is running on the expected address."
          );
        } else if (status === 401 || status === 403) {
          // Authentication / authorization failure
          setErrorType("auth");
          setError(serverMsg || "Invalid username or password. Please check your credentials.");
        } else if (status === 404) {
          // Wrong endpoint — misconfiguration
          setErrorType("server");
          setError("Login endpoint not found (404). This may be a configuration issue.");
        } else if (status === 429) {
          // Rate limited
          setErrorType("unknown");
          setError("Too many login attempts. Please wait a moment and try again.");
        } else if (status && status >= 500) {
          // Backend server error
          setErrorType("server");
          setError(
            serverMsg || "A server error occurred. Please try again later or contact support."
          );
        } else {
          setErrorType("unknown");
          setError(serverMsg || "An unexpected error occurred. Please try again.");
        }
      } else {
        setErrorType("connection");
        setError("An unexpected network error occurred. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1814] flex flex-col justify-center items-center px-4 py-12">
      {/* Container */}
      <div className="w-full max-w-md bg-[#FAF8F5] border border-[#C9A96E]/40 p-8 md:p-10 shadow-2xl relative">
        {/* Top Gold Accent */}
        <div className="absolute -top-[1px] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <img
            src="/images/logo.jpg"
            alt="KhilatKari"
            className="w-16 h-16 rounded-full object-contain mx-auto mb-4 border border-[#C9A96E]/50 shadow-md p-0.5 bg-white"
          />
          <h1
            className="text-2xl font-semibold text-[#1C1814] tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            KhilatKari
          </h1>
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[#9B8B7E] mt-1 font-medium">
            Management Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`mb-6 p-4 text-xs flex items-start gap-2 border-l-2 ${
              errorType === "connection"
                ? "bg-orange-50 border-orange-500 text-orange-700"
                : errorType === "server"
                ? "bg-purple-50 border-purple-500 text-purple-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            {errorType === "connection" ? (
              <WifiOff size={16} className="flex-shrink-0 mt-0.5" />
            ) : errorType === "server" ? (
              <ServerCrash size={16} className="flex-shrink-0 mt-0.5" />
            ) : errorType === "auth" ? (
              <ShieldX size={16} className="flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            )}
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2"
            >
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
              <input
                id="admin-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="form-input pl-10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-center flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E0D8CE] text-center">
          <Link
            to="/"
            className="text-xs text-[#9B8B7E] hover:text-[#1C1814] transition-colors tracking-wide"
          >
            ← Return to KhilatKari Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
