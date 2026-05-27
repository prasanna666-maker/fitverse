import express from "express";
import User from "../models/User.js";
import Gym from "../models/Gym.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route  POST /api/favorites/:gymId
// @desc   Toggle a gym as favorite
// @access Private
router.post("/:gymId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const gymId = req.params.gymId;

    // Check gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    const isFavorited = user.favorites.some((id) => id.toString() === gymId);

    if (isFavorited) {
      user.favorites = user.favorites.filter((id) => id.toString() !== gymId);
    } else {
      user.favorites.push(gymId);
    }

    await user.save();
    res.json({ favorites: user.favorites, isFavorited: !isFavorited });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route  GET /api/favorites
// @desc   Get all favorited gyms for current user
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
