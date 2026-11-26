import { describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { ReportCrudService } from "../../src/services/report-crud.service";

vi.mock("../../src/services/report-spam.service", () => ({
  ReportSpamService: { purgeExpiredSpamIfDue: vi.fn() },
}));
vi.mock("../../src/services/notification.service", () => ({
  NotificationService: { notifyAdmins: vi.fn() },
}));
vi.mock("../../src/utils/geo-cache", () => ({
  GeoCache: { invalidateAll: vi.fn() },
}));

const zone = {
  coordinates: [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 5 },
    { lat: 5, lng: 5 },
    { lat: 5, lng: 0 },
  ],
};

describe("report creation", () => {
  it.each([
    ["HIGH", 0, "with_waste", "DIRTY", false],
    ["SPAM", 2, "no_waste", "CLEAN", true],
  ] as const)("stores the YOLO grade %s even when the count is %i", async (severity, count, category, analysisStatus, isSpam) => {
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction !== "function") throw new Error("Expected an interactive transaction");
      return transaction(prismaMock);
    });
    prismaMock.reportingZone.findMany.mockResolvedValue([zone] as never);
    prismaMock.report.create.mockResolvedValue({ id: "report-1", reporterId: null } as never);
    await ReportCrudService.create({
      title: "Test", description: "", category: "with_waste", aiModel: "yolo",
      latitude: 1, longitude: 2, address: "Test address",
      severity, analysisWasteCount: count,
    });
    expect(prismaMock.report.create.mock.calls[0][0].data).toMatchObject({
      category, analysisStatus, isSpam, severity, analysisWasteCount: 0,
    });
  });

  it("rejects a new YOLO report without a canonical grade", async () => {
    await expect(ReportCrudService.create({
      title: "Test", description: "", category: "with_waste", aiModel: "yolo",
      latitude: 1, longitude: 2, severity: null, analysisWasteCount: 2,
    })).rejects.toThrow("Invalid YOLO report severity.");
    expect(prismaMock.report.create).not.toHaveBeenCalled();
  });

  it("rejects reports located outside every active zone", async () => {
    prismaMock.reportingZone.findMany.mockResolvedValue([zone] as never);
    await expect(
      ReportCrudService.create({
        title: "Test", description: "Test description", category: "with_waste",
        latitude: 20, longitude: 20,
      }),
    ).rejects.toThrow("Reports can only be submitted within");
    expect(prismaMock.report.create).not.toHaveBeenCalled();
  });

  it("rejects reports when no zones are active", async () => {
    prismaMock.reportingZone.findMany.mockResolvedValue([] as never);
    await expect(
      ReportCrudService.create({
        title: "Test", description: "Test description", category: "with_waste",
        latitude: 1, longitude: 2,
      }),
    ).rejects.toThrow("Reports can only be submitted within");
  });

  it.each([
    [1, null], [3, null], [4, "LOW"], [13, "LOW"], [14, "MODERATE"], [25, "MODERATE"], [26, "HIGH"],
  ])("derives severity from %i detected items and drops confidence", async (count, severity) => {
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction !== "function") throw new Error("Expected an interactive transaction");
      return transaction(prismaMock);
    });
    prismaMock.reportingZone.findMany.mockResolvedValue([zone] as never);
    prismaMock.report.create.mockResolvedValue({ id: "report-1", reporterId: null } as never);
    await ReportCrudService.create({
      title: "Test", description: "", category: "with_waste",
      aiReason: "Waste detected. Severity: Critical.",
      latitude: 1, longitude: 2, address: "Test address",
      analysisWasteCount: count, analysisConfidence: 0.95, severity: "CRITICAL",
    });
    const data = prismaMock.report.create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data).toMatchObject({ severity, analysisWasteCount: count, isSpam: false, description: "" });
    if (severity == null) expect(data.aiReason).toBe("Waste detected. Severity: None.");
    expect(data).not.toHaveProperty("analysisConfidence");
  });
});
