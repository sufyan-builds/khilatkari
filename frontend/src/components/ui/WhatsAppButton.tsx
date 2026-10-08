import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL, BRAND } from "../../data/constants";

interface WhatsAppButtonProps {
  message?: string;
}

export default function WhatsAppButton({ message }: WhatsAppButtonProps) {
  const url = message ? WHATSAPP_URL(message) : WHATSAPP_URL("Hello! I'd like to book an appointment with KhilatKari.");

  return (
    <aside aria-label="WhatsApp Consultation" className="fixed bottom-6 right-6 z-40 flex items-center group">
      <span className="mr-3 px-3 py-1.5 bg-[#1C1814] text-[#FAF8F5] text-xs font-medium tracking-wider shadow-lg rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:inline-block">
        Chat with Stylist
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with KhilatKari on WhatsApp (${BRAND.whatsappDisplay})`}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <MessageCircle size={28} className="fill-white/20" />
      </a>
    </aside>
  );
}
