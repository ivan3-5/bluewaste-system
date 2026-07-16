import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import prisma from "../config/database";
import { sendError } from "../utils/http";
import { Redis } from "@upstash/redis";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// ---------------------------------------------------------------------------
// AuthCache — Caches user validity/role to prevent DB hit on every API request.
// Falls back to in-memory map if Upstash is not configured. TTL: 60s
// ---------------------------------------------------------------------------
const AUTH_CACHE_TTL_SECONDS = 60;
const redisClient =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// In-memory fallback for local dev without Redis
const fallbackCache = new Map<string, { expiresAt: number; data: any }>();

const AuthCache = {
  async get(userId: string) {
    const key = `bluewaste:auth:${userId}`;
    if (redisClient) {
      try {
        const raw = await redisClient.get<string>(key);
        return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
      } catch {
        return null;
      }
    } else {
      const cached = fallbackCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
      if (cached) fallbackCache.delete(key);
      return null;
    }
  },

  async set(userId: string, data: any) {
    const key = `bluewaste:auth:${userId}`;
    if (redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(data), {
          ex: AUTH_CACHE_TTL_SECONDS,
        });
      } catch {
        /* ignore */
      }
    } else {
      fallbackCache.set(key, {
        expiresAt: Date.now() + AUTH_CACHE_TTL_SECONDS * 1000,
        data,
      });
    }
  },
  
  async invalidate(userId: string) {
    const key = `bluewaste:auth:${userId}`;
    if (redisClient) {
      try { await redisClient.del(key); } catch { /* ignore */ }
    } else {
      fallbackCache.delete(key);
    }
  }
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        401,
        "Access denied. No token provided.",
        "UNAUTHORIZED",
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    let user = await AuthCache.get(decoded.userId);
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
      if (user) {
        await AuthCache.set(decoded.userId, user);
      }
    }

    if (!user || !user.isActive) {
      return sendError(res, 401, "Invalid or expired token.", "UNAUTHORIZED");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token.", "UNAUTHORIZED");
  }
};

// Optional authentication - doesn't fail if no token, but attaches user if present
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    let user = await AuthCache.get(decoded.userId);
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
      if (user) {
        await AuthCache.set(decoded.userId, user);
      }
    }

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }

    next();
  } catch {
    next();
  }
};
