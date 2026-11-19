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
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), AuthController.verifyEmail);
router.post("/resend-verification", authLimiter, validate(resendVerificationSchema), AuthController.resendVerification);

// Refresh: read HttpOnly cookie, return new access token
router.post("/refresh", AuthController.refresh);

// Logout: clear the HttpOnly refresh_token cookie
router.post("/logout", AuthController.logout);

router.get("/me", authenticate, AuthController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  AuthController.updateProfile,
);

export default router;
