import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import InstagramIcon from "../ui/InstagramIcon";
import { BRAND, NAV_LINKS, WHATSAPP_URL } from "../../data/constants";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-sm shadow-sm border-b border-[#E0D8CE]"
            : "bg-[#FAF8F5]/80 backdrop-blur-sm"
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <img
                src="/images/logo.jpg"
                alt="MS Fashions Closet"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain shrink-0 shadow-xs border border-[#C9A96E]/40 group-hover:border-[#C9A96E] transition-colors"
              />
              <div className="flex flex-col items-start">
                <span
                  className="font-display text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-[#1C1814] leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  MS Fashions
                </span>
                <span className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A96E] hidden sm:block font-medium">
                  Luxury Traditional Wear
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-200 ${
                      isActive
                        ? "text-[#C9A96E]"
                        : "text-[#6B5B4E] hover:text-[#1C1814]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center w-9 h-9 text-[#6B5B4E] hover:text-[#1C1814] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={WHATSAPP_URL("Hello! I'd like to enquire about MS Fashions.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex btn-primary btn-sm"
                aria-label="WhatsApp"
              >
                Book Appointment
              </a>
              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-[#1C1814]"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#FAF8F5] flex flex-col pt-20"
          id="mobile-menu"
        >
          <div className="container-main flex flex-col gap-1 py-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `py-4 text-lg border-b border-[#E0D8CE] font-display font-medium transition-colors ${
                    isActive ? "text-[#C9A96E]" : "text-[#1C1814]"
                  }`
                }
                style={{ fontFamily: "var(--font-display)" }}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex gap-4 mt-8">
              <a
                href={WHATSAPP_URL()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-center"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex-1 text-center"
              >
                <InstagramIcon size={16} />
                Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
