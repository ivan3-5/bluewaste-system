import "server-only";

export interface YoloAnalysis {
  hasWaste: boolean;
  categories: string[];
  severity: "Low" | "Medium" | "High" | "Critical" | "None";
  confidence: number;
  reason: string;
}

/** YOLO detections below this confidence (0–1) are treated as spam. */
export const YOLO_SPAM_CONFIDENCE_THRESHOLD = 0.3;

const LOW_CONFIDENCE_REASON = "Waste detected but confidence is too low.";

/**
 * Forces a raw YOLO payload with waste detected below the spam threshold to
 * the spam shape (has_waste=false, severity=SPAM). Other payloads pass through.
 */
export function applyYoloSpamThreshold<T>(raw: T): T {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const payload = raw as Record<string, unknown>;
  const confidence = typeof payload.confidence === "number"
    ? payload.confidence
    : typeof payload.top_confidence === "number" ? payload.top_confidence : null;
  if (payload.has_waste !== true || confidence === null ||
      !Number.isFinite(confidence) || confidence >= YOLO_SPAM_CONFIDENCE_THRESHOLD) {
    return raw;
  }
  return {
    ...payload,
    has_waste: false,
    severity: "SPAM",
    spam_reason: typeof payload.spam_reason === "string" && payload.spam_reason.trim()
      ? payload.spam_reason
      : LOW_CONFIDENCE_REASON,
  } as T;
}

export function normalizeYoloResult(rawPayload: unknown): YoloAnalysis {
  const raw = applyYoloSpamThreshold(rawPayload);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("YOLO returned an invalid response.");
  }
  const result = raw as Record<string, unknown>;
  if (typeof result.has_waste !== "boolean" ||
      typeof result.confidence !== "number" ||
      !Number.isFinite(result.confidence) ||
      result.confidence < 0 || result.confidence > 1 ||
      !Array.isArray(result.labels)) {
    throw new Error("YOLO response is missing valid detection fields.");
  }
  const severityMap: Record<string, YoloAnalysis["severity"]> = {
    CRITICAL: "Critical", HIGH: "High", MODERATE: "Medium",
    MEDIUM: "Medium", LOW: "Low", SPAM: "None", NONE: "None",
  };
  const severity = typeof result.severity === "string"
    ? severityMap[result.severity.toUpperCase()]
    : undefined;
  if (!severity) throw new Error("YOLO response contains an invalid severity.");

  const categories = result.labels.map((item: unknown) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object" && "label" in item &&
        typeof item.label === "string") return item.label;
    throw new Error("YOLO response contains an invalid label.");
  }).filter((label) => label !== "with_waste" && label !== "no_waste");

  return {
    hasWaste: result.has_waste,
    categories: [...new Set(categories)],
    severity,
    confidence: result.confidence,
    reason: typeof result.spam_reason === "string" && result.spam_reason.trim()
      ? result.spam_reason.trim()
      : typeof result.message === "string" ? result.message.trim() : "",
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
