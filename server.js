import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

const corsOptions = {
  origin: "https://edu-frontend-chi.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.options("/api/*", cors(corsOptions));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/users", cors(corsOptions), userRoutes);
app.use("/api/courses", cors(corsOptions), courseRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
