import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  MapPin,
  Send,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import InstagramIcon from "../components/ui/InstagramIcon";
import { BRAND, CITIES, WHATSAPP_URL } from "../data/constants";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: CITIES[0] || "Lahore",
    subject: "General Inquiry",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-fill WhatsApp message and redirect
    const msg = `Hello KhilatKari! Name: ${form.name}, City: ${form.city}, Subject: ${form.subject}. Message: ${form.message}`;
    window.open(WHATSAPP_URL(msg), "_blank");
    setSent(true);
  };

  const faqs = [
    {
      q: "Why does KhilatKari operate by appointment only?",
      a: "Our pieces are bespoke, high-value luxury traditional and bridal garments. We believe private in-home viewings allow clients and their families to experience fabrics, hand-embroidery, and fittings peacefully without the distraction of crowded shopping malls.",
    },
    {
      q: "Which cities do you currently serve?",
      a: "Our private appointment representatives regularly travel to residences across Lahore, Islamabad, Rawalpindi, and Peshawar. For other cities, please contact us on WhatsApp to discuss special arrangements.",
    },
    {
      q: "How many outfits can I request to view at home?",
      a: "Typically, our stylist brings 5 to 10 curated pieces based on your preferred collection, style preferences, and event date.",
    },
    {
      q: "Do you offer custom tailoring and measurements?",
      a: "Yes. During your appointment, our consultant takes exact measurements. We offer bespoke sleeve adjustments, neckline modifications, custom dupattas, and tailored bottoms.",
    },
    {
      q: "How quickly will I receive an appointment confirmation?",
      a: "Our concierge team usually confirms dates within a few hours via WhatsApp.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-[#F2EDE6] border-b border-[#E0D8CE] py-14 md:py-20">
        <div className="container-main text-center max-w-3xl">
          <p className="section-label mb-3">Concierge</p>
          <h1
            className="text-display-lg text-[#1C1814] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Connect with KhilatKari
          </h1>
          <div className="divider-gold" />
          <p className="text-[#6B5B4E] mt-4 text-sm md:text-base leading-relaxed">
            Have questions about a collection or wish to book a private home viewing? Our team is at your service.
          </p>
        </div>
      </div>

      {/* Appointment Model Notice */}
      <div className="container-main max-w-5xl -mt-6">
        <div className="bg-[#1C1814] text-[#FAF8F5] p-5 md:p-6 shadow-md border-l-4 border-[#C9A96E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-[#C9A96E] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Private In-Home Appointment Boutique
              </h2>
              <p className="text-xs text-[#C8BBA8] mt-0.5">
                We operate strictly on a private appointment basis — we do not operate a walk-in retail store.
              </p>
            </div>
          </div>
          <Link
            to="/appointments"
            className="btn-gold btn-sm whitespace-nowrap"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="container-main max-w-5xl py-16">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* WhatsApp Card */}
          <div className="bg-white border border-[#E0D8CE] p-8 text-center shadow-xs hover:border-[#C9A96E] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-semibold text-lg text-[#1C1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              WhatsApp Concierge
            </h3>
            <p className="text-xs text-[#9B8B7E] mb-4">Fastest response for appointments & inquiries</p>
            <p className="text-sm font-semibold text-[#1C1814] mb-4">{BRAND.whatsappDisplay}</p>
            <a
              href={WHATSAPP_URL("Hello KhilatKari! I'd like to get in touch with you.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm w-full block"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Instagram Card */}
          <div className="bg-white border border-[#E0D8CE] p-8 text-center shadow-xs hover:border-[#C9A96E] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#E1306C]/15 text-[#E1306C] flex items-center justify-center mx-auto mb-4">
              <InstagramIcon size={24} />
            </div>
            <h3 className="font-semibold text-lg text-[#1C1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Instagram
            </h3>
            <p className="text-xs text-[#9B8B7E] mb-4">Follow latest releases, photoshoots & reels</p>
            <p className="text-sm font-semibold text-[#1C1814] mb-4">{BRAND.instagramHandle}</p>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm w-full block"
            >
              Follow @khilatkari
            </a>
          </div>

          {/* Service Areas Card */}
          <div className="bg-white border border-[#E0D8CE] p-8 text-center shadow-xs hover:border-[#C9A96E] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-semibold text-lg text-[#1C1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Service Coverage
            </h3>
            <p className="text-xs text-[#9B8B7E] mb-4">Private home appointments offered in:</p>
            <p className="text-xs font-semibold text-[#1C1814] mb-4 leading-relaxed">
              {CITIES.join(" · ")}
            </p>
            <Link to="/appointments" className="btn-outline btn-sm w-full block">
              Book Home Visit
            </Link>
          </div>
        </div>

        {/* Form and FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Quick Message Form */}
          <div className="lg:col-span-6 bg-white border border-[#E0D8CE] p-8 shadow-sm">
            <h2
              className="text-xl font-semibold text-[#1C1814] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Send an Instant Inquiry
            </h2>
            <p className="text-xs text-[#9B8B7E] mb-6">
              Fill out this quick form and it will connect you directly to our WhatsApp concierge with your message ready.
            </p>

            {sent ? (
              <div className="p-6 bg-[#FAF8F5] border border-[#E0D8CE] text-center">
                <CheckCircle size={32} className="text-[#C9A96E] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1C1814] text-base mb-1">WhatsApp Launched</h3>
                <p className="text-xs text-[#6B5B4E] mb-4">
                  Your inquiry message has been prepared in WhatsApp. We look forward to speaking with you!
                </p>
                <button onClick={() => setSent(false)} className="btn-outline btn-sm">
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Ayesha Malik"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="e.g. 0314-8881856"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="form-label">
                      Your City
                    </label>
                    <select
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="form-input form-select"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="form-input form-select"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bridal Consultation">Bridal Consultation</option>
                      <option value="Custom Stitching">Custom Stitching</option>
                      <option value="Appointment Request">Appointment Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="form-label">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Tell us what you are looking for..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 cursor-pointer"
                >
                  <Send size={16} /> Send via WhatsApp Concierge
                </button>
              </form>
            )}
          </div>

          {/* Frequently Asked Questions */}
          <div className="lg:col-span-6 space-y-4">
            <h2
              className="text-xl font-semibold text-[#1C1814] mb-2 flex items-center gap-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <HelpCircle size={20} className="text-[#C9A96E]" /> Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#9B8B7E] mb-6">
              Learn how our private appointment model works for your convenience.
            </p>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-[#E0D8CE] p-5 shadow-xs">
                  <h3 className="text-sm font-semibold text-[#1C1814] mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-[#6B5B4E] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
