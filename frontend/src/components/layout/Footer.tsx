import { Link } from "react-router-dom";
import { MessageCircle, MapPin, Calendar } from "lucide-react";
import InstagramIcon from "../ui/InstagramIcon";
import { BRAND, CITIES, NAV_LINKS, WHATSAPP_URL } from "../../data/constants";

export default function Footer() {
  return (
    <footer className="bg-[#1C1814] text-[#F2EDE6] border-t border-[#2E2721]">
      {/* Main footer content */}
      <div className="container-main py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-[#C9A96E]/50 shadow-xs flex items-center justify-center bg-[#FAF8F5]">
                <picture className="w-full h-full flex items-center justify-center">
                  <source srcSet="/images/logo-circle.webp" type="image/webp" />
                  <img
                    src="/images/logo-circle.png"
                    alt="KhilatKari"
                    className="w-full h-full object-cover object-center"
                    width="1024"
                    height="1024"
                  />
                </picture>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span
                    className="text-xl sm:text-2xl font-semibold tracking-wide text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    KhilatKari
                  </span>
                  <span className="font-urdu text-sm text-[#C9A96E] leading-normal inline-block" title="خلعت کاری">
                    خلعت کاری
                  </span>
                </div>
                <span className="text-[0.62rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium">
                  Heritage in Every Stitch
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#9B8B7E] leading-relaxed max-w-sm">
              {BRAND.description}
            </p>

            {/* Direct Concierge Contact Links */}
            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <a
                href={WHATSAPP_URL("Hello! I'd like to enquire about KhilatKari.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#C9A96E] hover:text-white transition-colors"
              >
                <MessageCircle size={15} className="text-[#25D366]" />
                <span>WhatsApp: {BRAND.whatsappDisplay}</span>
              </a>

              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#C9A96E] hover:text-white transition-colors"
              >
                <InstagramIcon size={14} />
                <span>{BRAND.instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#C9A96E] mb-3 md:mb-4">
              Explore Lookbook
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[#C8BBA8] hover:text-[#C9A96E] transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Consultations & Cities Column */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#C9A96E] mb-3 md:mb-4">
                Private In-Home Viewings
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-[#C8BBA8]">
                {CITIES.map((city) => (
                  <li key={city} className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#C9A96E] shrink-0" />
                    <span>{city}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-[#251F1A] border border-[#3A3028] rounded-xs space-y-2">
              <p className="text-xs text-[#9B8B7E] leading-relaxed">
                <strong className="text-[#C9A96E] font-medium">Exclusively by Appointment.</strong>{" "}
                We bring our collection to your residence for private family viewings.
              </p>
              <Link
                to="/appointments"
                className="inline-flex items-center gap-1.5 text-xs text-[#E8D5A8] hover:text-white transition-colors font-medium"
              >
                <Calendar size={13} />
                <span>Schedule a Private Viewing →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar with distinct separator */}
      <div className="border-t border-[#2E2721] bg-[#161310]">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-[0.7rem] text-[#7A6B5E]">
            © {new Date().getFullYear()} KhilatKari. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#7A6B5E]">
            <span>Heritage in Every Stitch</span>
            <span>&bull;</span>
            <span className="font-urdu text-[0.75rem] text-[#C9A96E]">خلعت کاری</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
