import { Request, Response, NextFunction } from "express";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

// ---------------------------------------------------------------------------
// Key extractor — honours X-Forwarded-For set by trusted proxies
// ---------------------------------------------------------------------------
const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(",")[0].trim();
  }
  return (req.ip || req.socket.remoteAddress || "unknown").toString();
};

// ---------------------------------------------------------------------------
// Upstash rate limiter factory (sliding window algorithm)
// ---------------------------------------------------------------------------
type UpstashLimiter = {
  limit: (key: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
};

function buildUpstashLimiter(
  max: number,
  windowSeconds: number,
  prefix: string,
): UpstashLimiter {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
    prefix: `bluewaste:rl:${prefix}`,
    analytics: false,
  });
}

// ---------------------------------------------------------------------------
// Express middleware wrapper around @upstash/ratelimit
// ---------------------------------------------------------------------------
function makeUpstashMiddleware(limiter: UpstashLimiter, errorMessage: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const result = await limiter.limit(ip);

    // Set standard rate limit response headers
    res.setHeader("RateLimit-Limit", result.limit);
    res.setHeader("RateLimit-Remaining", result.remaining);
    res.setHeader("RateLimit-Reset", Math.ceil(result.reset / 1000));

    if (!result.success) {
      return res.status(429).json({ error: errorMessage });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Determine whether Upstash is configured
// ---------------------------------------------------------------------------
const useRedis =
  Boolean(env.UPSTASH_REDIS_REST_URL) &&
  Boolean(env.UPSTASH_REDIS_REST_TOKEN);

if (useRedis) {
  console.log("✓ Rate limiter: using Upstash Redis (sliding window)");
} else {
  console.log(
    "ℹ️  Rate limiter: using in-memory store " +
      "(set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for distributed rate limiting)",
  );
}

// ---------------------------------------------------------------------------
// In-memory fallback helpers (express-rate-limit)
// ---------------------------------------------------------------------------
const memoryGeneral = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: getClientIp,
  validate: false,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const memoryAuth = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: getClientIp,
  validate: false,
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const memoryUpload = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: getClientIp,
  validate: false,
  message: { error: "Too many upload requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------------
// Exported middleware — Upstash when available, in-memory otherwise
// ---------------------------------------------------------------------------

/** General API: 100 requests per minute */
export const generalLimiter = useRedis
  ? makeUpstashMiddleware(
      buildUpstashLimiter(100, 60, "general"),
      "Too many requests, please try again later.",
    )
  : memoryGeneral;

/** Auth endpoints: 10 requests per minute */
export const authLimiter = useRedis
  ? makeUpstashMiddleware(
      buildUpstashLimiter(10, 60, "auth"),
      "Too many authentication attempts, please try again later.",
    )
  : memoryAuth;

/** Upload endpoints: 20 uploads per minute */
export const uploadLimiter = useRedis
  ? makeUpstashMiddleware(
      buildUpstashLimiter(20, 60, "upload"),
      "Too many upload requests, please try again later.",
    )
  : memoryUpload;
