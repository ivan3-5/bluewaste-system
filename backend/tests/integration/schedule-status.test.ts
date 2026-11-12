import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { ScheduleService } from "../../src/services/schedule.service";

vi.mock("../../src/services/notification.service", () => ({
  NotificationService: { create: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => {
  prismaMock.$transaction.mockImplementation(async (transaction) => {
    if (typeof transaction !== "function") throw new Error("Expected an interactive transaction");
    return transaction(prismaMock);
  });
});

describe("mobile cleanup schedule updates", () => {
  it("returns the updated linked tasks after starting a schedule", async () => {
    prismaMock.cleanupSchedule.findUnique.mockResolvedValue({
      id: "schedule", title: "Beach cleanup", status: "UPCOMING", workers: [{ workerId: "worker" }],
    } as never);
    prismaMock.report.updateManyAndReturn.mockResolvedValue([{ id: "report" }] as never);
    const result = { status: "ONGOING", reports: [{ status: "IN_PROGRESS" }] };
    prismaMock.cleanupSchedule.update.mockResolvedValue(result as never);

    await expect(ScheduleService.updateStatus("schedule", "ONGOING", "worker", undefined, true))
      .resolves.toEqual(result);
    expect(prismaMock.report.updateManyAndReturn).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "IN_PROGRESS" } }));
    expect(prismaMock.report.updateManyAndReturn.mock.invocationCallOrder[0])
      .toBeLessThan(prismaMock.cleanupSchedule.update.mock.invocationCallOrder[0]);
  });

  it("keeps a schedule open while a linked task still needs cleaning", async () => {
    prismaMock.cleanupSchedule.findUnique.mockResolvedValue({
      status: "ONGOING", workers: [{ workerId: "worker" }],
    } as never);
    prismaMock.report.findMany.mockResolvedValue([{ status: "IN_PROGRESS" }] as never);

    await expect(ScheduleService.updateStatus("schedule", "COMPLETED", "worker", undefined, true))
      .rejects.toThrow("1 of 1 report location(s) are not yet cleaned");
    expect(prismaMock.cleanupSchedule.update).not.toHaveBeenCalled();
  });

  it("rejects status changes from a worker outside the schedule", async () => {
    prismaMock.cleanupSchedule.findUnique.mockResolvedValue({
      status: "UPCOMING", workers: [{ workerId: "other-worker" }],
    } as never);

    await expect(ScheduleService.updateStatus("schedule", "ONGOING", "worker", undefined, true))
      .rejects.toThrow("Insufficient permissions.");
    expect(prismaMock.cleanupSchedule.update).not.toHaveBeenCalled();
  });
});
