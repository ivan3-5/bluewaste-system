import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";
import { env } from "../config/env";
import { EmailVerificationError } from "../services/email-verification.service";
import {
  extendWebSession,
  getActiveWebSession,
  revokeWebSession,
  webSessionTiming,
} from "../services/web-session.service";
import { generateToken, verifyRefreshToken, verifyToken } from "../utils/jwt";
import { sendError } from "../utils/http";
import { ActivityLogService, formatActorName } from "../services/activity-log.service";

/** Cookie name for the long-lived refresh token */
const REFRESH_COOKIE = "refresh_token";
const WEB_REFRESH_COOKIE = "web_refresh_token";

/** Shared options for the refresh_token HttpOnly cookie */
const refreshCookieOptions = {
  httpOnly: true,                              // Never accessible via document.cookie
  secure: env.NODE_ENV === "production",       // HTTPS only in prod
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,           // 7 days in ms
  path: "/",                                  // Root path so refresh works regardless of routing prefix
};

const webCookieOptions = {
  httpOnly: refreshCookieOptions.httpOnly,
  secure: refreshCookieOptions.secure,
  sameSite: refreshCookieOptions.sameSite,
  path: refreshCookieOptions.path,
};

function readWebRefreshGrant(req: Request) {
  const grant = req.body?.refreshToken ?? req.cookies?.[WEB_REFRESH_COOKIE];
  if (typeof grant !== "string") return null;
  try {
    const claims = verifyRefreshToken(grant);
    if (claims.sessionId) return { ...claims, grant };
  } catch {
    // An expired or malformed grant carries no session identity.
  }
  return null;
}

