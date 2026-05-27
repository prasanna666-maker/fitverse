import express from "express";

const router = express.Router();

import { gymsData as gyms } from "../data/gymsData.js";

// GET /api/gyms
router.get("/", (req, res) => {
  const { type, area, minPrice, maxPrice, search, sort } = req.query;
  let result = [...gyms];

  if (type) result = result.filter((g) => g.type === type);
  if (area) result = result.filter((g) => g.location.area === area);
  if (minPrice) result = result.filter((g) => g.pricing.monthly >= Number(minPrice));
  if (maxPrice) result = result.filter((g) => g.pricing.monthly <= Number(maxPrice));
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (g) => g.name.toLowerCase().includes(s) || g.description.toLowerCase().includes(s) || g.location.area.toLowerCase().includes(s)
    );
  }

  if (sort === "price_asc") result.sort((a, b) => a.pricing.monthly - b.pricing.monthly);
  else if (sort === "price_desc") result.sort((a, b) => b.pricing.monthly - a.pricing.monthly);
  else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  else result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);

  // Strip reviews from list view
  res.json(result.map(({ reviews, ...g }) => g));
});

// GET /api/gyms/areas
router.get("/areas", (req, res) => {
  const areas = [...new Set(gyms.map((g) => g.location.area))].sort();
  res.json(areas);
});

// GET /api/gyms/compare
router.get("/compare", (req, res) => {
  const ids = req.query.ids?.split(",") || [];
  if (ids.length < 2 || ids.length > 3) return res.status(400).json({ error: "Provide 2 or 3 gym IDs" });
  const result = gyms.filter((g) => ids.includes(g._id));
  res.json(result);
});

// GET /api/gyms/:slug
router.get("/:slug", (req, res) => {
  const gym = gyms.find((g) => g.slug === req.params.slug);
  if (!gym) return res.status(404).json({ error: "Gym not found" });
  res.json(gym);
});

// POST /api/gyms/:slug/reviews
router.post("/:slug/reviews", (req, res) => {
  const gym = gyms.find((g) => g.slug === req.params.slug);
  if (!gym) return res.status(404).json({ error: "Gym not found" });
  const { user, rating, comment } = req.body;
  if (!user || !rating || !comment) return res.status(400).json({ error: "user, rating, comment required" });
  gym.reviews.push({ _id: `r${Date.now()}`, user, rating: Number(rating), comment, date: new Date() });
  const sum = gym.reviews.reduce((a, r) => a + r.rating, 0);
  gym.rating = Math.round((sum / gym.reviews.length) * 10) / 10;
  gym.reviewCount = gym.reviews.length;
  res.status(201).json(gym);
});

export default router;
