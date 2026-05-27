import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import gymRoutes from "./routes/gyms.js";
import mockRoutes from "./routes/mock.js";
import paymentRoutes from "./routes/payment.js";
import authRoutes from "./routes/auth.js";
import favoritesRoutes from "./routes/favorites.js";
import bookingRoutes from "./routes/bookings.js";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Fitverse API is running!" });
});
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

// Try connecting to MongoDB
let dbConnected = false;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    dbConnected = true;
    app.use("/api/gyms", gymRoutes);
    startServer();
  })
  .catch((err) => {
    console.warn("⚠️  MongoDB unavailable, using mock data:", err.message);
    app.use("/api/gyms", mockRoutes);
    startServer();
  });

function startServer() {
  app.listen(PORT, () =>
    console.log(
      `🚀 Server running on http://localhost:${PORT} (DB: ${dbConnected ? "MongoDB" : "Mock Data"})`
    )
  );
}