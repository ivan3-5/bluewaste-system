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

function toNumberOrUndefined(
  value: FormDataEntryValue | null,
): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

function normalizeBaseApiUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
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

function safeParseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toNonNegativeInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.trunc(parsed);
    }
  }

  return null;
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

function normalizeDecision(payload: any): AnalyzeDecision {
  const decision = payload?.decision ?? {};
  const isUncertain = toBooleanOrNull(decision?.is_uncertain) ?? false;
  const retakeRecommended =
    toBooleanOrNull(decision?.retake_recommended) ?? isUncertain;

  const reason =
    typeof decision?.reason === "string" && decision.reason.trim().length > 0
      ? decision.reason.trim()
      : null;

  const message =
    typeof decision?.message === "string" && decision.message.trim().length > 0
      ? decision.message.trim()
      : null;

  const captureTips = Array.isArray(decision?.capture_tips)
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

    if (!yoloResponse.ok) {
      if (yoloResponse.status === 502 || yoloResponse.status === 503 || yoloResponse.status === 504) {
        return toJsonError(
          503,
          "AI detection service is currently unreachable or restarting",
          "The Render free-tier server may be waking up from sleep or recovering from a timeout. Please wait 30 seconds and try again.",
        );
      }

      const yoloMessage =
        (yoloJson as any)?.message ||
        (yoloJson as any)?.error ||
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
      toNonNegativeInt((yoloJson as any)?.count) ??
      classification.detections.length;
    const wasteCount =
      toNonNegativeInt((yoloJson as any)?.waste_count) ??
      classification.detections.length;
    const topConfidence = toFiniteNumber((yoloJson as any)?.top_confidence);

    // has_waste is the authoritative field from the /analyze hybrid pipeline.
    // The /analyze endpoint returns has_waste but NOT a status field, so we
    // must use has_waste first before falling back to wasteCount.
    const rawHasWaste = (yoloJson as any)?.has_waste;
    const hasWaste: boolean =
      typeof rawHasWaste === "boolean"
        ? rawHasWaste
        : normalizeDecisionStatus((yoloJson as any)?.status) === "DIRTY" ||
          wasteCount > 0;

    const status: DecisionStatus = hasWaste ? "DIRTY" : "CLEAN";
    const decision = normalizeDecision(yoloJson);
    const thresholds =
      yoloJson && typeof (yoloJson as any)?.thresholds === "object"
        ? (yoloJson as any).thresholds
        : null;
    const modelInfo =
      yoloJson && typeof (yoloJson as any)?.model === "object"
        ? (yoloJson as any).model
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
      severity: typeof (yoloJson as any)?.severity === "string" ? (yoloJson as any).severity : classification.severity,
      has_waste: hasWaste,
      wasteCategory: classification.wasteCategory,
      confidence: typeof (yoloJson as any)?.confidence === "number" ? (yoloJson as any).confidence : classification.confidence,
      status,
      waste_count: wasteCount,
      count: rawCount,
      top_confidence: topConfidence,
      decision,
      thresholds,
      model: modelInfo,
      imageUrl: uploadedImageUrl,
      labels: Array.isArray((yoloJson as any)?.labels) ? (yoloJson as any).labels : classification.labels,
      all_labels: Array.isArray((yoloJson as any)?.all_labels) ? (yoloJson as any).all_labels : [],
      detections: classification.detections,
      report: savedReport,
    });
  } catch (error: any) {
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
