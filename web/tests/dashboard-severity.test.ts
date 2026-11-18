import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getDashboardSeverityDistribution } from "@/lib/dashboard-reports";
import { GET } from "@/app/api/dashboard/severity/route";
import { getDashboardPeriod } from "@/lib/dashboard-period";

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe("getDashboardSeverityDistribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns low, medium, and high counts with accurate percentages", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { severity: "LOW", label: "Low", count: 6n },
      { severity: "MEDIUM", label: "Medium", count: 3n },
      { severity: "HIGH", label: "High", count: 2n },
    ]);

    const result = await getDashboardSeverityDistribution();

    expect(result).toEqual([
      { key: "low", label: "Low", count: 6, percentage: 54.5 },
      { key: "medium", label: "Medium", count: 3, percentage: 27.3 },
      { key: "high", label: "High", count: 2, percentage: 18.2 },
    ]);
  });

  it("handles zero total reports safely without NaN percentages", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { severity: "LOW", label: "Low", count: 0n },
      { severity: "MEDIUM", label: "Medium", count: 0n },
      { severity: "HIGH", label: "High", count: 0n },
    ]);

    const result = await getDashboardSeverityDistribution();

    expect(result).toEqual([
      { key: "low", label: "Low", count: 0, percentage: 0 },
      { key: "medium", label: "Medium", count: 0, percentage: 0 },
      { key: "high", label: "High", count: 0, percentage: 0 },
    ]);
  });

  it("queries with date boundaries when period is supplied", async () => {
    const period = getDashboardPeriod("30days");
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { severity: "LOW", label: "Low", count: 10n },
      { severity: "MEDIUM", label: "Medium", count: 5n },
      { severity: "HIGH", label: "High", count: 5n },
    ]);

    const result = await getDashboardSeverityDistribution(period);

    expect(result).toHaveLength(3);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result[0]).toEqual({ key: "low", label: "Low", count: 10, percentage: 50 });
  });
});

describe("GET /api/dashboard/severity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns severity distribution for default and range queries", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { severity: "LOW", label: "Low", count: 4n },
      { severity: "MEDIUM", label: "Medium", count: 4n },
      { severity: "HIGH", label: "High", count: 2n },
    ]);

    const request = new NextRequest("http://localhost/api/dashboard/severity?range=30days");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([
      { key: "low", label: "Low", count: 4, percentage: 40 },
      { key: "medium", label: "Medium", count: 4, percentage: 40 },
      { key: "high", label: "High", count: 2, percentage: 20 },
    ]);
  });

  it("routes /api/dashboard/severity in vercel.json", () => {
    const { routes } = JSON.parse(
      readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
    ) as { routes: Array<{ src: string; dest: string }> };

    const route = routes.find(({ src }) => new RegExp(src).test("/api/dashboard/severity"));
    expect(route?.dest).toBe("/web/api/dashboard/severity");
  });
});
