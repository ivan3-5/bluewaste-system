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

describe("report severity from waste count", () => {
  it.each([
    [1, "MODERATE"], [3, "HIGH"], [7, "CRITICAL"],
  ])("derives severity from %i detected items and drops confidence", async (count, severity) => {
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction !== "function") throw new Error("Expected an interactive transaction");
      return transaction(prismaMock);
    });
    prismaMock.report.create.mockResolvedValue({ id: "report-1", reporterId: null } as never);
    await ReportCrudService.create({
      title: "Test", description: "Test description", category: "with_waste",
      latitude: 1, longitude: 2, address: "Test address",
      analysisWasteCount: count, analysisConfidence: 0.95, severity: "CRITICAL",
    });
    const data = prismaMock.report.create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data).toMatchObject({ severity, analysisWasteCount: count });
    expect(data).not.toHaveProperty("analysisConfidence");
  });
});
