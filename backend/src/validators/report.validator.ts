import { z } from "zod";

export const createReportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  // Accept both legacy Flutter category names (PLASTIC_WASTE, ORGANIC_WASTE, etc.)
  // and the canonical DB enum values (with_waste, no_waste).
  // The category is also set/overridden by the YOLO analysis pipeline after upload.
  category: z
    .string()
    .transform((v) => {
      const lower = v.toLowerCase();
      if (lower === "no_waste") return "no_waste" as const;
      return "with_waste" as const;
    })
    .default("with_waste"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(500).nullable().optional(),
  isAnonymous: z.boolean().default(false),
  isSpamFlagged: z.boolean().nullable().optional(),
  spamReason: z.string().max(500).nullable().optional(),
  yoloConfidence: z.number().min(0).max(100).nullable().optional(),
  /** Pre-computed severity from the client-side YOLO /analyze pipeline */
  severity: z
    .enum(["CRITICAL", "HIGH", "MODERATE", "SPAM"])
    .nullable()
    .optional(),
  /** Pre-computed analysis status from the client-side YOLO pipeline */
  analysisStatus: z.enum(["DIRTY", "CLEAN"]).nullable().optional(),
  /** Pre-computed confidence (0.0–1.0) from the client-side YOLO pipeline */
  analysisConfidence: z.number().min(0).max(1).nullable().optional(),
  /** Number of waste items detected by client-side analysis */
  analysisWasteCount: z.number().int().min(0).nullable().optional(),
  aiModel: z.string().nullable().optional(),
  aiCategories: z.array(z.string()).nullable().optional(),
  aiReason: z.string().max(2000).nullable().optional(),
  aiProcessingMs: z.number().int().min(0).nullable().optional(),
  aiGeminiMs: z.number().int().min(0).nullable().optional(),
});


export const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "VERIFIED",
    "CLEANUP_SCHEDULED",
    "IN_PROGRESS",
    "CLEANED",
    "REJECTED",
  ]),
  notes: z.string().max(500).optional(),
});

export const mapFilterSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "VERIFIED",
      "CLEANUP_SCHEDULED",
      "IN_PROGRESS",
      "CLEANED",
      "REJECTED",
    ])
    .optional(),
  category: z.enum(["with_waste", "no_waste"]).optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive integer")
    .optional(),
});

export const heatmapFilterSchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive integer")
    .optional(),
});

export const reportFilterSchema = z.object({
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive integer")
    .optional(),
  status: z
    .enum([
      "PENDING",
      "VERIFIED",
      "CLEANUP_SCHEDULED",
      "IN_PROGRESS",
      "CLEANED",
      "REJECTED",
    ])
    .optional(),
  category: z.enum(["with_waste", "no_waste"]).optional(),
  isSpam: z.enum(["true", "false"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().max(200).optional(),
});

export const assignWorkerSchema = z.object({
  assignedToId: z.string().min(1, "assignedToId is required"),
});
