import { setTimeout as wait } from "node:timers/promises";

const REQUEST_TIMEOUT_MS = 120_000;

type YoloFailure = "queue-full" | "quota" | "timeout" | "unavailable";

const failures = {
  "queue-full": { status: 503, message: "The photo analysis queue is full. Try this photo again shortly." },
  quota: { status: 429, message: "The photo analysis service has reached its GPU quota. Try again later." },
  timeout: { status: 504, message: "Photo analysis timed out while waiting for the service. Try this photo again." },
  unavailable: { status: 503, message: "The YOLO service could not analyze this photo. Try again shortly." },
};

export class YoloRequestError extends Error {
  readonly status: number;

  constructor(readonly failure: YoloFailure) {
    super(failures[failure].message);
    this.status = failures[failure].status;
  }
}

function failureFromProvider(message: string): YoloRequestError {
  if (/\b(?:gpu quota|gpu time quota|quota exceeded|quota exhausted)\b/i.test(message)) {
    return new YoloRequestError("quota");
  }
  if (/\bqueue (?:is )?full\b/i.test(message)) {
    return new YoloRequestError("queue-full");
  }
  if (/\b(?:timed out|timeout|time limit)\b/i.test(message)) {
    return new YoloRequestError("timeout");
  }
  return new YoloRequestError("unavailable");
}

async function readGradioResult(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new YoloRequestError("unavailable");

  const decoder = new TextDecoder();
  let pending = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += done ? decoder.decode() + "\n\n" : decoder.decode(value, { stream: true });
      const frames = pending.split(/\r?\n\r?\n/);
      pending = frames.pop() ?? "";

      for (const frame of frames) {
        const lines = frame.split(/\r?\n/);
        const event = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
        if (event !== "complete" && event !== "error") continue;
        const data = lines.filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, "")).join("\n");
        if (event === "error") throw failureFromProvider(data);
        const result: unknown = JSON.parse(data);
        if (!Array.isArray(result) || result.length === 0) throw new YoloRequestError("unavailable");
        const payload: unknown = result[0];
        if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
          throw failureFromProvider(payload.error);
        }
        return payload;
      }

      if (done) throw new YoloRequestError("unavailable");
    }
  } finally {
    void reader.cancel().catch(() => {});
  }
}

async function requestGradio(
  url: URL,
  image: { bytes: Buffer; mimeType: string; filename: string },
  token: string | undefined,
  signal: AbortSignal,
): Promise<unknown> {
  const base = `${url.origin}${url.pathname.replace(/\/(?:gradio_api\/)?(?:call\/)?analyze\/?$/, "").replace(/\/+$/, "")}`;
  const endpoint = `${base}/gradio_api/call/analyze`;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const body = JSON.stringify({ data: [{
    url: `data:${image.mimeType};base64,${image.bytes.toString("base64")}`,
    orig_name: image.filename,
    mime_type: image.mimeType,
    meta: { _type: "gradio.FileData" },
  }] });

  let retryDelay = 1_000;
  for (;;) {
    const submission = await fetch(endpoint, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
      signal,
    });
    if (submission.ok) {
      const submitted = await submission.json() as { event_id?: unknown } | null;
      const eventId = submitted?.event_id;
      if (typeof eventId !== "string" || !eventId) throw new YoloRequestError("unavailable");
      const result = await fetch(`${endpoint}/${encodeURIComponent(eventId)}`, { headers, signal });
      if (!result.ok) throw failureFromProvider(await result.text());
      return await readGradioResult(result);
    }

    const error = failureFromProvider(await submission.text());
    // An explicit queue rejection means no inference was started.
    if (error.failure !== "queue-full" || retryDelay > 2_000) throw error;
    await wait(retryDelay, undefined, { signal });
    retryDelay *= 2;
  }
}

export async function requestYolo(
  configuredUrl: string,
  image: { bytes: Buffer; mimeType: string; filename: string },
  token?: string,
): Promise<unknown> {
  const url = new URL(configuredUrl);
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  try {
    if (url.protocol === "https:" && url.hostname.endsWith(".hf.space")) {
      return await requestGradio(url, image, token?.trim(), signal);
    }

    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(image.bytes)], { type: image.mimeType }), image.filename);
    const response = await fetch(url, { method: "POST", body: form, signal });
    if (!response.ok) throw new YoloRequestError("unavailable");
    return await response.json();
  } catch (error) {
    if (signal.aborted) throw new YoloRequestError("timeout");
    if (error instanceof YoloRequestError) throw error;
    throw new YoloRequestError("unavailable");
  }
}
