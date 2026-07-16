import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (userId: string): string => {
  // Short-lived access token — 15 minutes
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string): string => {
  // Long-lived refresh token — 7 days, signed with a separate secret
  return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { userId: string };
};