function webSessionEnded(res: Response) {
  return sendError(res, 401, "Web session ended.", "WEB_SESSION_ENDED");
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      await ActivityLogService.log({
        userId: result.user.id,
        userName: formatActorName(result.user),
        userRole: result.user.role,
        action: "USER_REGISTERED",
        category: "AUTH",
        description: `${formatActorName(result.user)} registered a new account`,
        entityType: "User",
        entityId: result.user.id,
        metadata: { email: result.user.email },
      });
      res.status(201).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      if (message === "Email already registered") {
        return res.status(409).json({ error: message });
      }
      if (error instanceof EmailVerificationError) {
        return res.status(error.statusCode).json({
          error: { code: error.code, message: error.message },
          message: error.message,
        });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async verifyEmail(req: Request, res: Response, web = false) {
    try {
      const result = await AuthService.verifyEmail(req.body.email, req.body.code, web);
      await ActivityLogService.log({
        userId: result.user.id,
        userName: formatActorName(result.user),
        userRole: result.user.role,
        action: "USER_EMAIL_VERIFIED",
        category: "AUTH",
        description: `${formatActorName(result.user)} verified their email address`,
        entityType: "User",
        entityId: result.user.id,
        metadata: { channel: web ? "web" : "mobile" },
      });
      res.cookie(web ? WEB_REFRESH_COOKIE : REFRESH_COOKIE, result.refreshToken, web ? webCookieOptions : refreshCookieOptions);
      res.set("Cache-Control", "no-store").json(result);
    } catch (error: unknown) {
      if (error instanceof EmailVerificationError) {
        if (error.retryAfterSeconds) res.setHeader("Retry-After", error.retryAfterSeconds);
        return res.status(error.statusCode).json({
          error: { code: error.code, message: error.message },
          message: error.message,
          ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
        });
      }
      return res.status(500).json({ error: "Email verification failed." });
    }
  }

  static async resendVerification(req: Request, res: Response) {
    try {
      const result = await AuthService.resendVerification(req.body.email);
      res.json({
        message: "If the address needs verification, a code has been sent.",
        ...result,
      });
    } catch (error: unknown) {
      if (error instanceof EmailVerificationError) {
        if (error.retryAfterSeconds) res.setHeader("Retry-After", error.retryAfterSeconds);
        return res.status(error.statusCode).json({
          error: { code: error.code, message: error.message },
          message: error.message,
          ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
        });
      }
      return res.status(500).json({ error: "Could not resend verification code." });
    }
  }

  static async login(req: Request, res: Response, web = false) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password, web);
      await ActivityLogService.log({
        userId: result.user.id,
        userName: formatActorName(result.user),
        userRole: result.user.role,
        action: "USER_LOGIN",
        category: "AUTH",
        description: `${formatActorName(result.user)} logged in${web ? " to the web portal" : ""}`,
        entityType: "User",
        entityId: result.user.id,
        metadata: { channel: web ? "web" : "mobile" },
      });
      res.cookie(web ? WEB_REFRESH_COOKIE : REFRESH_COOKIE, result.refreshToken, web ? webCookieOptions : refreshCookieOptions);
      res.set("Cache-Control", "no-store").json(result);
    } catch (error: unknown) {
      console.error("Login Error Details:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred during login";
      if (message === "Invalid email or password") {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message }
        });
      }
      if (error instanceof EmailVerificationError) {
        return res.status(error.statusCode).json({
          error: { code: error.code, message: error.message },
          message: error.message,
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
   * Reads either the HttpOnly refresh_token cookie OR a JSON payload refreshToken,
   * returning a new access token.
   */
  static async refresh(req: Request, res: Response) {
    try {
      const token: string | undefined = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
      if (!token) {
        return res.status(401).json({ error: "No refresh token provided" });
      }
      const result = await AuthService.refreshAccessToken(token);
      if (result.refreshToken) {
        res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
      }
      res.json(result);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  }

  /**
   * POST /api/auth/logout
   * Clears the refresh_token cookie and acknowledges logout.
   */
  static async logout(req: Request, res: Response) {
    let actorId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        actorId = verifyToken(authHeader.split(" ")[1]).userId;
      } catch {
        // Ignore invalid/expired token during logout
      }
    }
    if (!actorId) {
      const refreshToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
      if (typeof refreshToken === "string") {
        try {
          actorId = verifyRefreshToken(refreshToken).userId;
        } catch {
          // Ignore invalid/expired refresh token during logout
        }
      }
    }

    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
      path: "/",
    });

    if (actorId) {
      await ActivityLogService.log({
        userId: actorId,
        action: "USER_LOGOUT",
        category: "AUTH",
        description: "User logged out",
        entityType: "User",
        entityId: actorId,
        metadata: { channel: "mobile" },
      });
    }

    res.json({ message: "Logged out successfully" });
  }

  static async refreshWeb(req: Request, res: Response) {
    try {
      const claims = readWebRefreshGrant(req);
      if (!claims) return webSessionEnded(res);
      const session = await getActiveWebSession(claims);
      if (!session) return webSessionEnded(res);
      res.set("Cache-Control", "no-store").json({
        token: generateToken(session.userId, session.id),
        ...webSessionTiming(session.expiresAt),
      });
    } catch {
      return sendError(res, 500, "Unable to refresh web session.");
    }
  }

  static async webSession(req: AuthRequest, res: Response) {
    if (!req.webSession) return webSessionEnded(res);
    res.set("Cache-Control", "no-store").json(webSessionTiming(req.webSession.expiresAt));
  }

  static async webActivity(req: AuthRequest, res: Response) {
    if (!req.webSession || !req.user) return webSessionEnded(res);
    const activityAgeMs = req.body?.activityAgeMs ?? 0;
    if (!Number.isSafeInteger(activityAgeMs) || activityAgeMs < 0) {
      return sendError(res, 400, "Invalid activity age.");
    }
    try {
      const session = await extendWebSession(req.user.id, req.webSession.id, activityAgeMs);
      if (!session) return webSessionEnded(res);
      res.set("Cache-Control", "no-store").json(webSessionTiming(session.expiresAt));
    } catch {
      return sendError(res, 500, "Unable to record web activity.");
    }
  }

  static async logoutWeb(req: Request, res: Response) {
    try {
      const claims = readWebRefreshGrant(req);
      if (claims) await revokeWebSession(claims);
      const cookie = req.cookies?.[WEB_REFRESH_COOKIE];
      if (!cookie || cookie === claims?.grant) res.clearCookie(WEB_REFRESH_COOKIE, webCookieOptions);
      if (claims?.userId) {
        await ActivityLogService.log({
          userId: claims.userId,
          action: "USER_LOGOUT",
          category: "AUTH",
          description: "User logged out of the web portal",
          entityType: "User",
          entityId: claims.userId,
          metadata: { channel: "web" },
        });
      }
      res.status(204).end();
    } catch {
      return sendError(res, 500, "Unable to end web session.");
    }
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
      await ActivityLogService.log({
        userId: user.id,
        userName: formatActorName(user),
        userRole: user.role,
        action: "PROFILE_UPDATED",
        category: "USER",
        description: `${formatActorName(user)} updated their profile`,
        entityType: "User",
        entityId: user.id,
        metadata: { updatedFields: Object.keys(req.body || {}) },
      });
      res.json(user);
    } catch {
      res.status(500).json({ error: "Profile update failed" });
    }
  }
}
