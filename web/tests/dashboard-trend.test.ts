import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/dashboard/trend/route";
import { getDashboardMonthlyTrend, getDashboardTrend } from "@/lib/dashboard-reports";

vi.mock("@/lib/dashboard-reports", () => ({
  getDashboardMonthlyTrend: vi.fn().mockResolvedValue([]),
  getDashboardTrend: vi.fn().mockResolvedValue([]),
}));

describe("dashboard trend route", () => {
  it.each(["thisYear", "thisMonth", "6months", "12months"])(
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
