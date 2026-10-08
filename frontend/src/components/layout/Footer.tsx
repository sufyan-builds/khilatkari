import { Link } from "react-router-dom";
import { MessageCircle, MapPin } from "lucide-react";
import InstagramIcon from "../ui/InstagramIcon";
import { BRAND, CITIES, NAV_LINKS, WHATSAPP_URL } from "../../data/constants";

export default function Footer() {
  return (
    <footer className="bg-[#1C1814] text-[#F2EDE6] border-t border-[#3A3028]">
      {/* Main footer */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <h2
              className="text-2xl font-semibold tracking-wide text-white mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              KhilatKari
            </h2>
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
              The Art of Timeless Craft
            </p>
            <p className="text-sm text-[#9B8B7E] leading-relaxed max-w-xs">
              {BRAND.description}
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={WHATSAPP_URL("Hello! I'd like to enquire about KhilatKari.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#C9A96E] hover:text-white transition-colors"
              >
                <MessageCircle size={16} />
                {BRAND.whatsappDisplay}
              </a>
            </div>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-3 text-sm text-[#C9A96E] hover:text-white transition-colors"
            >
              <InstagramIcon size={16} />
              {BRAND.instagramHandle}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-[#9B8B7E] mb-5">
              Navigate
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#C8BBA8] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-[#9B8B7E] mb-5">
              We Serve
            </h3>
            <ul className="space-y-3">
              {CITIES.map((city) => (
                <li key={city} className="flex items-center gap-2 text-sm text-[#C8BBA8]">
                  <MapPin size={13} className="text-[#C9A96E]" />
                  {city}
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 border border-[#3A3028] bg-[#251F1A]">
              <p className="text-xs text-[#9B8B7E] leading-relaxed">
                <span className="text-[#C9A96E] font-medium">By appointment only.</span>
                {" "}We operate exclusively through private appointments — not a walk-in store.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3A3028]">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6B5B4E]">
            © {new Date().getFullYear()} KhilatKari. All rights reserved.
          </p>
          <p className="text-xs text-[#6B5B4E]">
            The Art of Timeless Craft · Exclusive Private Appointments
          </p>
        </div>
      </div>
    </footer>
  );
}
