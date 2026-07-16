import prisma from "../config/database";
import { WasteCategory, AnalysisStatus, Severity } from "@prisma/client";
import { NotificationService } from "./notification.service";
import { env } from "../config/env";

interface YoloLabel {
  label: string;
  confidence?: number;
}

interface YoloApiResponse {
  detail?: string;
  message?: string;
  error?: string;
  severity?: string;
  has_waste?: boolean;
  confidence?: number;
  layer1_passed?: boolean;
  spam_reason?: string;
  labels?: Array<YoloLabel | string>;
}

function toNonNegativeInt(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.trunc(parsed);
    }
  }
  return fallback;
}

function toFiniteNumberOrNull(value: unknown): number | null {
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

function toSafeJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeImageContentType(value: string | null) {
  const normalized = (value || "image/jpeg").split(";")[0].trim().toLowerCase();
  if (normalized === "image/jpg") {
    return "image/jpeg";
  }
  return normalized || "image/jpeg";
}

export class ReportAnalysisService {
  private static async requestYoloAnalysis(imageUrl: string) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch report image for analysis");
    }

    const contentType = normalizeImageContentType(
      imageResponse.headers.get("content-type"),
    );
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const yoloBody = new FormData();
    yoloBody.append(
      "image",
      new Blob([imageBuffer], { type: contentType }),
      "report-image.jpg",
    );

    const targetYoloUrl =
      env.YOLO_API_URL.endsWith("/analyze") ||
      env.YOLO_API_URL.endsWith("/detect") ||
      env.YOLO_API_URL.endsWith("/predict")
        ? env.YOLO_API_URL
        : `${env.YOLO_API_URL.replace(/\/+$/, "")}/analyze`;

    let yoloResponse: Response;
    try {
      yoloResponse = await fetch(targetYoloUrl, {
        method: "POST",
        body: yoloBody,
      });
    } catch {
      throw new Error(
        "YOLO service is unavailable. Start the YOLO API service and verify YOLO_API_URL.",
      );
    }

    const yoloText = await yoloResponse.text();
    const yoloJson = toSafeJson(yoloText) as YoloApiResponse | null ?? {};

    if (!yoloResponse.ok) {
      const message =
        yoloJson?.detail ||
        yoloJson?.message ||
        yoloJson?.error ||
        "YOLO API request failed";
      throw new Error(`YOLO API error: ${message}`);
    }

    // ── Parse /analyze response (hybrid pipeline) ──────────────────────────
    const severity: string | null =
      typeof yoloJson?.severity === "string"
        ? yoloJson.severity
        : null;

    const hasWaste: boolean = yoloJson?.has_waste === true;
    const confidence: number | null = toFiniteNumberOrNull(
      yoloJson?.confidence,
    );
    const layer1Passed: boolean = yoloJson?.layer1_passed !== false;
    const spamReason: string | null =
      typeof yoloJson?.spam_reason === "string"
        ? yoloJson.spam_reason
        : null;

    // Collect waste-matched labels for display
    const rawLabels = Array.isArray(yoloJson?.labels)
      ? yoloJson!.labels
      : [];
    const labels: string[] = rawLabels
      .map((l: YoloLabel | string) =>
        typeof l === "string"
          ? l.trim().toLowerCase()
          : typeof l?.label === "string"
            ? l.label.trim().toLowerCase()
            : "",
      )
      .filter((l: string) => l.length > 0);

    // Determine DIRTY / CLEAN for backward compat with analyzeReport()
    const status: "DIRTY" | "CLEAN" =
      hasWaste && severity !== "SPAM" ? "DIRTY" : "CLEAN";

    return {
      status,
      wasteCount: hasWaste ? 1 : 0,
      count: hasWaste ? 1 : 0,
      confidence,
      labels: hasWaste ? ["with_waste", ...labels] : ["no_waste"],
      detections: [],
      inferenceMs: null,
      annotatedImageUrl: null,
      annotatedImagePublicId: null,
      // New fields from /analyze
      severity,
      layer1Passed,
      spamReason,
    };
  }

  static async analyzeReport(reportId: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { images: { orderBy: { createdAt: "asc" }, take: 1 } },
    });

    if (!report) throw new Error("Report not found");

    const firstImage =
      report.images && report.images.length > 0 ? report.images[0] : null;
    if (!firstImage) return report;

    let analysis;
    try {
      analysis = await this.requestYoloAnalysis(firstImage.imageUrl);
    } catch (error) {
      console.warn("Analysis failed for report", reportId, error);
      return report;
    }

    const labels = Array.isArray(analysis.labels) ? analysis.labels : [];

    // Decide category / spam based on analysis result
    const hasWaste =
      labels.includes("with_waste") ||
      (analysis.wasteCount || 0) > 0 ||
      analysis.status === "DIRTY";

    const newCategory: WasteCategory = hasWaste ? "with_waste" : "no_waste";

    // Resolve severity from the /analyze response or fall back to confidence/status logic
    const rawSeverity = (analysis as YoloApiResponse).severity as string | null | undefined;
    const conf: number = typeof (analysis as YoloApiResponse).confidence === "number" ? (analysis as YoloApiResponse).confidence! : 0;
    let computedSeverity: "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null = null;
    if (rawSeverity) {
      const upper = String(rawSeverity).toUpperCase();
      if (["CRITICAL", "HIGH", "MODERATE", "SPAM"].includes(upper)) {
        computedSeverity = upper as Severity;
      } else if (upper === "MEDIUM" || upper === "LOW") {
        computedSeverity = "MODERATE";
      }
    }
    if (!computedSeverity && hasWaste) {
      if (conf >= 0.9) computedSeverity = "CRITICAL";
      else if (conf >= 0.7) computedSeverity = "HIGH";
      else if (conf >= 0.5) computedSeverity = "MODERATE";
    }
    const resolvedSeverity = (
      computedSeverity ?? report.severity ?? (hasWaste ? "MODERATE" : "SPAM")
    ) as "CRITICAL" | "HIGH" | "MODERATE" | "SPAM";

    const shouldMarkSpam =
      resolvedSeverity === "SPAM" || newCategory === "no_waste";

    const spamReason = shouldMarkSpam
      ? ((analysis as YoloApiResponse).spam_reason as string | null) ??
        "No visible waste or pollution detected in the submitted image."
      : null;

    const now = new Date();

    const updated = await prisma
      .$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: {
            category: newCategory,
            isSpam: shouldMarkSpam,
            spamMarkedAt: shouldMarkSpam ? now : null,
            spamReason,
            analysisStatus:
              analysis.status === "DIRTY"
                ? ("DIRTY" as AnalysisStatus)
                : ("CLEAN" as AnalysisStatus),
            analysisWasteCount: analysis.wasteCount ?? null,
            analysisConfidence: analysis.confidence ?? null,
            analyzedAt: now,
            severity: resolvedSeverity,
          },
        }),
        ...(report.reporterId
          ? [
              prisma.statusHistory.create({
                data: {
                  reportId,
                  previousStatus: report.status,
                  newStatus: report.status,
                  changedById: report.reporterId,
                  notes: `Auto analysis: ${shouldMarkSpam ? "marked as spam" : `severity=${resolvedSeverity}`}`,
                },
              }),
            ]
          : []),
      ])
      .then((r) => r[0]);

    // Notify reporter about auto analysis result
    if (report.reporterId) {
      try {
        await NotificationService.create({
          userId: report.reporterId,
          title: shouldMarkSpam
            ? "Report Marked as Spam"
            : "Report Analysis Completed",
          message: shouldMarkSpam
            ? `Your report "${report.title}" was automatically marked as spam by the system.`
            : `Your report "${report.title}" was analyzed — severity: ${resolvedSeverity}.`,
          type: "SYSTEM",
          reportId,
        });
      } catch (error) {
        console.warn(
          "Failed to notify reporter after analysis",
          reportId,
          error,
        );
      }
    }

    // Invalidate GeoCache dynamically to avoid circular dependency
    try {
      const { GeoCache } = await import("../utils/geo-cache");
      await GeoCache.invalidateAll();
    } catch {}

    return updated;
  }
}
