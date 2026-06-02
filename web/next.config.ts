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
  // Optimize for serverless environment
  swcMinify: true,
  // Ensure proper TypeScript compilation
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
