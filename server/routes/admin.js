import express from "express";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Apply protection to all admin routes
router.use(protect, adminOnly);

// @route   GET /api/admin/users
// @desc    Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "owner", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }

    user.role = role;
    await user.save();
    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role: " + err.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user: " + err.message });
  }
});

// @route   GET /api/admin/gyms
// @desc    Get all gyms (approved and unapproved)
router.get("/gyms", async (req, res) => {
  try {
    const gyms = await Gym.find({}).sort({ createdAt: -1 });
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gyms: " + err.message });
  }
});

// @route   POST /api/admin/gyms
// @desc    Create a gym directly (approved by default)
router.post("/gyms", async (req, res) => {
  try {
    const { name, type, description, area, address, lat, lng, monthly, quarterly, yearly, timings, phone, featured, approved, amenities, images } = req.body;
    
    if (!name || !type || !description || !area || !address || !lat || !lng || !monthly) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newGym = await Gym.create({
      name,
      slug,
      type,
      description,
      location: {
        area,
        address,
        coordinates: { lat: Number(lat), lng: Number(lng) }
      },
      pricing: {
        monthly: Number(monthly),
        quarterly: quarterly ? Number(quarterly) : undefined,
        yearly: yearly ? Number(yearly) : undefined
      },
      timings: timings || "5:00 AM - 10:00 PM",
      phone,
      featured: !!featured,
      approved: approved !== undefined ? !!approved : true,
      amenities: amenities || [],
      images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]
    });

    res.status(201).json(newGym);
  } catch (err) {
    res.status(500).json({ error: "Failed to create gym: " + err.message });
  }
});

// @route   PUT /api/admin/gyms/:id/approve
// @desc    Approve or disapprove a gym
router.put("/gyms/:id/approve", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    gym.approved = !gym.approved;
    await gym.save();
    res.json({ message: `Gym ${gym.approved ? "approved" : "unapproved"} successfully`, gym });
  } catch (err) {
    res.status(500).json({ error: "Failed to update gym: " + err.message });
  }
});

// @route   PUT /api/admin/gyms/:id/featured
// @desc    Feature or unfeature a gym
router.put("/gyms/:id/featured", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    gym.featured = !gym.featured;
    await gym.save();
    res.json({ message: `Gym featured status: ${gym.featured ? "Featured" : "Regular"}`, gym });
  } catch (err) {
    res.status(500).json({ error: "Failed to update gym: " + err.message });
  }
});

// @route   DELETE /api/admin/gyms/:id
// @desc    Delete a gym
router.delete("/gyms/:id", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    await Gym.findByIdAndDelete(req.params.id);
    res.json({ message: "Gym deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete gym: " + err.message });
  }
});

export default router;
