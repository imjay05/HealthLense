require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/AuthRoutes");
const reportRoutes = require("./routes/ReportRoutes");
const symptomRoutes = require("./routes/SymptomRoutes");
const historyRoutes = require("./routes/HistoryRoutes");

const app = express();

// Middleware 
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes 
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/history", historyRoutes);

// 404 handler 
app.use((req, res) => {
  res
     .status(404)
     .json({ 
        message: `Route ${req.method} ${req.path} not found` 
    });
});

// Global error handler 
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
              .status(400)
              .json({ 
                message: "File too large. Max 10MB allowed." 
            });
  }
  if (err.message?.includes("Only JPG")) {
    return res
             .status(400)
             .json({ message: err.message });
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
              .status(400)
              .json({ message: messages.join(", ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res
              .status(401)
              .json({ message: "Invalid token" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});


module.exports = app;