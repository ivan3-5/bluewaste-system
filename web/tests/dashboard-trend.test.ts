import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/dashboard/trend/route";
import { getDashboardMonthlyTrend, getDashboardTrend } from "@/lib/dashboard-reports";
import { DEFAULT_DASHBOARD_RANGE, getDashboardPeriod } from "@/lib/dashboard-period";

vi.mock("@/lib/dashboard-reports", () => ({
  getDashboardMonthlyTrend: vi.fn().mockResolvedValue([]),
  getDashboardTrend: vi.fn().mockResolvedValue([]),
}));

describe("dashboard trend route", () => {
  it.each(["30days", "thisMonth", "3months", "6months", "lastYear", "thisYear", "12months"])(
    "queries the selected %s range",
    async (range) => {
      const response = await GET(new NextRequest(
        `http://localhost/api/dashboard/trend?range=${range}`,
      ));

      expect(response.status).toBe(200);
      expect(getDashboardMonthlyTrend).toHaveBeenLastCalledWith(range);
    },
  );

  it("preserves the daily trend endpoint for requests with a day count", async () => {
    await GET(new NextRequest("http://localhost/api/dashboard/trend?days=14"));

    expect(getDashboardTrend).toHaveBeenLastCalledWith(14);
  });

  it("routes the trend request to Next.js before the Express catch-all", () => {
    const { routes } = JSON.parse(readFileSync(
      new URL("../../vercel.json", import.meta.url), "utf8",
    )) as { routes: Array<{ src: string; dest: string }> };
    const route = routes.find(({ src }) => new RegExp(src).test("/api/dashboard/trend"));

    expect(route?.dest).toBe("/web/api/dashboard/trend");
  });
});

describe("dashboard date ranges", () => {
  // January 15 in Panabo, although it is still January 14 in UTC.
  const now = new Date("2027-01-14T16:15:00Z");

  it("defaults to an inclusive 30-day window ending today in Panabo", () => {
    expect(DEFAULT_DASHBOARD_RANGE).toBe("30days");
    expect(getDashboardPeriod(DEFAULT_DASHBOARD_RANGE, now)).toEqual({
      startDate: "2026-12-17", endDate: "2027-01-16", bucket: "day",
    });
  });

  it("uses calendar boundaries across month and year transitions", () => {
    expect(getDashboardPeriod("thisMonth", now)).toEqual({
      startDate: "2027-01-01", endDate: "2027-01-16", bucket: "day",
    });
    expect(getDashboardPeriod("3months", now)).toEqual({
      startDate: "2026-11-01", endDate: "2027-01-16", bucket: "month",
    });
    expect(getDashboardPeriod("6months", now)).toEqual({
      startDate: "2026-08-01", endDate: "2027-01-16", bucket: "month",
    });
    expect(getDashboardPeriod("lastYear", now)).toEqual({
      startDate: "2026-01-01", endDate: "2027-01-01", bucket: "month",
    });
    expect(getDashboardPeriod("thisYear", now)).toEqual({
      startDate: "2027-01-01", endDate: "2027-01-16", bucket: "month",
    });
  });
});
