import prisma from "@/lib/prisma";
import type { GeminiWasteResult } from "@/lib/ai/validator";
import { randomUUID } from "crypto";

export interface CreateAiReportParams {
  latitude: number;
  longitude: number;
  description: string | null;
  citizenId: string | null;
  imageHash: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  aiResult: GeminiWasteResult;
  modelName: string;
  totalMs: number;
  latencyMs: number;
}

export interface CreateAiReportResult {
  reportId: string;
  reportStatus: "PENDING" | "REJECTED";
  isSpam: boolean;
}

/**
 * Maps Gemini AI severity (Low/Medium/High/Critical/None)
 * to the DB Severity enum (CRITICAL/HIGH/MODERATE/SPAM).
 */
function mapSeverityToDb(aiSeverity: string, hasWaste: boolean): string {
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

/**
 * Dispatches notifications to all active LGU_ADMIN users when a new waste report is analyzed.
 * Catches errors cleanly without blocking report creation.
 */
async function notifyLguAdmins(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  reportId: string,
  aiResult: GeminiWasteResult,
): Promise<void> {
  try {
    const admins = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User" WHERE role = 'LGU_ADMIN'::"Role" AND "isActive" = true LIMIT 20
    `;

    for (const admin of admins) {
      const notifId = randomUUID();
      const title = "New AI-Analyzed Waste Report";
      const message = `A new waste report has been submitted and analyzed by AI. Severity: ${aiResult.severity}. Categories: ${aiResult.categories.join(", ") || "None"}.`;

      await tx.$executeRaw`
        INSERT INTO "Notification" (id, "userId", title, message, type, "reportId", "isRead", "createdAt")
        VALUES (
          ${notifId},
          ${admin.id},
          ${title},
          ${message},
          'NEW_REPORT'::"NotificationType",
          ${reportId},
          false,
          NOW()
        )
      `;
    }
  } catch (notifErr) {
    console.warn("[AI] Failed to insert admin notifications inside transaction:", notifErr);
  }
}

/**
 * Persists an AI-analyzed report and its initial report image inside a transaction,
 * and notifies LGU administrators if the report is valid waste.
 */
export async function persistAiReportAndNotify(
  params: CreateAiReportParams,
): Promise<CreateAiReportResult> {
  const isSpam = !params.aiResult.hasWaste;
  const dbSeverity = mapSeverityToDb(params.aiResult.severity, params.aiResult.hasWaste);
  const analysisStatus = params.aiResult.hasWaste ? "DIRTY" : "CLEAN";
  const reportStatus: "PENDING" | "REJECTED" = isSpam ? "REJECTED" : "PENDING";
  const reportId = randomUUID();
  const locationName = `Waste Report @ ${params.latitude.toFixed(5)}, ${params.longitude.toFixed(5)}`;

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
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
        ${params.description ?? "Submitted via AI analysis."},
        ${"with_waste"}::"WasteCategory",
        ${reportStatus}::"ReportStatus",
        ${params.latitude},
        ${params.longitude},
        ${locationName},
        false,
        false,
        ${isSpam},
        ${isSpam ? new Date() : null},
        ${isSpam ? "No waste detected by Gemini AI" : null},
        ${analysisStatus}::"AnalysisStatus",
        ${params.aiResult.confidence},
        ${params.aiResult.categories},
        ${params.aiResult.reason},
        ${params.modelName},
        ${params.imageHash},
        ${params.totalMs},
        ${params.latencyMs},
        NOW(),
        ${dbSeverity}::"Severity",
        ${params.citizenId},
        NOW(),
        NOW()
      )
    `;

    const imageRowId = randomUUID();
    await tx.$executeRaw`
      INSERT INTO "ReportImage" (id, "imageUrl", "publicId", type, "createdAt", "reportId")
      VALUES (${imageRowId}, ${params.imageUrl}, ${params.cloudinaryPublicId}, 'REPORT'::"ImageType", NOW(), ${reportId})
    `;

    if (!isSpam) {
      await notifyLguAdmins(tx, reportId, params.aiResult);
    }
  });

  return {
    reportId,
    reportStatus,
    isSpam,
  };
}
