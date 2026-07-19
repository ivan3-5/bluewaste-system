import { NextRequest, NextResponse } from "next/server";
import { classifyYoloPayload } from "@/lib/waste-classification";

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
  top_confidence?: unknown;
  has_waste?: unknown;
  status?: unknown;
  decision?: unknown;
  thresholds?: unknown;
  model?: unknown;
  severity?: unknown;
  confidence?: unknown;
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

function safeParseJson(text: string): YoloApiResponse | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as YoloApiResponse)
      : null;
  } catch {
    return null;
  }
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
    const rawYoloUrl =
      process.env.YOLO_API_URL || "https://bluewaste-system.onrender.com/analyze";
    const yoloApiUrl =
      rawYoloUrl.endsWith("/analyze") ||
      rawYoloUrl.endsWith("/detect") ||
      rawYoloUrl.endsWith("/predict")
        ? rawYoloUrl
        : `${rawYoloUrl.replace(/\/+$/, "")}/analyze`;
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

    const yoloBody = new FormData();
    yoloBody.append(
      "image",
      new Blob([imageBuffer], { type: image.type }),
      image.name,
    );

    const yoloResponse = await fetch(yoloApiUrl, {
      method: "POST",
      body: yoloBody,
    });

    const yoloText = await yoloResponse.text();
    const yoloJson = safeParseJson(yoloText);
    const yoloData: YoloApiResponse = yoloJson ?? {};

    if (!yoloResponse.ok) {
      if (yoloResponse.status === 502 || yoloResponse.status === 503 || yoloResponse.status === 504) {
        return toJsonError(
          503,
          "AI detection service is currently unreachable or restarting",
          "The Render free-tier server may be waking up from sleep or recovering from a timeout. Please wait 30 seconds and try again.",
        );
      }

      const yoloMessage =
        yoloData.message ||
        yoloData.error ||
        (typeof yoloText === "string" && yoloText.length > 0 && !yoloText.includes("<html")
          ? yoloText
          : "Unknown YOLO API error");

      return toJsonError(
        502,
        `YOLO API request failed: ${yoloMessage}`,
        "Check if the YOLO service is reachable and CORS is configured.",
      );
    }

    const classification = classifyYoloPayload(yoloJson);
    const rawCount =
      toNonNegativeInt(yoloData.count) ??
      classification.detections.length;
    const wasteCount =
      toNonNegativeInt(yoloData.waste_count) ??
      classification.detections.length;
    const topConfidence = toFiniteNumber(yoloData.top_confidence);

    // has_waste is the authoritative field from the /analyze hybrid pipeline.
    // The /analyze endpoint returns has_waste but NOT a status field, so we
    // must use has_waste first before falling back to wasteCount.
    const rawHasWaste = yoloData.has_waste;
    const hasWaste: boolean =
      typeof rawHasWaste === "boolean"
        ? rawHasWaste
        : normalizeDecisionStatus(yoloData.status) === "DIRTY" ||
          wasteCount > 0;

    const status: DecisionStatus = hasWaste ? "DIRTY" : "CLEAN";
    const decision = normalizeDecision(yoloJson);
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
          detectedObject: classification.detectedObject,
          detections: classification.wasteDetections,
          dominantWaste: classification.dominantWaste,
          totalItems: classification.totalItems,
          severity: classification.severity,
          labels: classification.labels,
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
      detectedObject: classification.detectedObject,
      dominantWaste: classification.dominantWaste,
      totalItems: classification.totalItems,
      severity: typeof yoloData.severity === "string" ? yoloData.severity : classification.severity,
      has_waste: hasWaste,
      wasteCategory: classification.wasteCategory,
      confidence: typeof yoloData.confidence === "number" ? yoloData.confidence : classification.confidence,
      status,
      waste_count: wasteCount,
      count: rawCount,
      top_confidence: topConfidence,
      decision,
      thresholds,
      model: modelInfo,
      imageUrl: uploadedImageUrl,
      labels: Array.isArray(yoloData.labels) ? yoloData.labels : classification.labels,
      all_labels: Array.isArray(yoloData.all_labels) ? yoloData.all_labels : [],
      detections: classification.detections,
      report: savedReport,
    });
  } catch (error: unknown) {
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
        ? "AI detection service is currently unreachable or restarting"
        : `Unexpected error while analyzing image: ${errMsg}`,
      isNetworkError
        ? "The Render free-tier server may be waking up from sleep or restarting after a timeout. Please wait 30 seconds and try again."
        : undefined,
    );
  }
}
