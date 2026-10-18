import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import coachRoutes from "./routes/coachRoutes.js";

const app = express();

app.disable("x-powered-by");

// ========================================
// 1. REQUEST LOGGER
// ========================================
app.use((req, res, next) => {
  if (req.path === "/health") {
    const timestamp = new Date().toISOString();
    const userAgent = req.get("user-agent") || "Unknown";

    console.log(
      `[HEALTH CHECK REQUEST] ${timestamp} | ${req.method} ${req.originalUrl} | User-Agent: ${userAgent}`
    );

    res.on("finish", () => {
      console.log(
        `[HEALTH CHECK RESPONSE] ${new Date().toISOString()} | Status: ${
          res.statusCode
        }`
      );
    });
  }

  next();
});

// ========================================
// 2. CORS CONFIGURATION
// ========================================
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

console.log("[CORS] Allowed frontend origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin, e.g. UptimeRobot.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error(`[CORS BLOCKED] Origin: ${origin}`);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// ========================================
// 3. JSON BODY PARSER
// ========================================
app.use(express.json({ limit: "1mb" }));

// ========================================
// 4. HEALTH CHECK
// ========================================
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Fitness Tracker API is running.",
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 5. API ROUTES
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/coach", coachRoutes);

// ========================================
// 6. 404 HANDLER
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// 7. GLOBAL ERROR HANDLER
// ========================================
app.use((err, _req, res, _next) => {
  console.error("[API ERROR]", err.message);

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This record already exists.",
    });
  }

  if (err?.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed.",
    });
  }

  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ========================================
// 8. START SERVER
// ========================================
const PORT = Number(process.env.PORT) || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER] API running on port ${PORT}`);
      console.log("[SERVER] Health endpoint: /health");
    });
  })
  .catch((err) => {
    console.error("[SERVER STARTUP FAILED]", err.message);
    process.exit(1);
  });
