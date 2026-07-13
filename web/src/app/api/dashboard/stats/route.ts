import prisma from "@/lib/prisma";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET() {
  const [
    totalReports,
    withWasteCount,
    noWasteCount,
    pendingCount,
    resolvedCount,
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { category: "with_waste" } }),
    prisma.report.count({ where: { category: "no_waste" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "CLEANED" } }),
  ]);

  return corsResponse({
    totalReports,
    withWasteCount,
    noWasteCount,
    pendingCount,
    resolvedCount,
  });
}
