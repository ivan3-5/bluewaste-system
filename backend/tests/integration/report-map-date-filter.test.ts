import { describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { ReportCrudService } from "../../src/services/report-crud.service";
import { ReportGeoService } from "../../src/services/report-geo.service";
import { assignedReportFilterSchema, mapFilterSchema } from "../../src/validators/report.validator";

vi.mock("../../src/services/report-spam.service", () => ({
  ReportSpamService: { purgeExpiredSpamIfDue: vi.fn() },
}));
vi.mock("../../src/utils/geo-cache", () => ({
  GeoCache: { get: vi.fn(), set: vi.fn() },
}));

const filters = {
  createdFrom: "2025-12-31T16:00:00.000Z",
  createdBefore: "2026-12-31T16:00:00.000Z",
};
const createdAt = { gte: new Date(filters.createdFrom), lt: new Date(filters.createdBefore) };

describe("report map date filters", () => {
  it("validates bounds for both public and assigned maps", () => {
    for (const schema of [mapFilterSchema, assignedReportFilterSchema]) {
      expect(schema.parse(filters)).toEqual(filters);
      expect(schema.safeParse({ ...filters, createdBefore: filters.createdFrom }).success).toBe(false);
    }
  });

  it("filters raw markers before the fetch limit", async () => {
    prismaMock.report.findMany.mockResolvedValue([]);
    await ReportGeoService.getMapData({ ...filters, limit: "500" });
    expect(prismaMock.report.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isDeleted: false, isSpam: false, createdAt },
      take: 500,
    }));
  });

  it("retains older incidents with in-range reports and returns scoped marker data", async () => {
    const reportDate = new Date("2026-02-04T06:00:00.000Z");
    const visibleReports = { isDeleted: false, isSpam: false, createdAt };
    prismaMock.wasteIncident.findMany.mockResolvedValue([{
      id: "incident-1", createdAt: new Date("2025-01-01T00:00:00Z"),
      contributorCount: 5, _count: { reports: 1 },
      reports: [{ id: "in-range", createdAt: reportDate, images: [] }],
    }] as never);

    const [marker] = await ReportGeoService.getIncidentMapData(filters);
    expect(prismaMock.wasteIncident.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { reports: { some: visibleReports } },
      select: expect.objectContaining({
        _count: { select: { reports: { where: visibleReports } } },
        reports: expect.objectContaining({ where: visibleReports }),
      }),
    }));
    expect(marker).toMatchObject({ contributorCount: 1, reportIds: ["in-range"], createdAt: reportDate });
  });

  it("applies date bounds to the worker's assigned reports and count", async () => {
    prismaMock.report.findMany.mockResolvedValue([]);
    prismaMock.report.count.mockResolvedValue(0);
    await ReportCrudService.getAssignedReports("worker-1", { ...filters, limit: "100" });
    const where = {
      OR: [
        { assignedToId: "worker-1" },
        { assignedWorkers: { some: { workerId: "worker-1" } } },
      ],
      isDeleted: false,
      isSpam: false,
      createdAt,
    };
    expect(prismaMock.report.findMany).toHaveBeenCalledWith(expect.objectContaining({ where, take: 100 }));
    expect(prismaMock.report.count).toHaveBeenCalledWith({ where });
  });
});
