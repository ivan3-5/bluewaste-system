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
    return "A significant accumulation of plastic bottles and containers is scattered across the sandy beach.";
  }

  const formatted = cleanCategories.map((c) => {
    if (c === "plastic bottle") return "plastic bottles";
    if (c === "plastic bag") return "plastic bags";
    if (c === "fishing net") return "fishing nets";
    if (c === "cigarette butt") return "cigarette butts";
    if (c === "can") return "cans";
    if (c === "rope") return "ropes";
    if (c === "glass") return "glass containers";
    if (c === "battery") return "hazardous batteries";
    if (c === "styrofoam") return "styrofoam debris";
    if (c === "diaper") return "sanitary waste";
    return c.endsWith("s") ? c : `${c}s`;
  });

  if (formatted.length === 1) {
    if (formatted[0] === "plastic bottles") {
      return "A significant accumulation of plastic bottles and containers is scattered across the sandy beach.";
    }
    return `A significant accumulation of ${formatted[0]} and scattered debris is present across the area.`;
  }

  if (formatted.length === 2) {
    return `A significant accumulation of ${formatted[0]} and ${formatted[1]} is scattered across the coastal area.`;
  }

  const last = formatted.pop();
  return `A significant accumulation of ${formatted.join(", ")}, and ${last} is scattered across the coastal area.`;
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
  /**
   * Call the Gradio ZeroGPU Space's /call/analyze endpoint.
   *
   * Gradio named-call API (4.x / 5.x):
   *   1. POST /call/analyze  { data: ["data:<mime>;base64,<b64>"] }
   *      → { event_id: "<id>" }
   *   2. GET  /call/analyze/<id>  (SSE stream)
   *      → lines: "event: ...\ndata: ..." until "event: complete"
   *      → complete data line contains the result array JSON
   */
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
    const b64 = imageBuffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${b64}`;

    // ── 2. Resolve the Gradio Space base URL ────────────────────────────────
    const baseUrl = env.YOLO_API_URL
      .replace(/\/(call|api)\/.+$/, "")   // strip any path suffix
      .replace(/\/+$/, "");               // strip trailing slash

    // ── 3. POST to /call/analyze to get event_id ────────────────────────────
    let eventId: string;
    try {
      const submitRes = await fetch(`${baseUrl}/call/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [dataUrl] }),
      });
      if (!submitRes.ok) {
        const errText = await submitRes.text();
        throw new Error(`Gradio submit error ${submitRes.status}: ${errText}`);
      }
      const submitJson = await submitRes.json() as { event_id: string };
      eventId = submitJson.event_id;
      if (!eventId) throw new Error("Gradio returned no event_id");
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error(
        "YOLO Gradio Space is unavailable. Check YOLO_API_URL and Space status.",
      );
    }

    // ── 4. Poll SSE stream until 'complete' event ────────────────────────────
    const sseRes = await fetch(`${baseUrl}/call/analyze/${eventId}`);
    if (!sseRes.ok || !sseRes.body) {
      throw new Error(`Gradio SSE stream error ${sseRes.status}`);
    }

    // Read SSE stream line-by-line (Node.js ReadableStream)
    const reader = sseRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let yoloJson: YoloApiResponse = {};

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";   // keep incomplete last line

      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const rawData = line.slice(5).trim();
          if (eventType === "error") {
            throw new Error(`Gradio inference error: ${rawData}`);
          }
          if (eventType === "complete") {
            // data is a JSON array; first element is our result dict
            const parsed = toSafeJson(rawData) as unknown[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              yoloJson = parsed[0] as YoloApiResponse;
            }
            break outer;
          }
        }
      }
    }

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
            aiReason: spamReason ?? (hasWaste ? formatAnalysisDetails(labels.filter((l: string) => l !== "with_waste" && l !== "no_waste"), analysis.spamReason) : "No visible waste detected."),
            aiModel: report.aiModel ?? "gemini-3.5-flash",
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
