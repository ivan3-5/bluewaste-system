import { corsEmptyResponse, corsResponse } from "@/lib/cors";
import { getDashboardCategoryDistribution } from "@/lib/dashboard-reports";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET() {
  const rows = await getDashboardCategoryDistribution();
  return corsResponse(rows);
}
