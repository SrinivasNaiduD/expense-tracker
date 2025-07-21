
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Routes and middleware
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Static file route (e.g., for image uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Global error handler
app.use(errorHandler);

// MongoDB Connection and Server Start
mongoose
  .connect(process.env.MONGO_URI, { useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(9000, () => console.log("Server running on port 9000"));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
