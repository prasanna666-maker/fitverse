import express from "express";
import { uploadReviewPhoto, uploadGymPhoto } from "../utils/cloudinary.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/upload/review
// @desc    Upload a review photo to Cloudinary
// @access  Private
router.post("/review", protect, uploadReviewPhoto.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

// @route   POST /api/upload/gym (for future owner uploads)
// @desc    Upload a gym image to Cloudinary  
// @access  Private
router.post("/gym", protect, uploadGymPhoto.array("photos", 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "No files uploaded" });
  const urls = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
  res.json(urls);
});

export default router;
