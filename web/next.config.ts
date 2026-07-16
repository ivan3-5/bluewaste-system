import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Environment variable handling for Prisma on Vercel
  env: {
    // Ensure DATABASE_URL is available during build
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Ensure proper TypeScript compilation
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:5000",
        "bluewaste-system.onrender.com",
        "*.onrender.com",
        "*.vercel.app",
      ],
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
