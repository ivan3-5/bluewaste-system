import { NextRequest, NextResponse } from "next/server";
import { classifyYoloPayload, inferWasteCategory } from "@/lib/waste-classification";
import { requestYoloPayload } from "@/lib/ai/yolo";
import { dbSeverityToAiLabel, formatWasteAnalysis, severityFromWasteCount } from "@/lib/severity";
import { analyzeImageWithGemini } from "@/lib/ai/gemini";
import { validateGeminiResult } from "@/lib/ai/validator";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

type DecisionStatus = "DIRTY" | "CLEAN";

type AnalyzeDecision = {
  is_uncertain: boolean;
  reason: string | null;
  message: string | null;
  retake_recommended: boolean;
  capture_tips: string[];
};

interface YoloApiResponse {
  message?: string;
  error?: string;
  count?: unknown;
  waste_count?: unknown;
  has_waste?: unknown;
  status?: unknown;
  decision?: unknown;
  thresholds?: unknown;
  model?: unknown;
  severity?: unknown;
  labels?: unknown;
  all_labels?: unknown;
  [key: string]: unknown;
}

function parseNumeric(
  value: unknown,
  options?: { min?: number; integer?: boolean; asUndefined?: boolean },
): number | null | undefined {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return options?.asUndefined ? undefined : null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return options?.asUndefined ? undefined : null;
  }
  if (options?.min !== undefined && parsed < options.min) {
    return options?.asUndefined ? undefined : null;
  }
  return options?.integer ? Math.trunc(parsed) : parsed;
}

function toNumberOrUndefined(value: FormDataEntryValue | null): number | undefined {
  return parseNumeric(value, { asUndefined: true }) as number | undefined;
}

function normalizeBaseApiUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function toFiniteNumber(value: unknown): number | null {
  return parseNumeric(value) as number | null;
}

function toBooleanOrNull(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return null;
}

