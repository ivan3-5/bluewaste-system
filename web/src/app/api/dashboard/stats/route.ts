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
    prisma.report.count({ where: { isDeleted: false } }),
    prisma.report.count({
      where: {
        isDeleted: false,
        isSpam: false,
        category: "with_waste",
        NOT: { analysisStatus: "CLEAN" },
      },
    }),
    prisma.report.count({
      where: {
        isDeleted: false,
        OR: [
          { isSpam: true },
          { category: "no_waste" },
          { analysisStatus: "CLEAN" },
          { severity: "SPAM" },
        ],
      },
    }),
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
