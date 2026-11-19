import { NextRequest } from "next/server";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";
import { getDashboardSeverityDistribution } from "@/lib/dashboard-reports";
import { getDashboardPeriod, isDashboardRange } from "@/lib/dashboard-period";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET(request: NextRequest) {
  const rangeParam = request.nextUrl.searchParams.get("range");
  const period = rangeParam && isDashboardRange(rangeParam) ? getDashboardPeriod(rangeParam) : undefined;

  const rows = await getDashboardSeverityDistribution(period);
  return corsResponse(rows);
}
