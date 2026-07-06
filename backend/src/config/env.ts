import dotenv from "dotenv";
import { z } from "zod";
import path from "path";
import fs from "fs";

// Load .env files only in development
if (process.env.NODE_ENV !== "production") {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envPath = path.join(process.cwd(), ".env");

  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  } else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Validate DATABASE_URL format
function validateDatabaseUrl(url: string): boolean {
  try {
    const dbUrl = new URL(url);
    // Ensure it's a postgresql URL
    if (!dbUrl.protocol.startsWith("postgresql")) {
      return false;
    }
    // For Vercel deployments, ensure sslmode is set
    if (process.env.VERCEL) {
      const searchParams = dbUrl.searchParams;
      if (!searchParams.has("sslmode")) {
        console.warn(
          "⚠️  DATABASE_URL missing sslmode parameter. Vercel deployments should use sslmode=require",
        );
      }
    }
    return true;
  } catch {
    return false;
  }
}

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid URL")
    .refine(
      validateDatabaseUrl,
      "DATABASE_URL must be a postgresql:// URL. For Vercel, use sslmode=require",
    ),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  WEB_URL: z.string().default("http://localhost:3000"),
  MOBILE_URL: z.string().default("http://localhost:8081"),
  ALLOWED_ORIGINS: z.string().optional(),
  YOLO_API_URL: z.string().url().default("http://localhost:8000/analyze"),
  SPAM_RETENTION_DAYS: z.coerce.number().int().min(1).default(3),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error(
    "❌ Invalid environment variables:",
    Object.entries(errors)
      .map(([key, msgs]) => `${key}: ${msgs?.join("; ")}`)
      .join("\n"),
  );
  process.exit(1);
}

// Log startup info for debugging
if (process.env.NODE_ENV === "development") {
  console.log("✓ Environment variables validated");
  console.log(
    `✓ Database: ${parsed.data.DATABASE_URL.split("@")[1]?.split("?")[0] || "local"}`,
  );
  console.log(`✓ Node environment: ${parsed.data.NODE_ENV}`);
}

export const env = parsed.data;
