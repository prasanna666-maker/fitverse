import mongoose from "mongoose";
import dotenv from "dotenv";
import Gym from "./models/Gym.js";

dotenv.config();

import { gymsData } from "./data/gymsData.js";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Gym.deleteMany({});
    console.log("Cleared existing gyms");

    const processedGyms = gymsData.map(({ _id, reviews, ...rest }) => ({
      ...rest,
      reviews: reviews?.map(({ _id: reviewId, ...revRest }) => revRest) || []
    }));
    await Gym.insertMany(processedGyms);
    console.log(`Seeded ${gymsData.length} gyms successfully!`);

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seed();
