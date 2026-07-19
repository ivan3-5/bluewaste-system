import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import reportRoutes from "./routes/report.routes";
import notificationRoutes from "./routes/notification.routes";
import uploadRoutes from "./routes/upload.routes";
import reportingZoneRoutes from "./routes/reportingZone.routes";
import analyticsRoutes from "./routes/analytics.routes";
import scheduleRoutes from "./routes/schedule.routes";

const app = express();

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, "");

const additionalOrigins = (env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelOrigins = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
]
  .filter((value): value is string => Boolean(value && value.trim()))
  .flatMap((value) => {
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return [trimmed];
    }
    return [`https://${trimmed}`];
  });

const allowedOrigins = new Set(
  [
    normalizeOrigin(env.WEB_URL),
    "http://localhost:3001",
    normalizeOrigin(env.MOBILE_URL),
    "http://localhost:3000",
    "http://localhost:8081",
    "https://bluewaste-management-system.vercel.app",
    "https://bluewaste-system.vercel.app",
    ...additionalOrigins,
    ...vercelOrigins,
  ].map(normalizeOrigin),
);

const isTrustedVercelPreviewOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") {
      return false;
    }

    return (
      /^bluewaste-management-system(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(
        url.hostname,
      ) || /^bluewaste-system(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
};

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (curl, health checks, server-to-server calls).
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (
      allowedOrigins.has(normalizedOrigin) ||
      isTrustedVercelPreviewOrigin(normalizedOrigin)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS_ORIGIN_BLOCKED:${normalizedOrigin}`));
  },
  credentials: true,
};

// Ensure correct client IP detection behind reverse proxies/load balancers.
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(pinoHttp({ logger }));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "BlueWaste API",
    timestamp: new Date().toISOString(),
  });
});

// Also support /api/health for backward compatibility
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "BlueWaste API",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API Routes — versioned primary endpoints (/api/v1/)
// ---------------------------------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/reporting-zones", reportingZoneRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/schedules", scheduleRoutes);

// ---------------------------------------------------------------------------
// Backward-compatible aliases (/api/*) — kept so existing clients don't break.
// Adds Deprecation header to signal clients should migrate to /api/v1/.
// ---------------------------------------------------------------------------
const deprecationMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Deprecation", "true");
  res.setHeader("Link", '</api/v1/>; rel="successor-version"');
  next();
};
app.use("/api/auth", deprecationMiddleware, authRoutes);
app.use("/api/users", deprecationMiddleware, userRoutes);
app.use("/api/reports", deprecationMiddleware, reportRoutes);
app.use("/api/notifications", deprecationMiddleware, notificationRoutes);
app.use("/api/upload", deprecationMiddleware, uploadRoutes);
app.use("/api/reporting-zones", deprecationMiddleware, reportingZoneRoutes);
app.use("/api/analytics", deprecationMiddleware, analyticsRoutes);
app.use("/api/schedules", deprecationMiddleware, scheduleRoutes);

// Error handler
app.use(errorHandler);

// Start server (only in development, not in serverless)
const PORT = parseInt(env.PORT, 10);

if (env.NODE_ENV !== "production" && env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 BlueWaste API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🗄️  Database connected`);
  });
}

export { app };
