import { useEffect, useState } from "react";
import {
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
} from "lucide-react";
import { appointmentsService } from "../../services/appointments";
import type { Appointment, AppointmentStatus } from "../../types";
import { CITIES } from "../../data/constants";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 border-emerald-300 text-emerald-800",
  pending: "bg-amber-50 border-amber-300 text-amber-800",
  contacted: "bg-blue-50 border-blue-300 text-blue-800",
  completed: "bg-purple-50 border-purple-300 text-purple-800",
  rescheduled: "bg-teal-50 border-teal-300 text-teal-800",
  cancelled: "bg-gray-100 border-gray-300 text-gray-700",
};

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  rescheduled: "bg-teal-100 text-teal-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    appointmentsService
      .adminGetAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        city: cityFilter === "all" ? undefined : cityFilter,
        limit: 100,
      })
      .then((res) => {
        if (res.success && res.data) {
          setAppointments(res.data.appointments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, cityFilter]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const res = await appointmentsService.adminUpdateStatus(id, newStatus);
      if (res.success && res.data) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Error updating appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    try {
      const current = appointments.find((a) => a.id === id);
      if (!current) return;
      await appointmentsService.adminUpdateStatus(id, current.status, notes);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, adminNotes: notes } : a))
      );
    } catch {
      alert("Error saving notes");
    }
  };

  const buildWhatsAppUrl = (apt: Appointment) => {
    const phone = apt.phone.replace(/[^0-9]/g, "");
    const pieceText = apt.interestedPiece ? ` regarding the piece "${apt.interestedPiece}"` : "";
    const msg = `Hello ${apt.customerName}! This is MS Fashions${pieceText}. We are reaching out about your private appointment request for ${apt.preferredDate} in ${apt.city}. Please let us know your availability to confirm the appointment.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm) ||
      a.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.interestedPiece || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || a.preferredDate === dateFilter;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <span className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium block mb-1">
          Client Consultations
        </span>
        <h1 className="text-2xl font-semibold text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
          Private Appointments
        </h1>
        <p className="text-xs text-[#9B8B7E] mt-0.5">
          Manage private viewing bookings, update status, add concierge notes, and contact customers on WhatsApp.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-[#E0D8CE] p-4 rounded-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
          <input
            type="text"
            placeholder="Search customer, piece, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 text-xs"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input text-xs cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* City Filter */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="form-input text-xs cursor-pointer"
        >
          <option value="all">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Date Filter */}
        <div className="relative">
          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-input pl-10 text-xs cursor-pointer"
            title="Filter by preferred appointment date"
          />
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="text-xs text-[#9B8B7E]">
          Showing <strong className="text-[#1C1814]">{filtered.length}</strong> appointment{filtered.length !== 1 ? "s" : ""}
          {dateFilter && <span> for date <strong className="text-[#1C1814]">{dateFilter}</strong></span>}
        </p>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E0D8CE] rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#9B8B7E]">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#9B8B7E]">
            <Calendar size={32} className="mx-auto text-[#C9A96E] mb-2" />
            <p className="text-sm font-medium text-[#1C1814]">No appointment records found</p>
            <p className="text-xs mt-1">Try clearing your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E0D8CE] uppercase tracking-wider text-[#9B8B7E]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold w-6"></th>
                  <th className="py-3.5 px-5 font-semibold">Client</th>
                  <th className="py-3.5 px-5 font-semibold">City & Date</th>
                  <th className="py-3.5 px-5 font-semibold">Collection & Piece</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D8CE]">
                {filtered.map((apt) => {
                  const isExpanded = expandedId === apt.id;

                  return (
                    <>
                      {/* Main Row */}
                      <tr
                        key={apt.id}
                        className={`hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer ${isExpanded ? "bg-[#FAF8F5]" : ""}`}
                        onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                      >
                        {/* Expand toggle */}
                        <td className="py-4 px-4 text-[#9B8B7E]">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-sm text-[#1C1814]">{apt.customerName}</div>
                          <div className="text-[0.7rem] text-[#9B8B7E] flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {apt.phone}
                          </div>
                          {apt.email && (
                            <div className="text-[0.65rem] text-[#9B8B7E]">{apt.email}</div>
                          )}
                        </td>

                        {/* City & Date */}
                        <td className="py-4 px-5">
                          <div className="font-medium text-[#1C1814] flex items-center gap-1">
                            <MapPin size={12} className="text-[#C9A96E]" /> {apt.city}
                          </div>
                          <div className="text-[0.7rem] text-[#6B5B4E] mt-0.5">
                            {apt.preferredDate}
                          </div>
                          <div className="text-[0.65rem] text-[#9B8B7E]">{apt.preferredTime}</div>
                        </td>

                        {/* Collection & Piece */}
                        <td className="py-4 px-5 max-w-[180px]">
                          <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E0D8CE] text-[0.65rem] font-semibold text-[#8C6B2D] uppercase tracking-wider block w-fit mb-1">
                            {apt.collection}
                          </span>
                          {apt.interestedPiece && (
                            <div className="flex items-center gap-1 text-[0.7rem] text-[#C9A96E] italic">
                              <Tag size={10} /> {apt.interestedPiece}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={apt.status}
                            disabled={updatingId === apt.id}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                            className={`text-xs font-semibold py-1 px-2.5 rounded-xs border cursor-pointer uppercase tracking-wider ${STATUS_STYLES[apt.status] ?? "bg-gray-100 border-gray-300 text-gray-700"}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="rescheduled">Rescheduled</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* WhatsApp */}
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={buildWhatsAppUrl(apt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white hover:bg-[#20bd5a] text-[0.7rem] font-medium rounded-xs shadow-xs transition-colors"
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr key={`${apt.id}-detail`} className="bg-[#F2EDE6]/60">
                          <td colSpan={6} className="px-5 pb-5 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Full Appointment Info */}
                              <div className="md:col-span-2 space-y-3">
                                <p className="text-[0.65rem] uppercase tracking-widest text-[#9B8B7E] font-semibold flex items-center gap-1">
                                  <FileText size={12} /> Appointment Details
                                </p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Customer:</span>
                                    <span className="font-medium text-[#1C1814]">{apt.customerName}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Phone:</span>
                                    <span className="font-medium text-[#1C1814]">{apt.phone}</span>
                                  </div>
                                  {apt.email && (
                                    <div className="flex justify-between border-b border-[#E0D8CE] pb-1 col-span-2">
                                      <span className="text-[#9B8B7E]">Email:</span>
                                      <span className="font-medium text-[#1C1814]">{apt.email}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">City:</span>
                                    <span className="font-medium text-[#1C1814]">{apt.city}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Preferred Date:</span>
                                    <span className="font-medium text-[#1C1814]">{apt.preferredDate}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Preferred Time:</span>
                                    <span className="font-medium text-[#1C1814]">{apt.preferredTime}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Collection:</span>
                                    <span className="font-medium text-[#1C1814]">{apt.collection}</span>
                                  </div>
                                  {apt.interestedPiece && (
                                    <div className="flex justify-between border-b border-[#E0D8CE] pb-1 col-span-2">
                                      <span className="text-[#9B8B7E]">Interested Piece:</span>
                                      <span className="font-medium text-[#C9A96E] italic">{apt.interestedPiece}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Status:</span>
                                    <span className={`font-semibold uppercase text-[0.65rem] tracking-wider px-2 py-0.5 rounded-xs ${STATUS_BADGE[apt.status] ?? "bg-gray-100 text-gray-700"}`}>
                                      {apt.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-[#E0D8CE] pb-1">
                                    <span className="text-[#9B8B7E]">Received:</span>
                                    <span className="font-medium text-[#1C1814]">
                                      {new Date(apt.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                  </div>
                                </div>
                                {apt.message && (
                                  <div className="mt-2 p-3 bg-white border border-[#E0D8CE] text-xs text-[#6B5B4E] italic">
                                    <span className="text-[#9B8B7E] not-italic font-semibold block mb-1">Customer Note:</span>
                                    "{apt.message}"
                                  </div>
                                )}
                              </div>

                              {/* Admin Notes */}
                              <div>
                                <p className="text-[0.65rem] uppercase tracking-widest text-[#9B8B7E] font-semibold mb-2">
                                  Private Concierge Notes
                                </p>
                                <textarea
                                  rows={5}
                                  defaultValue={apt.adminNotes || ""}
                                  placeholder="e.g. Bring 3 ivory lehengas, client prefers sizes S-M, confirm by Eid..."
                                  onBlur={(e) => handleSaveNotes(apt.id, e.target.value)}
                                  className="text-xs px-3 py-2 bg-white border border-[#E0D8CE] w-full focus:outline-none focus:border-[#C9A96E] resize-none leading-relaxed"
                                />
                                <p className="text-[0.65rem] text-[#9B8B7E] mt-1">
                                  Auto-saves on blur. Only visible to admin.
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
