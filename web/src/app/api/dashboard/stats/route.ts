import prisma from "@/lib/prisma";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET() {
  const baseWhere = {
    isDeleted: false,
    isSpam: false,
  };

  const [
    totalReports,
    withWasteCount,
    noWasteCount,
    pendingCount,
    resolvedCount,
  ] = await Promise.all([
    prisma.report.count({ where: baseWhere }),
    prisma.report.count({ where: { ...baseWhere, category: "with_waste" } }),
    prisma.report.count({ where: { ...baseWhere, category: "no_waste" } }),
    prisma.report.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.report.count({ where: { ...baseWhere, status: "CLEANED" } }),
  ]);

  return corsResponse({
    totalReports,
    withWasteCount,
    noWasteCount,
    pendingCount,
    resolvedCount,
  });
}
