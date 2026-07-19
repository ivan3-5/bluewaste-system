import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WASTE_DETECTION_PROMPT } from "./prompts";
import type { GeminiWasteResult } from "./validator";

// ── Error types ──────────────────────────────────────────────────────────────

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "TIMEOUT"
      | "UNAVAILABLE"
      | "RATE_LIMIT"
      | "INVALID_JSON"
      | "MODEL_NOT_FOUND"
      | "UNKNOWN",
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export interface GeminiResponse {
  result: GeminiWasteResult;
  modelName: string;
  latencyMs: number;
  tokenUsage?: { promptTokens?: number; candidatesTokens?: number; totalTokens?: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const MAX_RAW_LOG_LENGTH = 500;

/**
 * Removes code block formatting (e.g. ```json ... ```) that generative models
 * occasionally include around raw JSON payloads.
 */
function stripMarkdownFences(raw: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers Gemini may accidentally emit
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

/**
 * Evaluates unknown errors thrown during Gemini API requests and categorizes them
 * into typed error codes (`TIMEOUT`, `UNAVAILABLE`, `RATE_LIMIT`, `MODEL_NOT_FOUND`, `UNKNOWN`),
 * indicating whether exponential backoff retries should apply.
 */
function classifyError(err: unknown): GeminiError {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const lower = msg.toLowerCase();

  if (
    lower.includes("404") ||
    lower.includes("is not found for api version") ||
    lower.includes("is not supported for generatecontent")
  ) {
    console.error(
      "[AI] Gemini model not found — check GEMINI_MODEL is a currently supported model:",
      msg,
    );
    return new GeminiError(
      "Gemini model not found — check GEMINI_MODEL is a currently supported model",
      "MODEL_NOT_FOUND",
      false,
    );
  }
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("quota")) {
    return new GeminiError("Gemini rate limit reached", "RATE_LIMIT", true);
  }
  if (
    lower.includes("timeout") ||
    lower.includes("deadline") ||
    lower.includes("etimedout") ||
    lower.includes("socket")
  ) {
    return new GeminiError("Gemini request timed out", "TIMEOUT", true);
  }
  if (
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("unavailable") ||
    lower.includes("econnrefused") ||
    lower.includes("econnreset")
  ) {
    return new GeminiError("Gemini service unavailable", "UNAVAILABLE", true);
  }

  return new GeminiError(msg || "Unknown Gemini error", "UNKNOWN", false);
}

/**
 * Pauses asynchronous execution for the specified duration in milliseconds.
 */
async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * Call Gemini Vision with the hidden system prompt + an image buffer.
 * Retries transient failures (timeout, 5xx, rate limit) with exponential backoff.
 * Does NOT retry on JSON parse failures (invalid schema) — those are logged for review.
 *
 * Security: the API key is read only here, from process.env.
 * It is never logged, returned, or passed to any client.
 */
export async function analyzeImageWithGemini(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not configured", "UNAVAILABLE", false);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  let lastError: GeminiError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const startMs = Date.now();

    try {
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType,
        },
      };

      const result = await model.generateContent([WASTE_DETECTION_PROMPT, imagePart]);
      const latencyMs = Date.now() - startMs;

      const rawText = result.response.text();

      // Strip any accidental markdown fences
      const cleanedText = stripMarkdownFences(rawText);

      // Parse JSON — throw typed error on failure
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleanedText);
      } catch {
        // JSON parse failures are NOT retried — log raw output for admin review
        console.error("[Gemini] Invalid JSON response (raw):", rawText.slice(0, MAX_RAW_LOG_LENGTH));
        throw new GeminiError(
          "Gemini returned unparseable JSON",
          "INVALID_JSON",
          false, // non-retryable
        );
      }

      // Extract token usage if available
      const usageMeta = result.response.usageMetadata;
      const tokenUsage = usageMeta
        ? {
            promptTokens: usageMeta.promptTokenCount,
            candidatesTokens: usageMeta.candidatesTokenCount,
            totalTokens: usageMeta.totalTokenCount,
          }
        : undefined;

      return {
        result: parsed as GeminiWasteResult,
        modelName: GEMINI_MODEL,
        latencyMs,
        tokenUsage,
      };
    } catch (err: unknown) {
      if (err instanceof GeminiError) {
        lastError = err;
        if (!err.retryable || attempt === MAX_ATTEMPTS) {
          throw err;
        }
      } else {
        const classified = classifyError(err);
        lastError = classified;
        if (!classified.retryable || attempt === MAX_ATTEMPTS) {
          throw classified;
        }
      }

      // Exponential backoff before retry
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[Gemini] Attempt ${attempt} failed (${lastError.code}). Retrying in ${delay}ms…`,
      );
      await sleep(delay);
    }
  }

  throw lastError ?? new GeminiError("All Gemini attempts failed", "UNKNOWN", false);
}
