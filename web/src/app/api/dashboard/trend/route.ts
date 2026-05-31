import { NextRequest } from "next/server";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";
import { getDashboardTrend } from "@/lib/dashboard-reports";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET(request: NextRequest) {
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Math.max(1, Number(daysParam) || 30) : 30;

  const rows = await getDashboardTrend(days);

  return corsResponse(rows);
}
