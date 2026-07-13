import "server-only";

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
  severity: AiSeverity;
  confidence: number;
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

const ALLOWED_SEVERITIES: ReadonlySet<string> = new Set<AiSeverity>([
  "Low",
  "Medium",
  "High",
  "Critical",
  "None",
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

  // severity
  if (typeof obj.severity !== "string" || !ALLOWED_SEVERITIES.has(obj.severity)) {
    return {
      valid: false,
      error: new ValidationError(
        `Invalid severity: "${obj.severity}". Allowed: ${[...ALLOWED_SEVERITIES].join(", ")}`,
        "severity",
      ),
    };
  }

  // confidence
  if (typeof obj.confidence !== "number" || !Number.isFinite(obj.confidence)) {
    return {
      valid: false,
      error: new ValidationError(
        `confidence must be a finite number, got: ${typeof obj.confidence}`,
        "confidence",
      ),
    };
  }

  if (obj.confidence < 0 || obj.confidence > 1) {
    return {
      valid: false,
      error: new ValidationError(
        `confidence must be between 0 and 1 inclusive, got: ${obj.confidence}`,
        "confidence",
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

  return {
    valid: true,
    data: {
      hasWaste: obj.hasWaste as boolean,
      categories: obj.categories as WasteCategory[],
      severity: obj.severity as AiSeverity,
      confidence: obj.confidence as number,
      reason: obj.reason as string,
    },
  };
}
