import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validators/auth.validator";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register,
);
router.post("/login", authLimiter, validate(loginSchema), (req, res) => AuthController.login(req, res));
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), (req, res) => AuthController.verifyEmail(req, res));
router.post("/resend-verification", authLimiter, validate(resendVerificationSchema), AuthController.resendVerification);

// Refresh: read HttpOnly cookie, return new access token
router.post("/refresh", AuthController.refresh);

// Logout: clear the HttpOnly refresh_token cookie
router.post("/logout", AuthController.logout);

router.post("/web/login", authLimiter, validate(loginSchema), (req, res) => AuthController.login(req, res, true));
router.post("/web/verify-email", authLimiter, validate(verifyEmailSchema), (req, res) => AuthController.verifyEmail(req, res, true));
router.post("/web/refresh", AuthController.refreshWeb);
router.get("/web/session", authenticate, AuthController.webSession);
router.post("/web/activity", authenticate, AuthController.webActivity);
router.post("/web/logout", AuthController.logoutWeb);

router.get("/me", authenticate, AuthController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  AuthController.updateProfile,
);

export default router;
