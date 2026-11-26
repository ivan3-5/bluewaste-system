import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

const isValidDateInput = (value: string) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
};

export const activityCategorySchema = z.enum([
    "AUTH",
    "USER",
    "REPORT",
    "SCHEDULE",
    "ZONE",
    "SYSTEM",
]);

export const activityLogQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.preprocess(
        emptyToUndefined,
        z.string().trim().max(200).optional(),
    ),
    userId: z.preprocess(
        emptyToUndefined,
        z.string().uuid("Invalid userId filter").optional(),
    ),
    userRole: z.preprocess(
        emptyToUndefined,
        z
            .enum(["LGU_ADMIN", "FIELD_WORKER", "CITIZEN", "ANONYMOUS", "SYSTEM"])
            .optional(),
    ),
    category: z.preprocess(emptyToUndefined, activityCategorySchema.optional()),
    action: z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .max(80)
            .regex(/^[A-Z0-9_]+$/, "Invalid action filter")
            .optional(),
    ),
    startDate: z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .refine(isValidDateInput, "Invalid startDate")
            .optional(),
    ),
    endDate: z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .refine(isValidDateInput, "Invalid endDate")
            .optional(),
    ),
});

export type ActivityLogQuery = z.infer<typeof activityLogQuerySchema>;
