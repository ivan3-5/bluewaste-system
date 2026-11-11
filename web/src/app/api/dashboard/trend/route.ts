import { NextRequest } from "next/server";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";
import {
  getDashboardMonthlyTrend,
  getDashboardTrend,
} from "@/lib/dashboard-reports";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET(request: NextRequest) {
  const rangeParam = request.nextUrl.searchParams.get("range");
  const typeParam = request.nextUrl.searchParams.get("type");

  if (rangeParam || typeParam === "monthly") {
    const range =
      rangeParam === "thisMonth" ||
      rangeParam === "6months" ||
      rangeParam === "12months"
        ? rangeParam
        : "thisYear";

    const rows = await getDashboardMonthlyTrend(range);
    return corsResponse(rows);
  }

  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Math.max(1, Number(daysParam) || 30) : 30;

  const rows = await getDashboardTrend(days);

  return corsResponse(rows);
}
