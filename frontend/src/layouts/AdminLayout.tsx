import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  CalendarDays,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Sliders,
  Layers,
} from "lucide-react";
import { authService } from "../services/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const username = authService.getUsername();
  const isAuthenticated = authService.isAuthenticated();

  // Must call all hooks before any early return (Rules of Hooks)
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Synchronous route guard to prevent unauthenticated layout/content flash
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin/visuals", label: "Website CMS & Visuals", icon: <Sliders size={18} /> },
    { to: "/admin/categories", label: "Categories & Collections", icon: <Layers size={18} /> },
    { to: "/admin/products", label: "Products Catalog", icon: <Shirt size={18} /> },
    { to: "/admin/appointments", label: "Appointments", icon: <CalendarDays size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#1C1814] text-[#FAF8F5] flex-col justify-between p-6 border-r border-[#3A3028]">
        <div>
          {/* Brand */}
          <div className="mb-10 pb-6 border-b border-[#3A3028]">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center">
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
              <div>
                <span
                  className="text-xl font-semibold tracking-wide text-white block leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  KhilatKari
                </span>
                <span className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium flex items-center gap-1 mt-0.5">
                  <Shield size={11} /> Administration Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase font-medium rounded-xs transition-colors ${
                    isActive
                      ? "bg-[#C9A96E] text-[#1C1814] font-semibold"
                      : "text-[#C8BBA8] hover:bg-[#2A241E] hover:text-white"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-6 border-t border-[#3A3028] space-y-3">
          <div className="text-xs text-[#9B8B7E] px-4">
            Signed in as <strong className="text-white">{username}</strong>
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs text-[#C9A96E] hover:text-white transition-colors"
          >
            <ExternalLink size={14} /> View Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1814]/80 flex">
          <div className="w-64 bg-[#1C1814] text-[#FAF8F5] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#3A3028]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img
                      src="/images/logo.jpg"
                      alt="KhilatKari"
                      className="w-full h-full object-contain object-center"
                      width="1024"
                      height="1024"
                    />
                  </div>
                  <span className="font-display font-semibold text-lg text-white">KhilatKari Admin</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase font-medium rounded-xs ${
                        isActive ? "bg-[#C9A96E] text-[#1C1814]" : "text-[#C8BBA8]"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="pt-6 border-t border-[#3A3028] space-y-3">
              <Link to="/" className="flex items-center gap-2 text-xs text-[#C9A96E]">
                <ExternalLink size={14} /> View Storefront
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-red-400">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-[#E0D8CE] flex items-center justify-between px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-[#1C1814] p-1.5"
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:flex items-center gap-2.5 text-xs uppercase tracking-widest text-[#9B8B7E] font-medium">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <img
                src="/images/logo.jpg"
                alt="KhilatKari"
                className="w-full h-full object-contain object-center"
                width="1024"
                height="1024"
              />
            </div>
            <span>KhilatKari Administration</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-[#FAF8F5] border border-[#E0D8CE] px-3 py-1 text-[#6B5B4E] font-medium">
              Administrator: <strong className="text-[#1C1814]">{username}</strong>
            </span>
          </div>
        </header>

        {/* Main nested content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
