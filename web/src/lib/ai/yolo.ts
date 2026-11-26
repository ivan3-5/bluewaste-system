import "server-only";

import { requestYolo } from "../../../../backend/src/utils/yolo-client";
export { YoloRequestError } from "../../../../backend/src/utils/yolo-client";

import { aiSeverityFromWasteCount, formatWasteAnalysis, type AiSeverityLabel } from "@/lib/severity";

export interface YoloAnalysis {
  hasWaste: boolean;
  categories: string[];
  /** Total number of waste items detected in the image. */
  wasteCount: number;
  /** Derived from wasteCount. */
  severity: AiSeverityLabel;
  reason: string;
}

function toCount(value: unknown): number | null {
  const parsed = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) && parsed >= 0
    ? Math.trunc(parsed)
    : null;
}

/**
 * Normalises a raw YOLO payload. Severity is based on the total number of
 * detected waste items (`waste_count`, falling back to the label counts).
 */
export function normalizeYoloResult(rawPayload: unknown): YoloAnalysis {
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    throw new Error("YOLO returned an invalid response.");
  }
  const result = rawPayload as Record<string, unknown>;
  if (typeof result.has_waste !== "boolean" || !Array.isArray(result.labels)) {
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
  const hasWaste = result.has_waste && reportedCount > 0;
  const wasteCount = hasWaste ? reportedCount : 0;
  const severity = aiSeverityFromWasteCount(wasteCount);

  return {
    hasWaste,
    categories: [...new Set(categories)],
    wasteCount,
    severity,
    reason: formatWasteAnalysis(hasWaste, severity),
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
