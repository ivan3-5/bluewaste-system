import { z } from "zod";
import { CleanupScheduleStatus, ReportStatus } from "@prisma/client";

const roleEnum = z.enum([
  "CITIZEN",
  "LGU_ADMIN",
  "FIELD_WORKER",
]);

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  role: roleEnum,
  phone: z.string().max(30).optional(),
  address: z.string().optional(),
});

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    role: roleEnum.optional(),
    phone: z.string().max(30).optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
    avatarUrl: z.string().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(150).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const userReportHistorySchema = historyQuerySchema.extend({
  status: z.nativeEnum(ReportStatus).optional(),
});

export const userScheduleHistorySchema = historyQuerySchema.extend({
  status: z.nativeEnum(CleanupScheduleStatus).optional(),
});

export type UserReportHistoryQuery = z.infer<typeof userReportHistorySchema>;
export type UserScheduleHistoryQuery = z.infer<typeof userScheduleHistorySchema>;
