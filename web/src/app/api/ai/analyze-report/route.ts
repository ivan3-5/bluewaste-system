import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { analyzeImageWithGemini, GeminiError } from "@/lib/ai/gemini";
import { validateGeminiResult } from "@/lib/ai/validator";
import { uploadToCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_GEMINI_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB — compress if over this

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonError(status: number, message: string, details?: string) {
  return NextResponse.json(
    { error: message, message, ...(details ? { details } : {}) },
    { status },
  );
}

/** SHA-256 hex hash of a buffer — used for deduplication */
function hashBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/** Compress image if it exceeds the target size threshold using sharp */
async function compressIfNeeded(
  buffer: Buffer,
  mimeType: string,
): Promise<{ buffer: Buffer; mimeType: "image/jpeg" | "image/png" | "image/webp" }> {
  if (buffer.length <= MAX_GEMINI_SIZE_BYTES) {
    return {
      buffer,
      mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
    };
  }

  try {
    // Dynamic import so we don't break if sharp is not installed in edge
    const sharp = (await import("sharp")).default;
    const compressed = await sharp(buffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    console.info(
      `[AI] Compressed image: ${buffer.length} → ${compressed.length} bytes`,
    );

    return { buffer: compressed, mimeType: "image/jpeg" };
  } catch (err) {
    // If sharp fails, proceed with original buffer (Gemini handles up to ~20MB inline)
    console.warn("[AI] sharp compression failed, using original buffer:", err);
    return {
      buffer,
      mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
    };
  }
}

/**
 * Map Gemini AI severity (Low/Medium/High/Critical/None)
 * to the DB Severity enum (CRITICAL/HIGH/MODERATE/SPAM)
 */
function mapSeverityToDb(
  aiSeverity: string,
  hasWaste: boolean,
): string {
  if (!hasWaste) return "SPAM";
  const map: Record<string, string> = {
    Critical: "CRITICAL",
    High: "HIGH",
    Medium: "MODERATE",
    Low: "MODERATE",
    None: "SPAM",
  };
  return map[aiSeverity] ?? "MODERATE";
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  const totalStart = Date.now();

  try {
    // ── 1. Parse multipart form data ──────────────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonError(400, "Invalid multipart/form-data request.");
    }

    const image = formData.get("image");
    const latitudeRaw = formData.get("latitude");
    const longitudeRaw = formData.get("longitude");
    const citizenId = formData.get("citizenId")?.toString().trim() || null;
    const description = formData.get("description")?.toString().trim() || null;

    // ── 2. Validate image field ───────────────────────────────────────────
    if (!(image instanceof File)) {
      return jsonError(400, "Image file is required.");
    }

    if (!ALLOWED_MIME_TYPES.has(image.type)) {
      return jsonError(
        400,
        "Unsupported image type. Use JPG, PNG, or WEBP.",
      );
    }

    if (image.size > MAX_FILE_SIZE_BYTES) {
      return jsonError(400, "Image must be 10MB or smaller.");
    }

    // ── 3. Validate coordinates ───────────────────────────────────────────
    const latitude = latitudeRaw !== null ? Number(latitudeRaw) : NaN;
    const longitude = longitudeRaw !== null ? Number(longitudeRaw) : NaN;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return jsonError(400, "latitude and longitude must be valid numbers.");
    }

    // ── 4. Read image buffer ──────────────────────────────────────────────
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageHash = hashBuffer(imageBuffer);

    // Log metadata only — never log image bytes
    console.info(
      `[AI] Incoming request — size: ${image.size}B, type: ${image.type}, hash: ${imageHash.slice(0, 12)}…`,
    );

    // ── 5. Deduplication check ────────────────────────────────────────────
    const existingRows = await prisma.$queryRaw<{ id: string; hasWaste: boolean; categories: string[]; severity: string; confidence: number; aiReason: string; aiModel: string; status: string }[]>`
      SELECT
        id,
        "analysisStatus" != 'CLEAN' AS "hasWaste",
        "aiCategories" AS categories,
        severity,
        "analysisConfidence" AS confidence,
        "aiReason",
        "aiModel",
        status
      FROM "Report"
      WHERE "aiImageHash" = ${imageHash}
        AND "isDeleted" = false
      LIMIT 1
    `;

    if (existingRows.length > 0) {
      const cached = existingRows[0];
      console.info(`[AI] Duplicate image detected — returning cached result for report ${cached.id}`);

      return NextResponse.json({
        hasWaste: cached.hasWaste,
        categories: cached.categories ?? [],
        severity: cached.severity ?? "None",
        confidence: Number(cached.confidence ?? 0),
        reason: cached.aiReason ?? "",
        reportId: cached.id,
        status: cached.status,
        cached: true,
        message: cached.hasWaste
          ? undefined
          : "No visible waste was detected in this image. Your report has been marked as Spam.",
      });
    }

    // ── 6. Upload image to Cloudinary ─────────────────────────────────────
    let imageUrl: string;
    let cloudinaryPublicId: string;

    try {
      const uploaded = await uploadToCloudinary(imageBuffer, "bluewaste/ai-reports");
      imageUrl = uploaded.secureUrl;
      cloudinaryPublicId = uploaded.publicId;
    } catch (err) {
      console.error("[AI] Cloudinary upload failed:", err);
      return jsonError(502, "Failed to upload image to storage. Please try again.");
    }

    // ── 7. Compress image for Gemini if needed ────────────────────────────
    const { buffer: geminiBuffer, mimeType: geminiMime } = await compressIfNeeded(
      imageBuffer,
      image.type,
    );

    // ── 8. Call Gemini Vision ─────────────────────────────────────────────
    let geminiResponse;
    try {
      geminiResponse = await analyzeImageWithGemini(geminiBuffer, geminiMime);
    } catch (err) {
      if (err instanceof GeminiError) {
        if (err.code === "RATE_LIMIT") {
          return jsonError(429, "AI analysis rate limit reached. Please try again shortly.");
        }
        if (err.code === "TIMEOUT" || err.code === "UNAVAILABLE") {
          return jsonError(503, "AI analysis service is temporarily unavailable. Please try again in a moment.");
        }
        if (err.code === "INVALID_JSON") {
          // Log the raw invalid output for admin review but do not expose it
          console.error("[AI] Gemini returned invalid JSON — logged for admin review. code:", err.code);
          return jsonError(422, "AI returned an unrecognized response. Please retry your upload.");
        }
      }
      console.error("[AI] Gemini unexpected error:", err);
      return jsonError(500, "Unexpected error during AI analysis.");
    }

    const { result: rawResult, modelName, latencyMs, tokenUsage } = geminiResponse;

    // ── 9. Validate Gemini output ─────────────────────────────────────────
    const validation = validateGeminiResult(rawResult);
    if (!validation.valid) {
      // Do not save a fabricated result — log for admin review
      console.error(
        "[AI] Validation failure — field:",
        validation.error.field,
        "message:",
        validation.error.message,
        "raw:",
        JSON.stringify(rawResult).slice(0, 500),
      );
      return jsonError(
        422,
        "AI response failed schema validation. Please retry your upload.",
        `Field: ${validation.error.field}`,
      );
    }

    const aiResult = validation.data;
    const totalMs = Date.now() - totalStart;

    // ── 10. Logging (server-side only, never exposed to clients) ──────────
    console.info("[AI] Analysis complete", {
      hasWaste: aiResult.hasWaste,
      categories: aiResult.categories,
      severity: aiResult.severity,
      confidence: aiResult.confidence,
      geminiLatencyMs: latencyMs,
      totalMs,
      modelName,
      tokenUsage,
    });

    // ── 11. Persist to DB (backend schema via raw SQL) ────────────────────
    const isSpam = !aiResult.hasWaste;
    const dbSeverity = mapSeverityToDb(aiResult.severity, aiResult.hasWaste);
    const analysisStatus = aiResult.hasWaste ? "DIRTY" : "CLEAN";
    const reportStatus = isSpam ? "REJECTED" : "PENDING";
    const reportId = crypto.randomUUID();
    const locationName = `Waste Report @ ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    await prisma.$executeRaw`
      INSERT INTO "Report" (
        id, title, description, category, status, latitude, longitude, address,
        "isAnonymous", "isDeleted", "isSpam", "spamMarkedAt", "spamReason",
        "analysisStatus", "analysisConfidence",
        "aiCategories", "aiReason", "aiModel", "aiImageHash",
        "aiProcessingMs", "aiGeminiMs",
        "analyzedAt", severity, "reporterId",
        "createdAt", "updatedAt"
      )
      VALUES (
        ${reportId},
        ${locationName},
        ${description ?? "Submitted via AI analysis."},
        ${"with_waste"}::"WasteCategory",
        ${reportStatus}::"ReportStatus",
        ${latitude},
        ${longitude},
        ${locationName},
        false,
        false,
        ${isSpam},
        ${isSpam ? new Date() : null},
        ${isSpam ? "No waste detected by Gemini AI" : null},
        ${analysisStatus}::"AnalysisStatus",
        ${aiResult.confidence},
        ${aiResult.categories},
        ${aiResult.reason},
        ${modelName},
        ${imageHash},
        ${totalMs},
        ${latencyMs},
        NOW(),
        ${dbSeverity}::"Severity",
        ${citizenId},
        NOW(),
        NOW()
      )
    `;

    // Insert image into ReportImage table
    const imageRowId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "ReportImage" (id, "imageUrl", "publicId", type, "createdAt", "reportId")
      VALUES (${imageRowId}, ${imageUrl}, ${cloudinaryPublicId}, 'REPORT'::"ImageType", NOW(), ${reportId})
    `;

    // ── 12. Trigger admin notification ────────────────────────────────────
    if (!isSpam) {
      try {
        // Notify all LGU_ADMIN users
        const admins = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "User" WHERE role = 'LGU_ADMIN'::"Role" AND "isActive" = true LIMIT 20
        `;

        for (const admin of admins) {
          const notifId = crypto.randomUUID();
          await prisma.$executeRaw`
            INSERT INTO "Notification" (id, "userId", title, message, type, "reportId", "isRead", "createdAt")
            VALUES (
              ${notifId},
              ${admin.id},
              ${"New AI-Analyzed Waste Report"},
              ${`A new waste report has been submitted and analyzed by AI. Severity: ${aiResult.severity}. Categories: ${aiResult.categories.join(", ") || "None"}.`},
              'NEW_REPORT'::"NotificationType",
              ${reportId},
              false,
              NOW()
            )
          `;
        }
      } catch (notifErr) {
        // Non-fatal — log but don't fail the request
        console.warn("[AI] Failed to insert admin notifications:", notifErr);
      }
    }

    // ── 13. Return response ───────────────────────────────────────────────
    return NextResponse.json(
      {
        hasWaste: aiResult.hasWaste,
        categories: aiResult.categories,
        severity: aiResult.severity,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
        reportId,
        status: reportStatus,
        imageUrl,
        ...(isSpam && {
          message:
            "No visible waste was detected in this image. Your report has been marked as Spam.",
        }),
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err ?? "Unknown error");
    console.error("[AI] Unhandled error in analyze-report:", msg);
    return jsonError(500, `Unexpected server error: ${msg}`);
  }
}
