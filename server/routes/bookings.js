import express from "express";
import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { sendBookingConfirmation } from "../utils/emailService.js";
import { sendSMS, sendWhatsApp } from "../utils/smsService.js";

const router = express.Router();

// All time slots available per day
const ALL_SLOTS = [
  "6:00 AM - 7:00 AM",
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
  "8:00 PM - 9:00 PM",
];

// @route   GET /api/bookings/slots/:gymId/:date
// @desc    Get available slots for a gym on a specific date
// @access  Private
router.get("/slots/:gymId/:date", protect, async (req, res) => {
  try {
    const { gymId, date } = req.params;
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingBookings = await Booking.find({
      gym: gymId,
      date: { $gte: bookingDate, $lt: nextDay },
      status: { $ne: "cancelled" },
    });

    const bookedSlots = existingBookings.map((b) => b.timeSlot);
    const availableSlots = ALL_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    res.json({ availableSlots, bookedSlots });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/bookings
// @desc    Create a new trial booking
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { gymId, date, timeSlot, notes } = req.body;

    if (!gymId || !date || !timeSlot) {
      return res.status(400).json({ error: "Gym, date, and time slot are required" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    // Check slot is not already taken
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflict = await Booking.findOne({
      gym: gymId,
      date: { $gte: bookingDate, $lt: nextDay },
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return res.status(409).json({ error: "This time slot is already booked" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      gym: gymId,
      date: bookingDate,
      timeSlot,
      notes: notes || "",
      status: "confirmed",
      type: "trial",
    });

    // Send confirmation email (non-blocking)
    const user = await User.findById(req.user._id);
    sendBookingConfirmation(user.email, user.name, booking, gym.name);

    // Send SMS & WhatsApp notifications (non-blocking)
    const userPhone = req.body.phone || "+916382833712"; // User's provided number or default portfolio number
    const formattedDate = new Date(booking.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const messageBody = `Hi ${user.name}! Your free trial session at ${gym.name} is confirmed for ${formattedDate} at ${booking.timeSlot}. Let's get fit! - Team Fitverse`;
    
    sendSMS(userPhone, messageBody);
    sendWhatsApp(userPhone, messageBody);

    const populated = await booking.populate("gym", "name location.area phone");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed: " + err.message });
  }
});

// @route   GET /api/bookings/mine
// @desc    Get current user's bookings
// @access  Private
router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("gym", "name location images phone slug")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status === "cancelled") return res.status(400).json({ error: "Already cancelled" });

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
