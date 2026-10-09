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
          <div className="flex items-center justify-between h-16 md:h-20 gap-2">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center">
                <picture className="w-full h-full flex items-center justify-center">
                  <source srcSet="/images/logo.webp" type="image/webp" />
                  <img
                    src="/images/logo.jpg"
                    alt="KhilatKari"
                    className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                    width="1024"
                    height="1024"
                  />
                </picture>
              </div>
              <div className="flex flex-col items-start min-w-0">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span
                    className="font-display text-base sm:text-xl md:text-2xl font-semibold tracking-wide text-[#1C1814] leading-tight truncate"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    KhilatKari
                  </span>
                  <span
                    className="font-urdu text-[0.7rem] sm:text-xs text-[#C9A96E] leading-none select-none hidden min-[400px]:inline"
                    title="خلعت کاری"
                  >
                    خلعت کاری
                  </span>
                </div>
                <span className="text-[0.52rem] sm:text-[0.58rem] tracking-[0.18em] uppercase text-[#C9A96E] hidden sm:block font-medium truncate">
                  Heritage in Every Stitch
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 shrink-0">
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
            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
              {/* Instagram on Desktop */}
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center w-9 h-9 text-[#6B5B4E] hover:text-[#1C1814] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>

              {/* Single Appointment CTA (Responsive for Mobile & Desktop) */}
              <Link
                to="/appointments"
                className="inline-flex items-center justify-center h-8 md:h-9 px-2.5 sm:px-3.5 md:px-5 text-[0.68rem] md:text-xs tracking-[0.08em] md:tracking-[0.1em] font-medium uppercase bg-[#1C1814] text-[#FAF8F5] border border-[#1C1814] hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all rounded-xs shrink-0 whitespace-nowrap shadow-xs"
                aria-label="Book Appointment"
              >
                <span className="hidden sm:inline">Book Appointment</span>
                <span className="inline sm:hidden">Book</span>
              </Link>

              {/* Quick WhatsApp icon for concierge */}
              <a
                href={WHATSAPP_URL("Hello! I'd like to enquire about KhilatKari.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-[#25D366] hover:text-[#1C1814] transition-colors shrink-0"
                aria-label="WhatsApp Concierge"
              >
                <MessageCircle size={19} />
              </a>

              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 text-[#1C1814] flex items-center justify-center cursor-pointer shrink-0"
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

          <div className="pt-6 border-t border-[#E0D8CE] text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium">
                KhilatKari
              </span>
              <span className="font-urdu text-xs text-[#C9A96E]">خلعت کاری</span>
            </div>
            <p className="text-[0.65rem] tracking-[0.15em] uppercase text-[#9B8B7E]">
              Heritage in Every Stitch
            </p>
            <p className="text-[0.72rem] text-[#9B8B7E]">
              Private Consultations across Lahore, Islamabad, Rawalpindi &amp; Peshawar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
