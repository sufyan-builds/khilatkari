import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  User,
  Mail,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { CITIES, CATEGORIES, BRAND, WHATSAPP_URL, APPOINTMENT_PROCESS } from "../data/constants";
import { appointmentsService } from "../services/appointments";
import type { AppointmentCreate } from "../types";

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const preselectedCollection = searchParams.get("collection") || "";
  const preselectedProductId = searchParams.get("product") || "";
  const preselectedProductName = searchParams.get("productName") || "";

  const [formData, setFormData] = useState<AppointmentCreate>({
    customerName: "",
    phone: "",
    email: "",
    city: CITIES[0] || "Lahore",
    preferredDate: "",
    preferredTime: "Afternoon (2:00 PM - 5:00 PM)",
    collection: preselectedCollection || CATEGORIES.find((c) => c !== "All") || "Chikankari",
    interestedPiece: preselectedProductName || undefined,
    productId: preselectedProductId || undefined,
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (preselectedCollection) {
      setFormData((prev) => ({ ...prev, collection: preselectedCollection }));
    }
    if (preselectedProductId) {
      setFormData((prev) => ({ ...prev, productId: preselectedProductId }));
    }
    if (preselectedProductName) {
      setFormData((prev) => ({ ...prev, interestedPiece: preselectedProductName }));
    }
  }, [preselectedCollection, preselectedProductId, preselectedProductName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.preferredDate) {
      setErrorMessage("Please complete all required fields (Name, WhatsApp number, and Preferred Date).");
      return;
    }

    setLoading(true);
    try {
      const res = await appointmentsService.submit(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.message || "Failed to submit request. Please try again or reach out on WhatsApp.");
      }
    } catch {
      setErrorMessage("A network error occurred. Please contact us directly via WhatsApp for instant booking.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappConfirmMessage = `Hello MS Fashions! I just submitted a private appointment request for ${formData.customerName} in ${formData.city} for ${formData.preferredDate} (${formData.preferredTime}). Collection: ${formData.collection}.${formData.interestedPiece ? ` Interested Piece: ${formData.interestedPiece}.` : ""}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      {/* Header */}
      <div className="container-main max-w-4xl text-center mb-12">
        <p className="section-label mb-3">Bespoke Experience</p>
        <h1
          className="text-display-lg text-[#1C1814] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Request a Private Appointment
        </h1>
        <div className="divider-gold" />
        <p className="text-[#6B5B4E] max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
          We bring our exclusive bridal and luxury traditional wear directly to your residence. Enjoy an unhurried, private viewing curated exclusively for you.
        </p>
      </div>

      <div className="container-main max-w-5xl">
        {submitted ? (
          /* ── Success Screen ─────────────────── */
          <div className="bg-white border border-[#E0D8CE] p-8 md:p-14 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#C9A96E]/15 text-[#C9A96E] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} />
            </div>
            <h2
              className="text-display-sm text-[#1C1814] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Appointment Request Received
            </h2>
            <p className="text-[#6B5B4E] text-sm leading-relaxed mb-6">
              Thank you, <strong className="text-[#1C1814]">{formData.customerName}</strong>. Our concierge will contact you via WhatsApp at{" "}
              <strong className="text-[#1C1814]">{formData.phone}</strong> to confirm your private appointment in{" "}
              <strong className="text-[#1C1814]">{formData.city}</strong> on{" "}
              <strong className="text-[#1C1814]">{formData.preferredDate}</strong>.
            </p>

            <div className="bg-[#FAF8F5] border border-[#E0D8CE] p-5 mb-8 text-left text-xs md:text-sm space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#9B8B7E]">City:</span>
                <span className="font-medium text-[#1C1814]">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9B8B7E]">Preferred Slot:</span>
                <span className="font-medium text-[#1C1814]">{formData.preferredTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9B8B7E]">Collection:</span>
                <span className="font-medium text-[#1C1814]">{formData.collection}</span>
              </div>
              {formData.interestedPiece && (
                <div className="flex justify-between">
                  <span className="text-[#9B8B7E]">Interested Piece:</span>
                  <span className="font-medium text-[#1C1814]">{formData.interestedPiece}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <a
                href={WHATSAPP_URL(whatsappConfirmMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full text-center flex items-center justify-center gap-2 py-3.5"
              >
                <MessageCircle size={18} /> Confirm Instantly on WhatsApp
              </a>
              <Link to="/collections" className="btn-outline w-full text-center block">
                Continue Exploring the Collection
              </Link>
            </div>
          </div>
        ) : (
          /* ── Booking Form ─────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form column (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E0D8CE] p-6 md:p-10 shadow-sm">
              <h2
                className="text-xl font-semibold text-[#1C1814] mb-6 pb-3 border-b border-[#E0D8CE]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Appointment Details
              </h2>

              {errorMessage && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                  <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                    <input
                      id="customerName"
                      type="text"
                      required
                      placeholder="e.g. Fatima Khan"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                    WhatsApp / Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input pl-10"
                    />
                  </div>
                  <p className="text-[0.7rem] text-[#9B8B7E] mt-1">We will message you on WhatsApp to confirm your booking.</p>
                </div>

                {/* Email (optional) */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. fatima@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                {/* City & Collection row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                      <select
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="form-input pl-10 cursor-pointer"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* What are you looking for */}
                  <div>
                    <label htmlFor="collection" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                      What Are You Looking For? *
                    </label>
                    <div className="relative">
                      <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                      <select
                        id="collection"
                        value={formData.collection}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        className="form-input pl-10 cursor-pointer"
                      >
                        {CATEGORIES.filter((c) => c !== "All").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="Not Sure Yet">Not Sure Yet</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date & Time Slot row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Date */}
                  <div>
                    <label htmlFor="preferredDate" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                      <input
                        id="preferredDate"
                        type="date"
                        required
                        min={minDate}
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="form-input pl-10 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label htmlFor="preferredTime" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                      Preferred Time Slot *
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
                      <select
                        id="preferredTime"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="form-input pl-10 cursor-pointer"
                      >
                        <option value="Morning (11:00 AM - 2:00 PM)">Morning (11:00 AM – 2:00 PM)</option>
                        <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM – 5:00 PM)</option>
                        <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM – 8:00 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Interested Piece — pre-filled from product page */}
                {formData.interestedPiece && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                      Interested Piece
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#F2EDE6] border border-[#C9A96E]/40">
                      <Tag size={14} className="text-[#C9A96E] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#1C1814]">{formData.interestedPiece}</span>
                      <span className="text-xs text-[#9B8B7E] ml-auto">Pre-filled from collection</span>
                    </div>
                  </div>
                )}

                {/* Additional Request */}
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
                    Additional Notes for Our Concierge
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    placeholder="Tell us anything you'd like our concierge to know — colour preferences, event dates, bridal requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  id="submit-appointment"
                  className="btn-gold w-full py-4 text-center justify-center flex items-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Request Private Appointment</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              {/* Process card */}
              <div className="bg-[#F2EDE6] border border-[#E0D8CE] p-6 md:p-8">
                <h3
                  className="text-lg font-semibold text-[#1C1814] mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  How Private Appointments Work
                </h3>
                <div className="space-y-5">
                  {APPOINTMENT_PROCESS.map((step) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-full bg-[#1C1814] text-[#C9A96E] text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step.step}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1C1814] mb-1">{step.title}</h4>
                        <p className="text-xs text-[#6B5B4E] leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant WhatsApp alternative */}
              <div className="bg-[#1C1814] text-[#FAF8F5] p-6 md:p-8">
                <div className="flex items-center gap-2 text-[#C9A96E] mb-2 text-xs uppercase tracking-widest font-semibold">
                  <MessageCircle size={15} /> Instant Concierge
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Prefer Direct WhatsApp?
                </h3>
                <p className="text-xs text-[#C8BBA8] leading-relaxed mb-6">
                  Skip the form and message our style director directly on WhatsApp for immediate date coordination.
                </p>
                <a
                  href={WHATSAPP_URL("Hello MS Fashions! I'd like to book an exclusive home appointment.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full text-center flex items-center justify-center gap-2 py-3"
                >
                  <MessageCircle size={16} />
                  Message on WhatsApp ({BRAND.whatsappDisplay})
                </a>
              </div>

              {/* Service Areas */}
              <div className="border border-[#E0D8CE] p-6 bg-white">
                <h4 className="text-xs uppercase tracking-widest text-[#9B8B7E] font-semibold mb-3">
                  Service Cities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <span
                      key={city}
                      className="px-3 py-1 bg-[#FAF8F5] border border-[#E0D8CE] text-xs text-[#1C1814] font-medium"
                    >
                      {city}
                    </span>
                  ))}
                </div>
                <p className="text-[0.75rem] text-[#9B8B7E] mt-3">
                  Private consultations include in-home fabric draping, size measurements, and custom embroidery options.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
