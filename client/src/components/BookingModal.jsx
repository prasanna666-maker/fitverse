import { useState, useEffect, useContext } from "react";
import { X, Calendar, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { getAvailableSlots, createBooking } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BookingModal({ gym, onClose }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().split("T")[0];
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [date, setDate] = useState(minDate);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    getAvailableSlots(gym._id, date)
      .then((res) => setSlots(res.data.availableSlots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, gym._id, user]);

  const handleSubmit = async () => {
    if (!user) { navigate("/login"); return; }
    if (!selectedSlot) { setError("Please select a time slot"); return; }

    setSubmitting(true);
    setError("");
    try {
      await createBooking({ gymId: gym._id, date, timeSlot: selectedSlot, notes });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-navy-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-navy-800/50">
          <div>
            <h2 className="text-lg font-bold text-white">Book a Free Trial</h2>
            <p className="text-xs text-navy-300 mt-0.5">{gym.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed! 🎉</h3>
            <p className="text-navy-300 text-sm mb-2">
              Your trial session at <strong className="text-white">{gym.name}</strong> is booked!
            </p>
            <p className="text-navy-300 text-sm mb-1">📅 {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="text-navy-300 text-sm mb-6">🕐 {selectedSlot}</p>
            <p className="text-xs text-accent-400 mb-6">A confirmation email has been sent to {user?.email}</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">Close</button>
              <button onClick={() => navigate("/bookings")} className="flex-1 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors">My Bookings</button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Date picker */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-navy-200 mb-2">
                <Calendar className="w-4 h-4 text-accent-400" /> Select Date
              </label>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-navy-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-500/50 [color-scheme:dark]"
              />
            </div>

            {/* Time slots */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-navy-200 mb-2">
                <Clock className="w-4 h-4 text-accent-400" /> Choose a Time Slot
              </label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-accent-400 animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-navy-400 py-4 text-center">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium text-left transition-all ${
                        selectedSlot === slot
                          ? "bg-accent-500 text-white border-2 border-accent-400"
                          : "bg-navy-800/60 text-navy-200 border border-white/10 hover:border-accent-500/40"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-navy-200 mb-2 block">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements, injuries to mention..."
                rows={2}
                className="w-full bg-navy-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500/50 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedSlot || loadingSlots}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold text-sm hover:from-accent-600 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Booking...</span>
              ) : (
                "Confirm Free Trial Booking"
              )}
            </button>
            <p className="text-center text-xs text-navy-400">Free trial • No payment required • Cancellable anytime</p>
          </div>
        )}
      </div>
    </div>
  );
}
