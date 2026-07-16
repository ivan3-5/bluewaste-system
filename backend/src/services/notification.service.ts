import prisma from "../config/database";
import { NotificationType } from "@prisma/client";
import { Response } from "express";
import {
  getPaginationParams,
  buildPaginatedResponse,
} from "../utils/pagination";

// ---------------------------------------------------------------------------
// SSE Client Registry
// Tracks open Server-Sent Event connections per user.
// ---------------------------------------------------------------------------
const sseClients = new Map<string, Set<Response>>();

/**
 * Push a notification event to all open SSE connections for the given user.
 * Called internally after every `prisma.notification.create()`.
 */
function notifySSE(userId: string, notification: object) {
  const connections = sseClients.get(userId);
  if (!connections || connections.size === 0) return;

  const data = `data: ${JSON.stringify(notification)}\n\n`;
  for (const res of connections) {
    try {
      res.write(data);
    } catch {
      // Connection was closed; cleanup handled by the "close" listener
    }
  }
}

/**
 * Register an SSE response for a user and return a cleanup function.
 */
export function registerSSEClient(userId: string, res: Response): () => void {
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);

  return () => {
    const set = sseClients.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) sseClients.delete(userId);
    }
  };
}

export class NotificationService {
  static async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    reportId?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
        reportId: data.reportId,
      },
    });

    // Push to any open SSE connections for this user
    notifySSE(data.userId, notification);

    return notification;
  }

  static async getUserNotifications(
    userId: string,
    filters: { page?: string; limit?: string },
  ) {
    const pagination = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        include: {
          report: {
            select: { id: true, title: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return buildPaginatedResponse(notifications, total, pagination);
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  static async notifyAdmins(
    title: string,
    message: string,
    reportId?: string,
    type?: string,
  ) {
    const admins = await prisma.user.findMany({
      where: { role: "LGU_ADMIN", isActive: true },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        this.create({
          userId: admin.id,
          title,
          message,
          type: (type || "SYSTEM") as any,
          reportId,
        }),
      ),
    );
  }
}
