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

describe("report confidence persistence", () => {
  it("persists an explicit zero rather than discarding it", async () => {
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction !== "function") throw new Error("Expected an interactive transaction");
      return transaction(prismaMock);
    });
    prismaMock.report.create.mockResolvedValue({ id: "report-1", reporterId: null } as never);
    await ReportCrudService.create({
      title: "Test", description: "Test description", category: "no_waste",
      latitude: 1, longitude: 2, address: "Test address",
      analysisConfidence: 0, yoloConfidence: 80, severity: "SPAM",
    });
    expect(prismaMock.report.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ analysisConfidence: 0 }),
    }));
  });
});
