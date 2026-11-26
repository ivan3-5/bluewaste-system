import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthClaims {
  userId: string;
  sessionId?: string;
}

export const generateToken = (userId: string, sessionId?: string): string => {
  const claims = sessionId ? { userId, sessionId } : { userId };
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (userId: string, sessionId?: string): string => {
  // A web refresh grant is valid only while its server-side session is active.
  if (sessionId) return jwt.sign({ userId, sessionId }, env.REFRESH_TOKEN_SECRET);
  return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as AuthClaims;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as AuthClaims;
};