function toJsonError(status: number, message: string, details?: string) {
  return NextResponse.json(
    {
      message,
      error: message,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

function toNonNegativeInt(value: unknown): number | null {
  return parseNumeric(value, { min: 0, integer: true }) as number | null;
}

function normalizeDecisionStatus(value: unknown): DecisionStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === "DIRTY" || normalized === "CLEAN") {
    return normalized;
  }

  return null;
}

function normalizeDecision(payload: unknown): AnalyzeDecision {
  const data = (payload !== null && typeof payload === "object" && !Array.isArray(payload))
    ? (payload as Record<string, unknown>)
    : {};
  const decision = (data.decision !== null && typeof data.decision === "object" && !Array.isArray(data.decision))
    ? (data.decision as Record<string, unknown>)
    : {};

  const isUncertain = toBooleanOrNull(decision.is_uncertain) ?? false;
  const retakeRecommended =
    toBooleanOrNull(decision.retake_recommended) ?? isUncertain;

  const reason =
    typeof decision.reason === "string" && decision.reason.trim().length > 0
      ? decision.reason.trim()
      : null;

  const message =
    typeof decision.message === "string" && decision.message.trim().length > 0
      ? decision.message.trim()
      : null;

  const captureTips = Array.isArray(decision.capture_tips)
    ? decision.capture_tips
        .filter((tip: unknown): tip is string => typeof tip === "string")
        .map((tip: string) => tip.trim())
        .filter((tip: string) => tip.length > 0)
    : [];

  return {
    is_uncertain: isUncertain,
    reason,
    message,
    retake_recommended: retakeRecommended,
    capture_tips: captureTips,
  };
}

export async function POST(request: NextRequest) {
  try {
    const providerSetting = process.env.USE_GEMINI?.trim().toLowerCase() || "false";
    if (providerSetting !== "true" && providerSetting !== "false") {
      return toJsonError(500, "Server misconfiguration: USE_GEMINI must be true or false");
    }
    const rawApiBase =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return toJsonError(401, "Unauthorized request");
    }

    const apiBaseUrl = normalizeBaseApiUrl(rawApiBase);
    const formData = await request.formData();

    const image = formData.get("image");
    if (!(image instanceof File)) {
      return toJsonError(400, "Image file is required");
    }

    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return toJsonError(400, "Unsupported image type. Use JPG, PNG, or WEBP.");
    }

    if (image.size > MAX_FILE_SIZE_BYTES) {
      return toJsonError(400, "Image must be 8MB or smaller");
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    let raw: unknown;
    let providerModel: string;
    if (providerSetting === "true") {
      if (!process.env.GEMINI_API_KEY) return toJsonError(500, "Server misconfiguration: GEMINI_API_KEY is not set");
      const mimeType = image.type === "image/png" ? "image/png" : image.type === "image/webp" ? "image/webp" : "image/jpeg";
      const response = await analyzeImageWithGemini(imageBuffer, mimeType);
      const validation = validateGeminiResult(response.result);
      if (!validation.valid) {
        console.error("[AI] Invalid Gemini response:", validation.error.message);
        return toJsonError(422, "Analysis response failed validation");
      }
      const result = validation.data;
      raw = {
        has_waste: result.hasWaste,
        waste_count: result.wasteCount,
        labels: result.categories,
        message: result.reason,
      };
      providerModel = response.modelName;
    } else {
      raw = await requestYoloPayload(imageBuffer, image.type, image.name);
      providerModel = "yolo";
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return toJsonError(502, "Analysis service returned an invalid response");
    }
    const yoloJson = raw as YoloApiResponse;
    const yoloData = yoloJson;

    const classification = classifyYoloPayload(yoloJson);
    // has_waste is the authoritative field from the /analyze hybrid pipeline.
    // The /analyze endpoint returns has_waste but NOT a status field, so we
    // must use has_waste first before falling back to the detected count.
    const labels = Array.isArray(yoloData.labels) ? yoloData.labels : classification.labels;
    const labelNames = labels.flatMap((label: unknown) => {
      if (typeof label === "string") return [label];
      if (label && typeof label === "object" && "label" in label && typeof label.label === "string") return [label.label];
      return [];
    });
    const labelItemTotal = labels.reduce((total: number, label: unknown) => {
      if (label && typeof label === "object" && "count" in label) {
        return total + Math.max(1, toNonNegativeInt((label as { count?: unknown }).count) ?? 1);
      }
      return total + (typeof label === "string" || (label && typeof label === "object") ? 1 : 0);
    }, 0);
    const reportedCount =
      toNonNegativeInt(yoloData.waste_count) ??
      toNonNegativeInt(yoloData.count) ??
      Math.max(classification.totalItems, labelItemTotal);

    const rawHasWaste = yoloData.has_waste;
    const hasWaste: boolean =
      typeof rawHasWaste === "boolean"
        ? rawHasWaste && reportedCount > 0
        : normalizeDecisionStatus(yoloData.status) === "DIRTY" ||
          reportedCount > 0;

    // Severity is based on the total number of waste items detected.
    const wasteCount = hasWaste ? Math.max(reportedCount, 1) : 0;
    const rawCount = wasteCount;
    const status: DecisionStatus = hasWaste ? "DIRTY" : "CLEAN";
    const dbSeverity = severityFromWasteCount(wasteCount);
    const detectedObject = classification.detectedObject === "unknown"
      ? labelNames[0] ?? "unknown"
      : classification.detectedObject;
    const wasteCategory = inferWasteCategory(labels, classification.dominantWaste);
    const summary = formatWasteAnalysis(hasWaste, dbSeverityToAiLabel(dbSeverity));
    const rawDecision = normalizeDecision(yoloJson);
    const decision = {
      ...rawDecision,
      reason: summary,
      message: rawDecision.retake_recommended ? "Please retake the photo for a clearer analysis." : summary,
    };
    const thresholds =
      yoloJson && typeof yoloData.thresholds === "object"
        ? yoloData.thresholds
        : null;
    const modelInfo =
      yoloJson && typeof yoloData.model === "object"
        ? yoloData.model
        : null;

    const saveIfDirtyEntry = formData.get("saveIfDirty");
    const saveIfDirty =
      typeof saveIfDirtyEntry === "string" &&
      saveIfDirtyEntry.trim().toLowerCase() === "true";

    let uploadedImageUrl: string | null = null;
    let savedReport: unknown = null;

    if (saveIfDirty && status === "DIRTY" && !decision.retake_recommended) {
      const uploadBody = new FormData();
      uploadBody.append(
        "image",
        new Blob([imageBuffer], { type: image.type }),
        image.name,
      );

      const uploadResponse = await fetch(`${apiBaseUrl}/upload`, {
        method: "POST",
        headers: { Authorization: authorization },
        body: uploadBody,
      });

      if (!uploadResponse.ok) {
        return toJsonError(502, "Failed to upload image");
      }

      const uploadedImage = await uploadResponse.json();
      uploadedImageUrl = uploadedImage.url;

      const latitude = toNumberOrUndefined(formData.get("latitude"));
      const longitude = toNumberOrUndefined(formData.get("longitude"));
      const addressValue = formData.get("address");
      const address =
        typeof addressValue === "string" && addressValue.trim().length > 0
          ? addressValue.trim()
          : undefined;

      const saveResponse = await fetch(`${apiBaseUrl}/waste-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify({
          imageUrl: uploadedImage.url,
          detectedObject,
          detections: classification.wasteDetections,
          dominantWaste: classification.dominantWaste,
          totalItems: wasteCount,
          severity: dbSeverity,
          labels: labelNames,
          latitude,
          longitude,
          address,
        }),
      });

      if (!saveResponse.ok) {
        return toJsonError(502, "Failed to save waste report");
      }

      savedReport = await saveResponse.json();
    }

    return NextResponse.json({
      detectedObject,
      dominantWaste: classification.dominantWaste,
      totalItems: wasteCount,
      severity: dbSeverity,
      reason: summary,
      has_waste: hasWaste,
      wasteCategory,
      status,
      waste_count: wasteCount,
      count: rawCount,
      decision,
      thresholds,
      model: modelInfo,
      aiModel: providerModel,
      provider: providerSetting === "true" ? "gemini" : "yolo",
      imageUrl: uploadedImageUrl,
      labels,
      all_labels: Array.isArray(yoloData.all_labels) ? yoloData.all_labels : [],
      detections: classification.detections,
      report: savedReport,
    });
  } catch (error: unknown) {
    console.error("[AI] Legacy analysis failed:", error);
    const errMsg =
      error instanceof Error ? error.message : String(error || "Unknown error");
    const isNetworkError =
      errMsg.includes("fetch failed") ||
      errMsg.includes("ECONNREFUSED") ||
      errMsg.includes("ECONNRESET") ||
      errMsg.includes("timeout") ||
      errMsg.includes("socket");

    return toJsonError(
      isNetworkError ? 503 : 500,
      isNetworkError
        ? "Photo detection service is currently unreachable or restarting"
        : `Unexpected error while analyzing image: ${errMsg}`,
      isNetworkError
        ? "The server may be waking up from sleep or restarting after a timeout. Please wait 30 seconds and try again."
        : undefined,
    );
  }
}
