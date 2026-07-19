import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";
import { env } from "../config/env";

/** Cookie name for the long-lived refresh token */
const REFRESH_COOKIE = "refresh_token";

/** Shared options for the refresh_token HttpOnly cookie */
const refreshCookieOptions = {
  httpOnly: true,                              // Never accessible via document.cookie
  secure: env.NODE_ENV === "production",       // HTTPS only in prod
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,           // 7 days in ms
  path: "/api/auth",                           // Scoped to auth endpoints only
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { refreshToken, ...result } = await AuthService.register(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
      res.status(201).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      if (message === "Email already registered") {
        return res.status(409).json({ error: message });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { refreshToken, ...result } = await AuthService.login(email, password);
      res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
      res.json(result);
    } catch (error: unknown) {
      console.error("Login Error Details:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred during login";
      if (message === "Invalid email or password") {
        return res.status(401).json({ 
          error: { code: "UNAUTHORIZED", message } 
        });
      }
      res.status(500).json({ 
        error: { 
          code: "INTERNAL_SERVER_ERROR", 
          message 
        } 
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Reads the HttpOnly refresh_token cookie and returns a new short-lived
   * access token. No request body required.
   */
  static async refresh(req: Request, res: Response) {
    try {
      const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
      if (!token) {
        return res.status(401).json({ error: "No refresh token provided" });
      }
      const result = await AuthService.refreshAccessToken(token);
      res.json(result);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  }

  /**
   * POST /api/auth/logout
   * Clears the refresh_token cookie. The short-lived access token will
   * expire naturally within 15 minutes.
   */
  static async logout(req: Request, res: Response) {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
    });
    res.json({ message: "Logged out successfully" });
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await AuthService.getProfile(req.user!.id);
      res.json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Profile not found";
      res.status(404).json({ error: message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.json(user);
    } catch {
      res.status(500).json({ error: "Profile update failed" });
    }
  }
}
