import { Response } from "express";
import { NotificationService, registerSSEClient } from "../services/notification.service";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError, QueryFilters } from "../utils/http";

export class NotificationController {
  static async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await NotificationService.getUserNotifications(
        req.user!.id,
        query,
      );
      res.json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch notifications", "NOTIFICATION_FETCH_FAILED");
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user!.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      handleControllerError(res, error, "Failed to mark notification as read", "NOTIFICATION_READ_FAILED");
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      handleControllerError(res, error, "Failed to mark notifications as read", "NOTIFICATION_READ_ALL_FAILED");
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      handleControllerError(res, error, "Failed to get unread count", "NOTIFICATION_COUNT_FAILED");
    }
  }

  /**
   * GET /api/notifications/stream  (and /api/v1/notifications/stream)
   *
   * Server-Sent Events endpoint. Keeps the connection open and pushes a JSON
   * event every time a notification is created for the authenticated user.
   *
   * Client usage:
   *   const es = new EventSource('/api/v1/notifications/stream', { withCredentials: true });
   *   es.onmessage = (e) => console.log(JSON.parse(e.data));
   *
   * A comment (:keepalive) is sent every 30 seconds to prevent proxy timeouts.
   */
  static stream(req: AuthRequest, res: Response) {
    const userId = req.user!.id;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx buffering
    res.flushHeaders();

    // Register this connection in the SSE registry
    const cleanup = registerSSEClient(userId, res);

    // Send an initial "connected" event so the client knows the stream is live
    res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

    // Keepalive comment every 30 seconds (prevents proxy / load balancer timeout)
    const keepalive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(keepalive);
      }
    }, 30_000);

    // Cleanup on client disconnect
    req.on("close", () => {
      clearInterval(keepalive);
      cleanup();
    });
  }
}
