import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// SSE real-time stream — must be registered BEFORE /:id routes
router.get("/stream", authenticate, NotificationController.stream);

router.get("/", authenticate, NotificationController.getUserNotifications);
router.get(
  "/unread-count",
  authenticate,
  NotificationController.getUnreadCount,
);
router.put("/read-all", authenticate, NotificationController.markAllAsRead);
router.put("/:id/read", authenticate, NotificationController.markAsRead);

export default router;
