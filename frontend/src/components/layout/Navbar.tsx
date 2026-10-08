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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-xs border-b border-[#E0D8CE]"
            : "bg-[#FAF8F5]/90 backdrop-blur-sm"
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <img
                src="/images/logo.jpg"
                alt="KhilatKari"
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-contain shrink-0 shadow-xs border border-[#C9A96E]/40 group-hover:border-[#C9A96E] transition-colors"
              />
              <div className="flex flex-col items-start">
                <span
                  className="font-display text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-[#1C1814] leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  KhilatKari
                </span>
                <span className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A96E] hidden sm:block font-medium">
                  The Art of Timeless Craft
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
            <div className="flex items-center gap-2 sm:gap-3">
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
                href={WHATSAPP_URL("Hello! I'd like to enquire about KhilatKari.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex btn-primary btn-sm"
                aria-label="WhatsApp"
              >
                Book Appointment
              </a>
              {/* Quick WhatsApp icon for mobile */}
              <a
                href={WHATSAPP_URL("Hello! I'd like to enquire about KhilatKari.")}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden flex items-center justify-center w-9 h-9 text-[#25D366] hover:text-[#1C1814] transition-colors"
                aria-label="WhatsApp Concierge"
              >
                <MessageCircle size={20} />
              </a>
              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-[#1C1814] min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-[#FAF8F5] overflow-y-auto flex flex-col justify-between p-6 sm:p-8 animate-fade-up"
          id="mobile-menu"
        >
          <div className="flex flex-col gap-1">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#9B8B7E] font-medium mb-2">
              Menu
            </p>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `py-3.5 text-xl border-b border-[#E0D8CE]/70 font-display font-medium transition-colors flex items-center justify-between ${
                    isActive ? "text-[#C9A96E]" : "text-[#1C1814]"
                  }`
                }
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span>{link.label}</span>
                <span className="text-sm font-sans text-[#C9A96E]">→</span>
              </NavLink>
            ))}

            <div className="pt-6 pb-2 space-y-3">
              <Link
                to="/appointments"
                onClick={() => setMenuOpen(false)}
                className="btn-gold w-full text-center block"
              >
                Book a Private Appointment
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={WHATSAPP_URL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full text-center flex items-center justify-center gap-2"
                >
                  <InstagramIcon size={15} />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E0D8CE] text-center">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium mb-1">
              KhilatKari
            </p>
            <p className="text-xs text-[#9B8B7E]">
              Private Consultations across Lahore, Islamabad, Rawalpindi &amp; Peshawar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
