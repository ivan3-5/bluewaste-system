import "server-only";

import { requestYolo, YoloRequestError } from "../../../../backend/src/utils/yolo-client";
export { YoloRequestError };

import { dbSeverityToAiLabel, formatWasteAnalysis, parseYoloSeverity, type YoloSeverity } from "@/lib/severity";

export interface YoloAnalysis {
  hasWaste: boolean;
  categories: string[];
  /** Total number of waste items detected in the image. */
  wasteCount: number;
  severity: YoloSeverity;
  reason: string;
}

function toCount(value: unknown): number | null {
  const parsed = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) && parsed >= 0
    ? Math.trunc(parsed)
    : null;
}

/**
 * Normalises a raw YOLO payload. The returned severity determines the verdict.
 */
export function normalizeYoloResult(rawPayload: unknown): YoloAnalysis {
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    throw new Error("YOLO returned an invalid response.");
  }
  const result = rawPayload as Record<string, unknown>;
  const severity = parseYoloSeverity(result.severity);
  if (!severity) throw new YoloRequestError("invalid-severity");
  if (!Array.isArray(result.labels)) {
    throw new Error("YOLO response is missing valid detection fields.");
  }

  let labelItemTotal = 0;
  const categories = result.labels.map((item: unknown) => {
    if (typeof item === "string") {
      labelItemTotal += 1;
      return item;
    }
    if (item && typeof item === "object" && "label" in item &&
        typeof item.label === "string") {
      labelItemTotal += Math.max(1, toCount((item as { count?: unknown }).count) ?? 1);
      return item.label;
    }
    throw new Error("YOLO response contains an invalid label.");
  }).filter((label) => label !== "with_waste" && label !== "no_waste");

  const reportedCount = toCount(result.waste_count) ?? toCount(result.count) ?? labelItemTotal;
  const hasWaste = severity !== "SPAM";
  const wasteCount = hasWaste ? reportedCount : 0;

  return {
    hasWaste,
    categories: hasWaste ? [...new Set(categories)] : [],
    wasteCount,
    severity,
    reason: formatWasteAnalysis(hasWaste, dbSeverityToAiLabel(severity)),
  };
}

export async function analyzeImageWithYolo(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<YoloAnalysis> {
  return normalizeYoloResult(await requestYoloPayload(buffer, mimeType, filename));
}

export async function requestYoloPayload(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<unknown> {
  const configuredUrl = process.env.YOLO_API_URL;
  if (!configuredUrl) throw new Error("YOLO_API_URL is not configured.");
  return requestYolo(configuredUrl, { bytes: buffer, mimeType, filename }, process.env.HF_TOKEN);
}
