import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, User, ArrowRight, AlertCircle, WifiOff, ShieldX, ServerCrash } from "lucide-react";
import { authService } from "../../services/auth";
import api from "../../services/api";
import axios from "axios";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("sufian");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"connection" | "auth" | "server" | "unknown" | "">("");

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/admin", { replace: true });
      return;
    }
    // Proactively ping health endpoint to wake Render if idle
    api.get("/health").catch(() => {});
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
    const warmupTimer = setTimeout(() => {
      setWarmingUp(true);
    }, 2500);

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
          // Network failure — backend unreachable or cold start timeout
          setErrorType("connection");
          setError(
            "Cannot reach the backend server. Render may be waking up from sleep (~30s). Please wait a moment and try again."
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
      clearTimeout(warmupTimer);
      setWarmingUp(false);
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
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <picture className="w-full h-full flex items-center justify-center">
              <source srcSet="/images/logo.webp" type="image/webp" />
              <img
                src="/images/logo.jpg"
                alt="KhilatKari"
                className="w-full h-full object-contain object-center"
                width="1024"
                height="1024"
              />
            </picture>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1
              className="text-2xl font-semibold text-[#1C1814] tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              KhilatKari
            </h1>
            <span className="font-urdu text-base text-[#C9A96E]" title="خلعت کاری">
              خلعت کاری
            </span>
          </div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-[#C9A96E] mt-1 font-medium">
            Heritage in Every Stitch
          </p>
          <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#9B8B7E] mt-0.5 font-medium">
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
              className="form-label"
            >
              Username
            </label>
            <div className="form-group">
              <span className="form-input-icon">
                <User size={18} />
              </span>
              <input
                id="admin-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="form-input form-input-with-icon"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="form-label"
            >
              Password
            </label>
            <div className="form-group">
              <span className="form-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input form-input-with-icon"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-center flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <span>{warmingUp ? "Waking up server (Render)..." : "Authenticating..."}</span>
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
