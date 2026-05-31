import { NextRequest } from "next/server";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";
import {
  getDashboardReportById,
  updateDashboardReportStatus,
} from "@/lib/dashboard-reports";

const VALID_STATUSES = new Set([
  "PENDING",
  "VERIFIED",
  "CLEANUP_SCHEDULED",
  "IN_PROGRESS",
  "CLEANED",
  "REJECTED",
]);

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const report = await getDashboardReportById(id);

  if (!report) {
    return corsResponse({ message: "Report not found." }, { status: 404 });
  }

  return corsResponse(report);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status =
      typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";

    if (!VALID_STATUSES.has(status)) {
      return corsResponse(
        { message: "A valid status is required." },
        { status: 400 },
      );
    }

    await updateDashboardReportStatus(id, status);
    const report = await getDashboardReportById(id);

    return corsResponse(report);
  } catch (error) {
    const err = error as any;
    console.error("Failed to update report:", err);

    return corsResponse(
      { message: "Failed to update report." },
      { status: 500 },
    );
  }
}
