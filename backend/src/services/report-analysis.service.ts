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

function formatAnalysisDetails(categories: string[] = [], defaultReason?: string | null): string {
  if (
    defaultReason &&
    typeof defaultReason === "string" &&
    defaultReason.trim().length > 0 &&
    !defaultReason.toLowerCase().includes("ready to submit") &&
    !defaultReason.toLowerCase().includes("waste detected (")
  ) {
    return defaultReason.trim();
  }

  const cleanCategories = categories
    .filter((cat) => typeof cat === "string" && cat !== "with_waste" && cat !== "no_waste")
    .map((cat) => cat.toLowerCase().replace(/_/g, " "));

  if (cleanCategories.length === 0) {
    return "No additional analysis details are available.";
  }
  return `Detected categories: ${cleanCategories.join(", ")}.`;
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

function toSafeJson(text: string): unknown {
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
  private static async requestGeminiAnalysis(imageUrl: string, latitude: number, longitude: number) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("Failed to fetch report image for analysis");
    const contentType = normalizeImageContentType(imageResponse.headers.get("content-type"));
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(imageBuffer)], { type: contentType }), "image");
    form.append("latitude", String(latitude));
    form.append("longitude", String(longitude));
    const endpoint = new URL("/api/ai/analyze-report", env.WEB_URL);
    const response = await fetch(endpoint, { method: "POST", body: form, signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`Web analysis service failed (${response.status})`);
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Web analysis returned an invalid response");
    const data = result as Record<string, unknown>;
    if (data.provider !== "gemini") throw new Error("Web analysis is not configured to use Gemini");
    if (typeof data.hasWaste !== "boolean" ||
        typeof data.confidence !== "number" || !Number.isFinite(data.confidence) ||
        data.confidence < 0 || data.confidence > 1 ||
        typeof data.severity !== "string" ||
        !["LOW", "MEDIUM", "HIGH", "CRITICAL", "NONE"].includes(data.severity.toUpperCase()) ||
        !Array.isArray(data.categories) || !data.categories.every((category) => typeof category === "string") ||
        typeof data.reason !== "string" || typeof data.model !== "string" || !data.model.trim()) {
      throw new Error("Web analysis returned invalid Gemini fields");
    }
    return {
      status: data.hasWaste ? "DIRTY" as const : "CLEAN" as const,
      wasteCount: data.hasWaste ? 1 : 0,
      confidence: data.confidence,
      labels: data.hasWaste ? ["with_waste", ...data.categories] : ["no_waste"],
      severity: data.severity,
      spamReason: data.hasWaste ? null : data.reason,
      reason: data.reason,
      model: data.model,
    };
  }

  private static async requestYoloAnalysis(imageUrl: string) {
    // ── 1. Fetch the image ──────────────────────────────────────────────────
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch report image for analysis");
    }
    const contentType = normalizeImageContentType(
      imageResponse.headers.get("content-type"),
    );
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const url = new URL(env.YOLO_API_URL);
    const signal = AbortSignal.timeout(120_000);
    let raw: unknown;
    if (url.hostname.endsWith(".hf.space")) {
      const base = `${url.origin}${url.pathname.replace(/\/(?:gradio_api\/)?(?:call\/)?analyze\/?$/, "").replace(/\/+$/, "")}`;
      const endpoint = `${base}/gradio_api/call/analyze`;
      const dataUrl = `data:${contentType};base64,${imageBuffer.toString("base64")}`;
      const submitRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [{ url: dataUrl, mime_type: contentType, meta: { _type: "gradio.FileData" } }] }),
        signal,
      });
      if (!submitRes.ok) {
        throw new Error(`Gradio submit error ${submitRes.status}`);
      }
      const submitJson = await submitRes.json() as { event_id?: unknown };
      if (typeof submitJson.event_id !== "string" || !submitJson.event_id) throw new Error("Gradio returned no event_id");
      const sseRes = await fetch(`${endpoint}/${encodeURIComponent(submitJson.event_id)}`, { signal });
      if (!sseRes.ok) throw new Error(`Gradio SSE stream error ${sseRes.status}`);
      const completed = (await sseRes.text()).split(/\r?\n\r?\n/)
        .find((event) => /^event:\s*complete\s*$/m.test(event));
      const data = completed?.match(/^data:\s*(.+)$/m)?.[1];
      const parsed = data ? toSafeJson(data) : null;
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Gradio inference did not complete successfully");
      raw = parsed[0];
    } else {
      const form = new FormData();
      form.append("image", new Blob([new Uint8Array(imageBuffer)], { type: contentType }), "image");
      const response = await fetch(url, { method: "POST", body: form, signal });
      if (!response.ok) throw new Error(`YOLO inference failed (${response.status})`);
      raw = await response.json();
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw) ||
        typeof (raw as YoloApiResponse).has_waste !== "boolean") {
      throw new Error("YOLO returned an invalid response");
    }
    const yoloJson = raw as YoloApiResponse;

    // ── 5. Parse response (same shape as original /analyze) ─────────────────
    const severity: string | null =
      typeof yoloJson?.severity === "string" ? yoloJson.severity : null;

    const hasWaste: boolean = yoloJson?.has_waste === true;
    const confidence: number | null = toFiniteNumberOrNull(yoloJson?.confidence);
    const layer1Passed: boolean = yoloJson?.layer1_passed !== false;
    const spamReason: string | null =
      typeof yoloJson?.spam_reason === "string" ? yoloJson.spam_reason : null;

    const rawLabels = Array.isArray(yoloJson?.labels) ? yoloJson!.labels : [];
    const labels: string[] = rawLabels
      .map((l: YoloLabel | string) =>
        typeof l === "string"
          ? l.trim().toLowerCase()
          : typeof l?.label === "string"
            ? l.label.trim().toLowerCase()
            : "",
      )
      .filter((l: string) => l.length > 0);

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
      severity,
      layer1Passed,
      spamReason,
      reason: typeof yoloJson.message === "string" ? yoloJson.message : null,
      model: "yolo",
    };
  }


  static async analyzeReport(reportId: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { images: { orderBy: { createdAt: "asc" }, take: 1 } },
    });

    if (!report) throw new Error("Report not found");

    // If report has already been analyzed (e.g., analyzed on client during submission), skip redundant re-analysis
    if (report.analyzedAt != null && report.severity != null) {
      return report;
    }

    const firstImage =
      report.images && report.images.length > 0 ? report.images[0] : null;
    if (!firstImage) return report;

    let analysis;
    try {
      analysis = env.USE_GEMINI
        ? await this.requestGeminiAnalysis(firstImage.imageUrl, report.latitude, report.longitude)
        : await this.requestYoloAnalysis(firstImage.imageUrl);
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
    const rawSeverity = analysis.severity;
    const conf: number = typeof analysis.confidence === "number" ? analysis.confidence : 0;
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
      ? analysis.spamReason ??
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
            aiCategories: labels.filter((l: string) => l !== "with_waste" && l !== "no_waste"),
            aiReason: spamReason ?? (hasWaste ? formatAnalysisDetails(labels.filter((l: string) => l !== "with_waste" && l !== "no_waste"), analysis.reason) : "No visible waste detected."),
            aiModel: analysis.model,
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
