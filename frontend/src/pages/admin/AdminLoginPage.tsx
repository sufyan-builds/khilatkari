import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { authService } from "../../services/auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("sufian");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ username, password });
      if (res.success) {
        const from = (location.state as any)?.from?.pathname || "/admin";
        navigate(from, { replace: true });
      } else {
        setError(res.message || "Invalid credentials. Please verify username and password.");
      }
    } catch {
      setError("Connection to backend server failed. Please ensure the API is running.");
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
            alt="MS Fashions Closet"
            className="w-16 h-16 rounded-full object-contain mx-auto mb-4 border border-[#C9A96E]/50 shadow-md p-0.5 bg-white"
          />
          <h1
            className="text-2xl font-semibold text-[#1C1814] tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MS Fashions
          </h1>
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[#9B8B7E] mt-1 font-medium">
            Management Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
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
            ← Return to MS Fashions Boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
