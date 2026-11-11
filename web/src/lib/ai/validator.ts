import "server-only";
import { aiSeverityFromWasteCount } from "@/lib/severity";

// ── Schema ────────────────────────────────────────────────────────────────────

export type WasteCategory =
  | "plastic_bottle"
  | "plastic_bag"
  | "fishing_net"
  | "rope"
  | "styrofoam"
  | "can"
  | "glass"
  | "battery"
  | "diaper"
  | "cigarette_butt";

export type AiSeverity = "Low" | "Medium" | "High" | "Critical" | "None";

export interface GeminiWasteResult {
  hasWaste: boolean;
  categories: WasteCategory[];
  /** Total number of individual waste items counted in the image. */
  wasteCount: number;
  /** Derived from wasteCount — never reported by the model. */
  severity: AiSeverity;
  reason: string;
}

// ── Allowed values ────────────────────────────────────────────────────────────

const ALLOWED_CATEGORIES: ReadonlySet<string> = new Set<WasteCategory>([
  "plastic_bottle",
  "plastic_bag",
  "fishing_net",
  "rope",
  "styrofoam",
  "can",
  "glass",
  "battery",
  "diaper",
  "cigarette_butt",
]);

// ── Validation result ─────────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true; data: GeminiWasteResult }
  | { valid: false; error: ValidationError };

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validates the parsed Gemini JSON output against the exact schema.
 * Returns { valid: true, data } or { valid: false, error }.
 * Never throws — the caller decides how to handle rejections.
 */
export function validateGeminiResult(raw: unknown): ValidationResult {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      error: new ValidationError("Response must be a JSON object", "root"),
    };
  }

  const obj = raw as Record<string, unknown>;

  // hasWaste
  if (typeof obj.hasWaste !== "boolean") {
    return {
      valid: false,
      error: new ValidationError(
        `hasWaste must be a boolean, got: ${typeof obj.hasWaste}`,
        "hasWaste",
      ),
    };
  }

  // categories
  if (!Array.isArray(obj.categories)) {
    return {
      valid: false,
      error: new ValidationError("categories must be an array", "categories"),
    };
  }

  for (const cat of obj.categories as unknown[]) {
    if (typeof cat !== "string" || !ALLOWED_CATEGORIES.has(cat)) {
      return {
        valid: false,
        error: new ValidationError(
          `Unknown or invalid category: "${cat}". Allowed: ${[...ALLOWED_CATEGORIES].join(", ")}`,
          "categories",
        ),
      };
    }
  }

  // wasteCount
  if (
    typeof obj.wasteCount !== "number" ||
    !Number.isFinite(obj.wasteCount) ||
    obj.wasteCount < 0
  ) {
    return {
      valid: false,
      error: new ValidationError(
        `wasteCount must be a non-negative number, got: ${String(obj.wasteCount)}`,
        "wasteCount",
      ),
    };
  }

  // reason
  if (typeof obj.reason !== "string") {
    return {
      valid: false,
      error: new ValidationError(
        `reason must be a string, got: ${typeof obj.reason}`,
        "reason",
      ),
    };
  }

  // hasWaste and wasteCount must agree: no waste → 0 items, waste → at least 1.
  const hasWaste = obj.hasWaste as boolean;
  const wasteCount = hasWaste ? Math.max(1, Math.trunc(obj.wasteCount)) : 0;

  return {
    valid: true,
    data: {
      hasWaste,
      categories: obj.categories as WasteCategory[],
      wasteCount,
      severity: aiSeverityFromWasteCount(wasteCount),
      reason: obj.reason as string,
    },
  };
}
