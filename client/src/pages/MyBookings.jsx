import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { getMyBookings, cancelBooking } from "../api";

const statusConfig = {
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-green-400 bg-green-500/10 border-green-500/20" },
  pending: { label: "Pending", icon: AlertCircle, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel");
    }
    setCancelling(null);
  };

  const upcoming = bookings.filter((b) => b.status !== "cancelled" && new Date(b.date) >= new Date());
  const past = bookings.filter((b) => b.status === "cancelled" || new Date(b.date) < new Date());

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Bookings</h1>
            <p className="text-navy-300 text-sm">{upcoming.length} upcoming session{upcoming.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-navy-800/50 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-navy-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">No bookings yet</h2>
            <p className="text-navy-300 mb-6">Book a free trial session at any gym to get started!</p>
            <Link to="/gyms" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 text-white font-bold hover:bg-accent-600 transition-colors">
              Explore Gyms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Upcoming</h2>
                <div className="space-y-4">
                  {upcoming.map((booking) => {
                    const st = statusConfig[booking.status];
                    return (
                      <div key={booking._id} className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
                        {/* Gym image */}
                        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={booking.gym?.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"}
                            alt={booking.gym?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link to={`/gyms/${booking.gym?.slug}`} className="text-lg font-bold text-white hover:text-accent-400 transition-colors truncate">
                              {booking.gym?.name}
                            </Link>
                            <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                              <st.icon className="w-3.5 h-3.5" />{st.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-navy-300 mb-3">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-accent-400" />
                              {new Date(booking.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-accent-400" />
                              {booking.timeSlot}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-accent-400" />
                              {booking.gym?.location?.area}, Chennai
                            </span>
                          </div>
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              disabled={cancelling === booking._id}
                              className="text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {cancelling === booking._id ? "Cancelling..." : "Cancel Booking"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Past & Cancelled</h2>
                <div className="space-y-4 opacity-60">
                  {past.map((booking) => {
                    const st = statusConfig[booking.status];
                    return (
                      <div key={booking._id} className="glass rounded-2xl p-5 flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <img src={booking.gym?.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-white">{booking.gym?.name}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${st.color}`}>
                              <st.icon className="w-3 h-3" />{st.label}
                            </span>
                          </div>
                          <p className="text-sm text-navy-400">
                            {new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {booking.timeSlot}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
