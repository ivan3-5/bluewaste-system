import { ActivityCategory, Prisma } from "@prisma/client";
import prisma from "../config/database";
import { logger } from "../utils/logger";
import { buildPaginatedResponse } from "../utils/pagination";
import type { ActivityLogQuery } from "../validators/activity-log.validator";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "code",
  "codehash",
  "otp",
  "authorization",
  "cookie",
  "cookies",
  "apikey",
  "jwt",
  "sessionid",
  "privatekey",
]);

function isSensitiveKey(key: string): boolean {
  const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return SENSITIVE_KEYS.has(normalized);
}

export function sanitizeMetadata(
  value: unknown,
  depth = 0,
): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null || typeof value === "function") {
    return undefined;
  }
  if (depth > 5) {
    return undefined;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => sanitizeMetadata(item, depth + 1))
      .filter((item): item is Prisma.InputJsonValue => item !== undefined);
    return items;
  }
  if (typeof value === "object") {
    const sanitized: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        continue;
      }
      const cleaned = sanitizeMetadata(entry, depth + 1);
      if (cleaned !== undefined) {
        sanitized[key] = cleaned;
      }
    }
    return sanitized;
  }
  return String(value);
}

export function formatActorName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
} | null): string {
  if (!user) return "System";
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.email || "Unknown User";
}

export interface LogActivityInput {
  userId?: string | null;
  userName?: string;
  userRole?: string;
  action: string;
  category: ActivityCategory;
  description: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

function parseDateBound(value: string, isEnd: boolean): Date {
  // Date-only input (YYYY-MM-DD) should cover the full UTC day
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T${isEnd ? "23:59:59.999" : "00:00:00.000"}Z`);
  }
  return new Date(value);
}

export class ActivityLogService {
  static async log(input: LogActivityInput): Promise<void> {
    try {
      let resolvedName = input.userName?.trim();
      let resolvedRole = input.userRole?.trim();

      if (input.userId && (!resolvedName || !resolvedRole)) {
        const actor = await prisma.user.findUnique({
          where: { id: input.userId },
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        });
        if (actor) {
          resolvedName = resolvedName || formatActorName(actor);
          resolvedRole = resolvedRole || actor.role;
        }
      }

      const sanitized = input.metadata
        ? sanitizeMetadata(input.metadata)
        : undefined;

      await prisma.activityLog.create({
        data: {
          userId: input.userId ?? null,
          userName: resolvedName || "System",
          userRole: resolvedRole || "SYSTEM",
          action: input.action,
          category: input.category,
          description: input.description,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          ...(sanitized !== undefined && { metadata: sanitized }),
        },
      });
    } catch (error) {
      logger.warn(
        { err: error, action: input.action, entityId: input.entityId },
        "Failed to record activity log",
      );
    }
  }

  static async getLogs(query: ActivityLogQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      userId,
      userRole,
      category,
      action,
      startDate,
      endDate,
    } = query;

    const where: Prisma.ActivityLogWhereInput = {};

    if (userId) where.userId = userId;
    if (userRole) where.userRole = userRole;
    if (category) where.category = category;
    if (action) where.action = action;

    if (startDate || endDate) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (startDate) createdAt.gte = parseDateBound(startDate, false);
      if (endDate) createdAt.lte = parseDateBound(endDate, true);
      if (createdAt.gte && createdAt.lte && createdAt.gte > createdAt.lte) {
        return buildPaginatedResponse([], 0, { page, limit });
      }
      where.createdAt = createdAt;
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        {
          user: {
            is: {
              email: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return buildPaginatedResponse(logs, total, { page, limit });
  }

  static async getFilterOptions() {
    const [distinctActions, users] = await Promise.all([
      prisma.activityLog.findMany({
        distinct: ["action"],
        select: { action: true },
        orderBy: { action: "asc" },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

    return {
      actions: distinctActions.map((entry) => entry.action),
      users: users.map((u) => ({
        id: u.id,
        name: formatActorName(u),
        role: u.role,
      })),
      categories: Object.values(ActivityCategory),
      roles: ["LGU_ADMIN", "FIELD_WORKER", "CITIZEN", "ANONYMOUS", "SYSTEM"],
    };
  }
}
