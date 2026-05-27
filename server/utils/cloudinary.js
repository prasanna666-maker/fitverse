import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for gym review photos
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fitverse/reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
  },
});

// Storage for gym images (owner uploads)
const gymStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fitverse/gyms",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
  },
});

export const uploadReviewPhoto = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadGymPhoto = multer({
  storage: gymStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export { cloudinary };
