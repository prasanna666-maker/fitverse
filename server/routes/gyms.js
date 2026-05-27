import express from "express";
import Gym from "../models/Gym.js";

const router = express.Router();

// GET /api/gyms — list all gyms with optional filters
router.get("/", async (req, res) => {
  try {
    const { type, area, minPrice, maxPrice, search, sort } = req.query;
    const filter = { approved: { $ne: false } };

    if (type) filter.type = type;
    if (area) filter["location.area"] = area;
    if (minPrice || maxPrice) {
      filter["pricing.monthly"] = {};
      if (minPrice) filter["pricing.monthly"].$gte = Number(minPrice);
      if (maxPrice) filter["pricing.monthly"].$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.area": { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { featured: -1, rating: -1 };
    if (sort === "price_asc") sortOption = { "pricing.monthly": 1 };
    if (sort === "price_desc") sortOption = { "pricing.monthly": -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "name") sortOption = { name: 1 };

    const gyms = await Gym.find(filter)
      .select("-reviews")
      .sort(sortOption)
      .lean();

    res.json(gyms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gyms/areas — get distinct areas
router.get("/areas", async (req, res) => {
  try {
    const areas = await Gym.distinct("location.area");
    res.json(areas.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gyms/compare?ids=id1,id2,id3
router.get("/compare", async (req, res) => {
  try {
    const ids = req.query.ids?.split(",") || [];
    if (ids.length < 2 || ids.length > 3) {
      return res.status(400).json({ error: "Provide 2 or 3 gym IDs" });
    }
    const gyms = await Gym.find({ _id: { $in: ids } }).lean();
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gyms/:slug — single gym detail
router.get("/:slug", async (req, res) => {
  try {
    const gym = await Gym.findOne({ slug: req.params.slug }).lean();
    if (!gym) return res.status(404).json({ error: "Gym not found" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gyms/:slug/reviews — add a review
router.post("/:slug/reviews", async (req, res) => {
  try {
    const { user, rating, comment, photos } = req.body;
    if (!user || !rating || !comment) {
      return res.status(400).json({ error: "user, rating, comment are required" });
    }
    const gym = await Gym.findOne({ slug: req.params.slug });
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    gym.reviews.push({ user, rating: Number(rating), comment, photos: photos || [] });
    gym.calculateRating();
    await gym.save();

    res.status(201).json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
