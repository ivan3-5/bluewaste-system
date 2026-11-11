import { describe, expect, it, vi, beforeEach } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { ScheduleService, isSameCalendarDay } from "../../src/services/schedule.service";
import { CleanupScheduleStatus, ReportStatus, WasteCategory, Severity } from "@prisma/client";

vi.mock("../../src/services/notification.service", () => ({
  NotificationService: {
    create: vi.fn().mockResolvedValue({}),
    notifyAdmins: vi.fn().mockResolvedValue({}),
  },
}));

describe("Schedule Consolidation Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (arg: any) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      if (typeof arg === "function") {
        return arg(prismaMock);
      }
      return arg;
    });
  });

  const worker1 = { id: "worker-uuid-1", role: "FIELD_WORKER" as const, isActive: true, firstName: "Juan", lastName: "Dela Cruz", email: "juan@example.com", phone: "09123456789" };
  const worker2 = { id: "worker-uuid-2", role: "FIELD_WORKER" as const, isActive: true, firstName: "Maria", lastName: "Santos", email: "maria@example.com", phone: "09987654321" };

  const citizen1 = { id: "citizen-1", firstName: "Pedro", lastName: "Penduko", email: "pedro@example.com" };
  const citizen2 = { id: "citizen-2", firstName: "Ana", lastName: "Reyes", email: "ana@example.com" };

  const report1 = {
    id: "report-uuid-1",
    title: "Plastic bottles along Cagangohan shore",
    description: "Piles of plastic bottles along the beach line",
    category: WasteCategory.with_waste,
    status: ReportStatus.VERIFIED,
    latitude: 7.3012,
    longitude: 125.6845,
    address: "Cagangohan Coastal Area, Panabo",
    reporterId: "citizen-1",
    reporter: citizen1,
    isAnonymous: false,
    isDeleted: false,
    isSpam: false,
    cleanupScheduleId: null,
    cleanupSchedule: null,
    analysisWasteCount: 15,
    severity: Severity.MODERATE,
    images: [{ id: "img-1", imageUrl: "https://example.com/r1.jpg", type: "REPORT" as const, reportId: "report-uuid-1", publicId: "p1", createdAt: new Date() }],
    createdAt: new Date("2026-11-01T10:00:00Z"),
    updatedAt: new Date("2026-11-01T10:00:00Z"),
  };

  const report2 = {
    id: "report-uuid-2",
    title: "Fishing net waste near San Pedro pier",
    description: "Discarded fishing nets tangled with marine debris",
    category: WasteCategory.with_waste,
    status: ReportStatus.VERIFIED,
    latitude: 7.3150,
    longitude: 125.6920,
    address: "San Pedro Pier Shoreline, Panabo",
    reporterId: "citizen-2",
    reporter: citizen2,
    isAnonymous: false,
    isDeleted: false,
    isSpam: false,
    cleanupScheduleId: null,
    cleanupSchedule: null,
    analysisWasteCount: 28,
    severity: Severity.CRITICAL,
    images: [{ id: "img-2", imageUrl: "https://example.com/r2.jpg", type: "REPORT" as const, reportId: "report-uuid-2", publicId: "p2", createdAt: new Date() }],
    createdAt: new Date("2026-11-02T11:00:00Z"),
    updatedAt: new Date("2026-11-02T11:00:00Z"),
  };

  describe("isSameCalendarDay helper", () => {
    it("returns true for same calendar date regardless of slight UTC/local hour difference", () => {
      const d1 = new Date("2027-01-15T08:00:00Z");
      const d2 = new Date("2027-01-15T15:30:00Z");
      expect(isSameCalendarDay(d1, d2)).toBe(true);
    });

    it("returns false for different calendar dates", () => {
      const d1 = new Date("2027-01-15T08:00:00Z");
      const d2 = new Date("2027-01-16T08:00:00Z");
      expect(isSameCalendarDay(d1, d2)).toBe(false);
    });
  });

  describe("1. Multiple Citizens & Reports Scheduling", () => {
    it("groups multiple reports from different citizens into one cleanup schedule", async () => {
      prismaMock.user.findMany.mockResolvedValue([worker1] as never);
      prismaMock.cleanupSchedule.findMany.mockResolvedValue([]); // No existing schedule on this date
      prismaMock.report.findMany.mockResolvedValue([report1, report2] as never);

      const createdSchedule = {
        id: "schedule-uuid-1",
        title: "Panabo Coastal Cleanup",
        description: "Scheduled coastal cleanup operation",
        barangay: "Barangay Cagangohan",
        latitude: 7.3012,
        longitude: 125.6845,
        scheduledAt: new Date("2027-02-20T08:00:00Z"),
        status: CleanupScheduleStatus.UPCOMING,
        equipment: ["Garbage Bags", "Gloves"],
        workers: [{ workerId: worker1.id, worker: worker1, id: "cw-1", scheduleId: "schedule-uuid-1", assignedAt: new Date() }],
        reports: [report1, report2],
        createdBy: { id: "admin-1", firstName: "Admin", lastName: "User", email: "admin@example.com" },
        verifiedBy: null,
      };

      prismaMock.cleanupSchedule.create.mockResolvedValue(createdSchedule as never);
      prismaMock.report.updateMany.mockResolvedValue({ count: 2 });
      prismaMock.statusHistory.createMany.mockResolvedValue({ count: 2 });

      const result = await ScheduleService.create(
        {
          title: "Panabo Coastal Cleanup",
          description: "Scheduled coastal cleanup operation",
          barangay: "Barangay Cagangohan",
          latitude: 7.3012,
          longitude: 125.6845,
          scheduledAt: "2027-02-20T08:00:00Z",
          workerIds: [worker1.id],
          reportIds: [report1.id, report2.id],
          equipment: ["Garbage Bags", "Gloves"],
        },
        "admin-1",
      );

      expect(prismaMock.cleanupSchedule.create).toHaveBeenCalled();
      expect(prismaMock.report.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [report1.id, report2.id] } },
        data: { status: "CLEANUP_SCHEDULED" },
      });
      expect(result.id).toBe("schedule-uuid-1");
      expect(result.reports).toHaveLength(2);
      expect(result.reports[0].reporterId).toBe("citizen-1");
      expect(result.reports[1].reporterId).toBe("citizen-2");
    });
  });

  describe("2. Same-Day Scheduling Consolidation", () => {
    it("appends new reports to existing schedule on the same date instead of creating duplicate schedules", async () => {
      const scheduledDate = new Date("2027-03-10T08:00:00Z");

      const existingSchedule = {
        id: "existing-sched-1",
        title: "Existing Morning Cleanup",
        description: "Initial scheduled cleanup",
        barangay: "Barangay Cagangohan",
        latitude: 7.3012,
        longitude: 125.6845,
        scheduledAt: scheduledDate,
        status: CleanupScheduleStatus.UPCOMING,
        equipment: ["Garbage Bags"],
        workers: [{ workerId: worker1.id, worker: worker1, id: "cw-1", scheduleId: "existing-sched-1", assignedAt: new Date() }],
        reports: [{ id: report1.id }],
      };

      prismaMock.user.findMany.mockResolvedValue([worker2] as never);
      // Return the existing schedule when searching for same-day operations
      prismaMock.cleanupSchedule.findMany.mockResolvedValue([existingSchedule] as never);
      prismaMock.report.findMany.mockResolvedValue([report2] as never);

      prismaMock.cleanupSchedule.update.mockResolvedValue(existingSchedule as never);
      prismaMock.report.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.statusHistory.createMany.mockResolvedValue({ count: 1 });
      prismaMock.cleanupScheduleWorker.createMany.mockResolvedValue({ count: 1 });

      const consolidatedFull = {
        ...existingSchedule,
        workers: [
          { workerId: worker1.id, worker: worker1 },
          { workerId: worker2.id, worker: worker2 },
        ],
        reports: [report1, report2],
        equipment: ["Garbage Bags", "Trash Pickers"],
      };
      prismaMock.cleanupSchedule.findUnique.mockResolvedValue(consolidatedFull as never);

      const result = await ScheduleService.create(
        {
          title: "Afternoon Report Addition",
          description: "Adding second location on the same day",
          barangay: "Barangay Cagangohan",
          latitude: 7.3150,
          longitude: 125.6920,
          scheduledAt: "2027-03-10T14:00:00Z", // Same date!
          workerIds: [worker2.id],
          reportIds: [report2.id],
          equipment: ["Trash Pickers"],
        },
        "admin-1",
      );

      // Verify a new schedule was NOT created
      expect(prismaMock.cleanupSchedule.create).not.toHaveBeenCalled();
      // Verify existing schedule was updated with the consolidated reports and workers
      expect(result.id).toBe("existing-sched-1");
      expect(result.reports).toHaveLength(2);
    });
  });

  describe("3. Duplicate Assignment Prevention", () => {
    it("rejects scheduling if a report is already assigned to a cleanup schedule on another date", async () => {
      prismaMock.user.findMany.mockResolvedValue([worker1] as never);
      prismaMock.cleanupSchedule.findMany.mockResolvedValue([]); // No schedule on target date

      const alreadyScheduledReport = {
        ...report1,
        cleanupScheduleId: "other-sched-uuid",
        cleanupSchedule: {
          id: "other-sched-uuid",
          title: "Other Date Schedule",
          scheduledAt: new Date("2027-04-01T08:00:00Z"), // Different date!
        },
      };

      prismaMock.report.findMany.mockResolvedValue([alreadyScheduledReport] as never);

      await expect(
        ScheduleService.create(
          {
            title: "New Schedule",
            description: "Attempting duplicate schedule",
            barangay: "Barangay Cagangohan",
            latitude: 7.3012,
            longitude: 125.6845,
            scheduledAt: "2027-04-15T08:00:00Z",
            workerIds: [worker1.id],
            reportIds: [report1.id],
          },
          "admin-1",
        ),
      ).rejects.toThrow("already assigned to a cleanup schedule on another date");
    });

    it("rejects scheduling reports that are already marked as CLEANED or REJECTED", async () => {
      prismaMock.user.findMany.mockResolvedValue([worker1] as never);
      prismaMock.cleanupSchedule.findMany.mockResolvedValue([]);

      const cleanedReport = { ...report1, status: ReportStatus.CLEANED };
      prismaMock.report.findMany.mockResolvedValue([cleanedReport] as never);

      await expect(
        ScheduleService.create(
          {
            title: "New Schedule",
            description: "Attempting to schedule cleaned report",
            barangay: "Barangay Cagangohan",
            latitude: 7.3012,
            longitude: 125.6845,
            scheduledAt: "2027-05-10T08:00:00Z",
            workerIds: [worker1.id],
            reportIds: [report1.id],
          },
          "admin-1",
        ),
      ).rejects.toThrow("already completed or rejected");
    });
  });

  describe("4. Status Management & Partial Cleanup Completion", () => {
    it("advances pending reports to IN_PROGRESS when schedule status transitions to ONGOING", async () => {
      const existing = {
        id: "sched-1",
        title: "Coastal Cleanup Alpha",
        status: CleanupScheduleStatus.UPCOMING,
        workers: [{ workerId: worker1.id }],
      };
      prismaMock.cleanupSchedule.findUnique.mockResolvedValue(existing as never);
      prismaMock.cleanupSchedule.update.mockResolvedValue({ ...existing, status: CleanupScheduleStatus.ONGOING } as never);
      prismaMock.report.findMany.mockResolvedValue([{ id: report1.id }, { id: report2.id }] as never);
      prismaMock.report.updateMany.mockResolvedValue({ count: 2 });
      prismaMock.statusHistory.createMany.mockResolvedValue({ count: 2 });

      await ScheduleService.updateStatus("sched-1", "ONGOING", "worker-1");

      expect(prismaMock.report.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [report1.id, report2.id] } },
        data: { status: ReportStatus.IN_PROGRESS },
      });
    });

    it("guards against premature completion when only some locations are cleaned", async () => {
      const existing = {
        id: "sched-1",
        title: "Coastal Cleanup Alpha",
        status: CleanupScheduleStatus.ONGOING,
        workers: [{ workerId: worker1.id }],
      };
      prismaMock.cleanupSchedule.findUnique.mockResolvedValue(existing as never);

      // Report 1 is CLEANED, but Report 2 is still IN_PROGRESS
      prismaMock.report.findMany.mockResolvedValue([
        { id: report1.id, status: ReportStatus.CLEANED, title: report1.title },
        { id: report2.id, status: ReportStatus.IN_PROGRESS, title: report2.title },
      ] as never);

      await expect(
        ScheduleService.updateStatus("sched-1", "COMPLETED", "admin-1"),
      ).rejects.toThrow("not yet cleaned. All associated locations must be cleaned first.");
    });

    it("syncScheduleStatus does not complete schedule if only some reports are cleaned", async () => {
      const schedule = {
        id: "sched-1",
        title: "Coastal Cleanup Alpha",
        status: CleanupScheduleStatus.ONGOING,
        reports: [
          { id: report1.id, status: ReportStatus.CLEANED },
          { id: report2.id, status: ReportStatus.IN_PROGRESS },
        ],
        workers: [{ workerId: worker1.id }],
      };
      prismaMock.cleanupSchedule.findUnique.mockResolvedValue(schedule as never);

      const result = await ScheduleService.syncScheduleStatus("sched-1");
      expect(result?.status).toBe(CleanupScheduleStatus.ONGOING);
      expect(prismaMock.cleanupSchedule.update).not.toHaveBeenCalled();
    });
  });

  describe("5. Completed Cleanup Schedules", () => {
    it("automatically completes the schedule when ALL associated reports are marked CLEANED", async () => {
      const schedule = {
        id: "sched-1",
        title: "Coastal Cleanup Alpha",
        status: CleanupScheduleStatus.ONGOING,
        reports: [
          { id: report1.id, status: ReportStatus.CLEANED },
          { id: report2.id, status: ReportStatus.CLEANED },
        ],
        workers: [{ workerId: worker1.id }],
        notes: null,
        verifiedAt: null,
      };

      prismaMock.cleanupSchedule.findUnique.mockResolvedValue(schedule as never);
      prismaMock.cleanupSchedule.update.mockResolvedValue({
        ...schedule,
        status: CleanupScheduleStatus.COMPLETED,
        verifiedAt: new Date(),
      } as never);

      const result = await ScheduleService.syncScheduleStatus("sched-1", "admin-verifier-id");

      expect(prismaMock.cleanupSchedule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "sched-1" },
          data: expect.objectContaining({
            status: "COMPLETED",
          }),
        }),
      );
      expect(result?.status).toBe(CleanupScheduleStatus.COMPLETED);
    });
  });

  describe("6. Consolidated Cleanup Report Generation", () => {
    it("generates a consolidated report with all required metrics, locations, and citizen counts", async () => {
      const scheduleFull = {
        id: "sched-report-1",
        title: "Panabo Unified Coastal Drive",
        description: "City-wide clean operation",
        barangay: "Barangay Cagangohan",
        scheduledAt: new Date("2027-06-15T08:00:00Z"),
        status: CleanupScheduleStatus.COMPLETED,
        notes: "Area cleared and inspected by CENRO.",
        verifiedAt: new Date("2027-06-15T16:00:00Z"),
        verifiedBy: { id: "admin-1", firstName: "Engr. Oliver", lastName: "Oriol" },
        equipment: ["Garbage Bags", "Trash Pickers", "Gloves"],
        workers: [
          {
            worker: {
              id: worker1.id,
              firstName: worker1.firstName,
              lastName: worker1.lastName,
              email: worker1.email,
              phone: worker1.phone,
            },
          },
        ],
        reports: [
          {
            ...report1,
            status: ReportStatus.CLEANED,
            statusHistory: [],
          },
          {
            ...report2,
            status: ReportStatus.CLEANED,
            statusHistory: [],
          },
        ],
      };

      prismaMock.cleanupSchedule.findUnique.mockResolvedValue(scheduleFull as never);

      const report = await ScheduleService.getConsolidatedReport("sched-report-1");

      expect(report.scheduleId).toBe("sched-report-1");
      expect(report.scheduleTitle).toBe("Panabo Unified Coastal Drive");
      expect(report.overallStatus).toBe("COMPLETED");
      expect(report.summary.totalReports).toBe(2);
      expect(report.summary.totalCitizens).toBe(2); // Two distinct citizens: citizen-1 and citizen-2
      expect(report.summary.cleanedReportsCount).toBe(2);
      expect(report.summary.isFullyCleaned).toBe(true);

      // Check grouped reports
      expect(report.groupedReports).toHaveLength(2);
      expect(report.groupedReports[0].id).toBe(report1.id);
      expect(report.groupedReports[0].address).toBe(report1.address);
      expect(report.groupedReports[0].latitude).toBe(report1.latitude);
      expect(report.groupedReports[0].wasteQuantity).toBe(report1.analysisWasteCount);
      expect(report.groupedReports[0].reporter?.name).toBe("Pedro Penduko");

      expect(report.groupedReports[1].id).toBe(report2.id);
      expect(report.groupedReports[1].reporter?.name).toBe("Ana Reyes");

      // Check assigned workers
      expect(report.assignedWorkers).toHaveLength(1);
      expect(report.assignedWorkers[0].firstName).toBe("Juan");

      // Check completion info
      expect(report.completionInfo.verifiedBy?.name).toBe("Engr. Oliver Oriol");
    });
  });
});
