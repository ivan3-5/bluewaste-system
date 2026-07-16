import { Redis } from "@upstash/redis";
import { env } from "../config/env";

const GEO_CACHE_TTL_SECONDS = 60;

const redisClient =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export const GeoCache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient) return null;
    try {
      const raw = await redisClient.get<string>(key);
      if (!raw) return null;
      return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (!redisClient) return;
    try {
      await redisClient.set(key, JSON.stringify(value), {
        ex: GEO_CACHE_TTL_SECONDS,
      });
    } catch {
      // Non-fatal — fall through to a fresh DB query next time
    }
  },

  async del(pattern: string): Promise<void> {
    if (!redisClient) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Non-fatal
    }
  },

  async invalidateAll() {
    await this.del("bluewaste:geo:map:*");
    await this.del("bluewaste:geo:heatmap:*");
  },
};
