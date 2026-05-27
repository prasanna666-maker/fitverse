import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      required: true,
      enum: ["Gym", "MMA", "Boxing", "CrossFit", "Yoga", "Pilates", "Zumba"],
    },
    description: { type: String, required: true },
    location: {
      area: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, default: "Chennai" },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    images: [{ type: String }],
    pricing: {
      monthly: { type: Number, required: true },
      quarterly: { type: Number },
      yearly: { type: Number },
    },
    amenities: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
    timings: { type: String, default: "5:00 AM - 10:00 PM" },
    phone: { type: String },
    featured: { type: Boolean, default: false },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-calculate rating when reviews change
gymSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
};

const Gym = mongoose.model("Gym", gymSchema);
export default Gym;
