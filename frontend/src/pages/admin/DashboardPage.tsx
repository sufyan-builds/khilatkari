import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shirt,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MessageCircle,
  BarChart2,
  RefreshCw,
  XCircle,
  MapPin,
} from "lucide-react";
import { authService } from "../../services/auth";
import { appointmentsService } from "../../services/appointments";
import type { AdminStats, Appointment } from "../../types";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      authService.getStats().catch(() => null),
      appointmentsService.adminGetAll({ limit: 5 }).catch(() => null),
    ]).then(([statsRes, aptsRes]) => {
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (aptsRes?.success && aptsRes.data) {
        setRecentAppointments(aptsRes.data.appointments);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const appointmentStatCards = [
    {
      title: "Pending",
      value: stats?.pendingAppointments ?? "—",
      sub: "Awaiting WhatsApp outreach",
      icon: <Clock className="text-amber-500" size={20} />,
      link: "/admin/appointments?status=pending",
      color: "border-l-amber-400",
    },
    {
      title: "Contacted",
      value: stats?.contactedAppointments ?? "—",
      sub: "In discussion",
      icon: <MessageCircle className="text-blue-500" size={20} />,
      link: "/admin/appointments?status=contacted",
      color: "border-l-blue-400",
    },
    {
      title: "Confirmed",
      value: stats?.confirmedAppointments ?? "—",
      sub: "Scheduled home visits",
      icon: <CheckCircle className="text-emerald-600" size={20} />,
      link: "/admin/appointments?status=confirmed",
      color: "border-l-emerald-400",
    },
    {
      title: "Completed",
      value: stats?.completedAppointments ?? "—",
      sub: "Appointments done",
      icon: <Sparkles className="text-purple-500" size={20} />,
      link: "/admin/appointments?status=completed",
      color: "border-l-purple-400",
    },
    {
      title: "Today",
      value: stats?.todayAppointments ?? "—",
      sub: "Preferred date = today",
      icon: <Calendar className="text-[#C9A96E]" size={20} />,
      link: `/admin/appointments?date=${new Date().toISOString().split("T")[0]}`,
      color: "border-l-[#C9A96E]",
    },
    {
      title: "Upcoming",
      value: stats?.upcomingAppointments ?? "—",
      sub: "Confirmed / contacted",
      icon: <BarChart2 className="text-teal-500" size={20} />,
      link: "/admin/appointments?status=confirmed",
      color: "border-l-teal-400",
    },
    {
      title: "Cancelled",
      value: stats?.cancelledAppointments ?? "—",
      sub: "Did not proceed",
      icon: <XCircle className="text-red-400" size={20} />,
      link: "/admin/appointments?status=cancelled",
      color: "border-l-red-300",
    },
    {
      title: "Total Appointments",
      value: stats?.totalAppointments ?? "—",
      sub: "All time",
      icon: <Calendar className="text-[#9B8B7E]" size={20} />,
      link: "/admin/appointments",
      color: "border-l-gray-300",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#1C1814] text-white p-6 md:p-8 rounded-xs border border-[#3A3028] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium block mb-1">
            Concierge Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            MS Fashions Boutique
          </h1>
          <p className="text-xs text-[#C8BBA8] mt-1">
            Manage your exclusive collection and coordinate private home appointments.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/admin/products/new" className="btn-gold btn-sm flex items-center gap-1.5">
            <Plus size={16} /> Add New Piece
          </Link>
          <button
            onClick={refresh}
            className="btn-outline border-[#3A3028] text-[#C8BBA8] hover:bg-white hover:text-[#1C1814] btn-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/" target="_blank" className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814] btn-sm flex items-center gap-1.5">
            <ExternalLink size={14} /> Storefront
          </Link>
        </div>
      </div>

      {/* Product & Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link
          to="/admin/products"
          className="bg-white border border-[#E0D8CE] p-6 rounded-xs hover:border-[#C9A96E] transition-all group block shadow-xs"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8B7E]">Total Pieces</span>
            <div className="p-2 bg-[#FAF8F5] border border-[#E0D8CE] rounded-xs">
              <Shirt className="text-[#C9A96E]" size={20} />
            </div>
          </div>
          <div className="text-3xl font-semibold text-[#1C1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {loading ? "..." : (stats?.totalProducts ?? "—")}
          </div>
          <p className="text-xs text-[#6B5B4E]">{stats?.featuredProducts ?? 0} featured on homepage</p>
        </Link>

        <div className="bg-[#F2EDE6] border border-[#E0D8CE] p-6 rounded-xs">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-[#C9A96E]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8B7E]">City Breakdown</span>
          </div>
          {loading ? (
            <p className="text-xs text-[#9B8B7E]">Loading...</p>
          ) : stats?.cityBreakdown && Object.keys(stats.cityBreakdown).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.cityBreakdown).map(([city, count]) => (
                <div key={city} className="flex items-center justify-between text-sm">
                  <span className="text-[#6B5B4E] font-medium">{city}</span>
                  <span className="text-xs font-semibold bg-[#1C1814] text-[#C9A96E] px-2 py-0.5 rounded-xs">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9B8B7E]">No appointments yet</p>
          )}
        </div>
      </div>

      {/* Appointment Metrics Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#9B8B7E] mb-4">
          Appointment Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {appointmentStatCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className={`bg-white border border-[#E0D8CE] border-l-4 ${card.color} p-5 rounded-xs hover:shadow-sm transition-all block`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8B7E] leading-tight">
                  {card.title}
                </span>
                {card.icon}
              </div>
              <div className="text-2xl font-semibold text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
                {loading ? "..." : card.value}
              </div>
              <p className="text-[0.7rem] text-[#9B8B7E] mt-1">{card.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white border border-[#E0D8CE] rounded-xs shadow-xs">
        <div className="p-6 border-b border-[#E0D8CE] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
              Recent Appointment Requests
            </h2>
            <p className="text-xs text-[#9B8B7E]">Clients seeking private home viewings</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-[#C9A96E] hover:text-[#1C1814] flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#9B8B7E]">Loading appointments...</div>
          ) : recentAppointments.length === 0 ? (
            <div className="p-12 text-center text-[#9B8B7E]">
              <Sparkles size={28} className="mx-auto text-[#C9A96E] mb-2" />
              <p className="text-sm">No appointment requests yet.</p>
              <p className="text-xs text-[#9B8B7E] mt-1">Client bookings made via the website or WhatsApp will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E0D8CE] uppercase tracking-wider text-[#9B8B7E]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold">City</th>
                  <th className="py-3.5 px-6 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-6 font-semibold">Collection</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D8CE]">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-[#1C1814]">
                      <div>{apt.customerName}</div>
                      <div className="text-[0.7rem] text-[#9B8B7E]">{apt.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-[#6B5B4E]">{apt.city}</td>
                    <td className="py-4 px-6 text-[#6B5B4E]">
                      <div>{apt.preferredDate}</div>
                      <div className="text-[0.7rem] text-[#9B8B7E]">{apt.preferredTime}</div>
                    </td>
                    <td className="py-4 px-6 text-[#6B5B4E]">
                      <div>{apt.collection}</div>
                      {apt.interestedPiece && (
                        <div className="text-[0.7rem] text-[#C9A96E] italic">{apt.interestedPiece}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider rounded-xs ${
                          apt.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : apt.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : apt.status === "contacted"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "completed"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to="/admin/appointments" className="text-[#C9A96E] hover:text-[#1C1814] font-medium">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
