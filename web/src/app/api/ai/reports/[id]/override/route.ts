import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_SEVERITIES = new Set(["CRITICAL", "HIGH", "MODERATE", "SPAM"]);
const ALLOWED_STATUSES = new Set([
  "PENDING",
  "VERIFIED",
  "CLEANUP_SCHEDULED",
  "IN_PROGRESS",
  "CLEANED",
  "REJECTED",
]);
const ALLOWED_CATEGORIES = new Set([
  "plastic_bottle",
  "plastic_bag",
  "fishing_net",
  "rope",
  "styrofoam",
  "can",
  "glass",
  "battery",
  "diaper",
  "cigarette_butt",
]);

type PageProps = { params: Promise<{ id: string }> };

/**
 * PATCH /api/ai/reports/[id]/override
 * Allows an admin to manually override the AI-assigned severity, categories, and/or status.
 * Body (JSON): { severity?, categories?, status? }
 */
export async function PATCH(request: NextRequest, { params }: PageProps) {
  try {
    const { id } = await params;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { severity, categories, status } = body;

    // Validate severity if provided
    if (severity !== undefined && (typeof severity !== "string" || !ALLOWED_SEVERITIES.has(severity))) {
      return NextResponse.json(
        { error: `Invalid severity. Allowed: ${[...ALLOWED_SEVERITIES].join(", ")}` },
        { status: 400 },
      );
    }

    // Validate categories if provided
    if (categories !== undefined) {
      if (!Array.isArray(categories)) {
        return NextResponse.json({ error: "categories must be an array." }, { status: 400 });
      }
      for (const cat of categories) {
        if (typeof cat !== "string" || !ALLOWED_CATEGORIES.has(cat)) {
          return NextResponse.json(
            { error: `Unknown category: "${cat}"` },
            { status: 400 },
          );
        }
      }
    }

    // Validate status if provided
    if (status !== undefined && (typeof status !== "string" || !ALLOWED_STATUSES.has(status))) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(", ")}` },
        { status: 400 },
      );
    }

    // Build SET clauses dynamically
    const updates: string[] = [];

    if (severity !== undefined) {
      await prisma.$executeRaw`
        UPDATE "Report" SET severity = ${severity}::"Severity" WHERE id = ${id}
      `;
    }

    if (status !== undefined) {
      await prisma.$executeRaw`
        UPDATE "Report" SET status = ${status}::"ReportStatus" WHERE id = ${id}
      `;
    }

    if (categories !== undefined) {
      await prisma.$executeRaw`
        UPDATE "Report" SET "aiCategories" = ${categories} WHERE id = ${id}
      `;
    }

    // Fetch updated row for response
    const rows = await prisma.$queryRaw<{
      id: string;
      severity: string | null;
      status: string;
      aiCategories: string[];
    }[]>`
      SELECT id, severity, status, "aiCategories"
      FROM "Report"
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    console.info(`[AI Override] Admin overrode report ${id}:`, { severity, categories, status });

    return NextResponse.json({
      reportId: id,
      ...rows[0],
      message: "Analysis fields updated successfully.",
    });
  } catch (err) {
    console.error("[AI Override] Error:", err);
    return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
  }
}
