import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/ai/health
 * Quick diagnostics — checks which required env vars are present.
 * Safe to call publicly: it only reveals PRESENCE (true/false), never values.
 */
export async function GET() {
  const checks = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "(not set — will default to gemini-3.5-flash)",
    DATABASE_URL: !!process.env.DATABASE_URL,
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    YOLO_API_URL: process.env.YOLO_API_URL || "(not set)",
  };

  const missing = Object.entries(checks)
    .filter(([key, val]) => val === false)
    .map(([key]) => key);

  return NextResponse.json({
    ok: missing.length === 0,
    missing,
    checks,
  });
}
