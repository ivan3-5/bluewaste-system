import "server-only";

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
  const url = new URL(configuredUrl);
  const signal = AbortSignal.timeout(120_000);
  let raw: unknown;

  if (url.hostname.endsWith(".hf.space")) {
    const base = `${url.origin}${url.pathname.replace(/\/(?:gradio_api\/)?(?:call\/)?analyze\/?$/, "").replace(/\/+$/, "")}`;
    const endpoint = `${base}/gradio_api/call/analyze`;
    const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const submit = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{ url: imageUrl, orig_name: filename, mime_type: mimeType, meta: { _type: "gradio.FileData" } }] }),
      signal,
    });
    if (!submit.ok) throw new Error(`YOLO submission failed (${submit.status}).`);
    const submitted: unknown = await submit.json();
    if (!submitted || typeof submitted !== "object" || !("event_id" in submitted) ||
        typeof submitted.event_id !== "string" || !submitted.event_id) {
      throw new Error("YOLO did not return an event ID.");
    }
    const stream = await fetch(`${endpoint}/${encodeURIComponent(submitted.event_id)}`, { signal });
    if (!stream.ok) throw new Error(`YOLO inference failed (${stream.status}).`);
    const events = (await stream.text()).split(/\r?\n\r?\n/);
    const completed = events.find((event) => /^event:\s*complete\s*$/m.test(event));
    if (!completed) throw new Error("YOLO inference did not complete successfully.");
    const data = completed.match(/^data:\s*(.+)$/m)?.[1];
    if (!data) throw new Error("YOLO inference returned no result.");
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("YOLO inference returned an invalid result.");
    raw = parsed[0];
  } else {
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
    const response = await fetch(url, { method: "POST", body: form, signal });
    if (!response.ok) throw new Error(`YOLO inference failed (${response.status}).`);
    raw = await response.json();
  }
  return raw;
}
