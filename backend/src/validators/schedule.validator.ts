import { z } from "zod";

export const createScheduleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  barangay: z.string().min(1, "Barangay/Location is required").max(300),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "scheduledAt must be a valid ISO date string",
  }),
  workerIds: z
    .array(z.string().uuid("Each worker ID must be a valid UUID"))
    .min(1, "At least one worker must be assigned"),
  reportIds: z.array(z.string().uuid()).optional(),
  equipment: z.array(z.string()).optional(),
});

export const updateScheduleSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  barangay: z.string().min(1).max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  scheduledAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "scheduledAt must be a valid ISO date string",
    })
    .optional(),
  workerIds: z
    .array(z.string().uuid("Each worker ID must be a valid UUID"))
    .min(1, "At least one worker must be assigned")
    .optional(),
  reportIds: z.array(z.string().uuid()).optional(),
  status: z
    .enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"])
    .optional(),
  equipment: z.array(z.string()).optional(),
});

export const updateScheduleStatusSchema = z.object({
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
  notes: z.string().max(500).optional(),
});

export const scheduleFilterSchema = z.object({
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive integer")
    .optional(),
  status: z
    .enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"])
    .optional(),
  barangay: z.string().max(300).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().max(200).optional(),
});
