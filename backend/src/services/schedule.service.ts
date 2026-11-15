import prisma from "../config/database";
import {
  CleanupScheduleStatus,
  NotificationType,
  Prisma,
  ReportStatus,
} from "@prisma/client";
import {
  getPaginationParams,
  buildPaginatedResponse,
} from "../utils/pagination";
import { NotificationService } from "./notification.service";
import { logger } from "../utils/logger";

const scheduleInclude = {
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  verifiedBy: {
    select: { id: true, firstName: true, lastName: true },
  },
  reports: {
    include: {
      images: true,
    },
  },
  workers: {
    include: {
      worker: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { assignedAt: "asc" as const },
  },
} satisfies Prisma.CleanupScheduleInclude;

function assertVerifiedForScheduling(reports: { title: string; status: ReportStatus }[]) {
  const terminal = reports.filter(({ status }) => status === "CLEANED" || status === "REJECTED");
  if (terminal.length > 0) {
    const titles = terminal.map(({ title, status }) => `"${title}" (${status})`).join(", ");
    throw new Error(`Cannot schedule report(s) that are already completed or rejected: ${titles}`);
  }

  const unverified = reports.filter(({ status }) => status !== "VERIFIED");
  if (unverified.length > 0) {
    const titles = unverified.map(({ title }) => `"${title}"`).join(", ");
    throw new Error(`Only verified reports can be scheduled. Review: ${titles}.`);
  }
}

const scheduleDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return scheduleDateFormatter.format(d1) === scheduleDateFormatter.format(d2);
}

export class ScheduleService {
  static async create(
    data: {
      title: string;
      description: string;
      barangay: string;
      latitude: number;
      longitude: number;
      scheduledAt: string;
      workerIds: string[];
      reportIds?: string[];
      equipment?: string[];
    },
    adminId: string,
  ) {
    // Verify all worker IDs are valid FIELD_WORKERs
    const workers = await prisma.user.findMany({
      where: {
        id: { in: data.workerIds },
        role: "FIELD_WORKER",
        isActive: true,
      },
      select: { id: true },
    });

    if (workers.length !== data.workerIds.length) {
      throw new Error("One or more worker IDs are invalid");
    }

    const scheduledAt = new Date(data.scheduledAt);
    if (!Number.isFinite(scheduledAt.getTime())) throw new Error("Cannot create schedule: Invalid deployment date and time");
    const scheduleDay = scheduleDateFormatter.format(scheduledAt);
    if (scheduleDay < scheduleDateFormatter.format(new Date())) {
      throw new Error("Cannot create schedule for a past date");
    }
    const dayStart = new Date(`${scheduleDay}T00:00:00+08:00`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const reportIds = [...new Set(data.reportIds ?? [])];

    const { schedule, newWorkerIds, crewToNotify, consolidated } = await prisma.$transaction(async (tx) => {
      // Serialize same-day consolidation and protect linked reports from concurrent assignments.
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`cleanup-schedule:${scheduleDay}`}), 0)`;
      await tx.$queryRaw`
        SELECT id FROM "CleanupSchedule"
        WHERE "scheduledAt" >= ${dayStart} AND "scheduledAt" < ${dayEnd}
          AND status IN ('UPCOMING', 'ONGOING')
        ORDER BY id FOR UPDATE
      `;
      const candidates = await tx.cleanupSchedule.findMany({
        where: {
          scheduledAt: { gte: dayStart, lt: dayEnd },
          status: { in: [CleanupScheduleStatus.UPCOMING, CleanupScheduleStatus.ONGOING] },
        },
        include: { workers: { orderBy: { assignedAt: "asc" }, select: { workerId: true } } },
        orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
        take: 1,
      });
      const existing = candidates[0];

      let newReportIds = reportIds;
      if (reportIds.length > 0) {
        await tx.$queryRaw`
          SELECT id FROM "Report" WHERE id IN (${Prisma.join(reportIds)}) ORDER BY id FOR UPDATE
        `;
        const reports = await tx.report.findMany({
          where: { id: { in: reportIds }, isDeleted: false, isSpam: false },
          select: {
            id: true,
            title: true,
            status: true,
            cleanupScheduleId: true,
            cleanupSchedule: { select: { title: true } },
          },
        });
        if (reports.length !== reportIds.length) {
          throw new Error("One or more selected waste reports do not exist or were deleted");
        }
        const conflicting = reports.filter((report) => report.cleanupScheduleId && report.cleanupScheduleId !== existing?.id);
        if (conflicting.length > 0) {
          const titles = conflicting.map((report) => `"${report.title}" (already in "${report.cleanupSchedule?.title ?? report.status}")`).join(", ");
          throw new Error(`Cannot create schedule: Waste report(s) already assigned to a different cleanup schedule: ${titles}`);
        }
        const unassigned = reports.filter((report) => !report.cleanupScheduleId);
        assertVerifiedForScheduling(unassigned);
        newReportIds = unassigned.map((report) => report.id);
      }

      const existingWorkerIds = existing?.workers.map((worker) => worker.workerId) ?? [];
      const newWorkerIds = data.workerIds.filter((id) => !existingWorkerIds.includes(id));
      const workerIds = [...existingWorkerIds, ...newWorkerIds];
      const equipment = [...new Set([...(existing?.equipment ?? []), ...(data.equipment ?? [])])];

      const schedule = existing
        ? await tx.cleanupSchedule.update({
            where: { id: existing.id },
            data: {
              equipment,
              workers: { create: newWorkerIds.map((workerId) => ({ workerId })) },
            },
          })
        : await tx.cleanupSchedule.create({
            data: {
              title: data.title,
              description: data.description,
              barangay: data.barangay,
              latitude: data.latitude,
              longitude: data.longitude,
              scheduledAt,
              createdById: adminId,
              equipment,
              workers: { create: workerIds.map((workerId) => ({ workerId })) },
            },
          });

      if (newReportIds.length > 0) {
        const status = existing?.status === CleanupScheduleStatus.ONGOING
          ? ReportStatus.IN_PROGRESS
          : ReportStatus.CLEANUP_SCHEDULED;
        await tx.report.updateMany({
          where: { id: { in: newReportIds } },
          data: { status, cleanupScheduleId: schedule.id, assignedToId: workerIds[0] },
        });
        await tx.statusHistory.createMany({
          data: newReportIds.map((reportId) => ({
            reportId,
            newStatus: status,
            notes: `Assigned to Cleanup Schedule: ${schedule.title}`,
            changedById: adminId,
          })),
        });
      }

      return {
        schedule: await tx.cleanupSchedule.findUniqueOrThrow({
          where: { id: schedule.id },
          include: scheduleInclude,
        }),
        newWorkerIds,
        crewToNotify: newReportIds.length > 0 ? existingWorkerIds : [],
        consolidated: Boolean(existing),
      };
    });

    const date = scheduleDateFormatter.format(schedule.scheduledAt);
    await Promise.all(newWorkerIds.map((workerId) =>
      NotificationService.create({
        userId: workerId,
        title: consolidated ? "Consolidated Cleanup Schedule Assigned" : "New Cleanup Schedule Assigned",
        message: `You have been assigned to "${schedule.title}" at ${schedule.barangay} on ${date}.`,
        type: "CLEANUP_SCHEDULE",
      }).catch((error) => logger.warn({ err: error, scheduleId: schedule.id, workerId }, "Could not notify schedule worker")),
    ));

    await this.notifyCrewOfAdditionalReports(schedule, crewToNotify);

    return schedule;
  }

  private static async notifyCrewOfAdditionalReports(
    schedule: { id: string; title: string; barangay: string },
    workerIds: string[],
  ) {
    await Promise.all(workerIds.map((userId) => NotificationService.create({
      userId,
      title: "Cleanup Schedule Updated",
      message: `New report locations were added to "${schedule.title}" at ${schedule.barangay}. Open the schedule to review the updated work.`,
      type: "CLEANUP_SCHEDULE",
    }).catch((error) => logger.warn({ err: error, scheduleId: schedule.id, userId }, "Could not notify schedule worker"))));
  }

  static async findById(id: string) {
    await this.syncScheduleStatus(id);

    const schedule = await prisma.cleanupSchedule.findUnique({
      where: { id },
      include: scheduleInclude,
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return schedule;
  }

  static async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      barangay?: string;
      latitude?: number;
      longitude?: number;
      scheduledAt?: string;
      workerIds?: string[];
      reportIds?: string[];
      addReportIds?: string[];
      status?: string;
      equipment?: string[];
    },
    adminId: string,
  ) {
    const { schedule, newWorkerIds, crewToNotify } = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "CleanupSchedule" WHERE id = ${id} FOR UPDATE`;
      const existing = await tx.cleanupSchedule.findUnique({
        where: { id },
        include: {
          workers: { orderBy: { assignedAt: "asc" }, select: { workerId: true } },
          reports: { select: { id: true } },
        },
      });
      if (!existing) throw new Error("Schedule not found");

      const updateData: Prisma.CleanupScheduleUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.barangay !== undefined) updateData.barangay = data.barangay;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.scheduledAt !== undefined) {
        const scheduledAt = new Date(data.scheduledAt);
        if (scheduleDateFormatter.format(scheduledAt) < scheduleDateFormatter.format(new Date())) {
          throw new Error("Cannot update schedule to a past date");
        }
        updateData.scheduledAt = scheduledAt;
      }
      const nextStatus = (data.status ?? existing.status) as CleanupScheduleStatus;
      if (data.status !== undefined) updateData.status = nextStatus;
      if (data.equipment !== undefined) updateData.equipment = data.equipment;

      const existingWorkerIds = existing.workers.map((worker) => worker.workerId);
      const workerIds = data.workerIds ?? existingWorkerIds;
      const newWorkerIds = workerIds.filter((workerId) => !existingWorkerIds.includes(workerId));
      if (data.workerIds !== undefined) {
        const workers = await tx.user.findMany({
          where: { id: { in: workerIds }, role: "FIELD_WORKER", isActive: true },
          select: { id: true },
        });
        if (workers.length !== workerIds.length) {
          throw new Error("One or more worker IDs are invalid");
        }
        updateData.workers = {
          deleteMany: { workerId: { notIn: workerIds } },
          create: newWorkerIds.map((workerId) => ({ workerId })),
        };
      }

      let addedReportIds: string[] = [];
      if (data.reportIds !== undefined || data.addReportIds !== undefined) {
        const currentIds = existing.reports.map((report) => report.id);
        const reportIds = [...new Set(data.reportIds ?? [...currentIds, ...(data.addReportIds ?? [])])];
        addedReportIds = reportIds.filter((reportId) => !currentIds.includes(reportId));
        const removedReportIds = currentIds.filter((reportId) => !reportIds.includes(reportId));
        const changedIds = [...addedReportIds, ...removedReportIds];

        if (changedIds.length > 0) {
          await tx.$queryRaw`
            SELECT id FROM "Report" WHERE id IN (${Prisma.join(changedIds)}) ORDER BY id FOR UPDATE
          `;
        }
        if (addedReportIds.length > 0) {
          if (existing.status === "COMPLETED" || existing.status === "CANCELLED" ||
              nextStatus === "COMPLETED" || nextStatus === "CANCELLED") {
            throw new Error("New reports can only be added to an upcoming or ongoing cleanup schedule.");
          }
          const reports = await tx.report.findMany({
            where: { id: { in: addedReportIds }, isDeleted: false, isSpam: false },
            select: { id: true, title: true, status: true, cleanupScheduleId: true },
          });
          if (reports.length !== addedReportIds.length) {
            throw new Error("One or more selected waste reports do not exist or were deleted");
          }
          const assigned = reports.filter((report) => report.cleanupScheduleId);
          if (assigned.length > 0) {
            const titles = assigned.map((report) => `"${report.title}"`).join(", ");
            throw new Error(`Cannot update schedule: Waste report(s) already assigned to another cleanup schedule: ${titles}`);
          }
          assertVerifiedForScheduling(reports);

          const status = nextStatus === "ONGOING" ? ReportStatus.IN_PROGRESS : ReportStatus.CLEANUP_SCHEDULED;
          await tx.report.updateMany({
            where: { id: { in: addedReportIds } },
            data: { status, cleanupScheduleId: id, assignedToId: workerIds[0] },
          });
          await tx.statusHistory.createMany({
            data: addedReportIds.map((reportId) => ({
              reportId,
              newStatus: status,
              notes: `Assigned to Cleanup Schedule: ${data.title ?? existing.title}`,
              changedById: adminId,
            })),
          });
        }
        if (removedReportIds.length > 0) {
          const released = await tx.report.updateManyAndReturn({
            where: { id: { in: removedReportIds }, status: { in: ["CLEANUP_SCHEDULED", "IN_PROGRESS"] } },
            data: { status: "VERIFIED" },
            select: { id: true },
          });
          await tx.report.updateMany({
            where: { id: { in: removedReportIds } },
            data: { cleanupScheduleId: null },
          });
          if (released.length > 0) {
            await tx.statusHistory.createMany({
              data: released.map(({ id: reportId }) => ({
                reportId,
                newStatus: "VERIFIED",
                notes: `Unlinked from Cleanup Schedule "${data.title ?? existing.title}". Returned to verified pool.`,
                changedById: adminId,
              })),
            });
          }
        }
      }

      if (data.workerIds !== undefined && workerIds[0]) {
        await tx.report.updateMany({
          where: { cleanupScheduleId: id },
          data: { assignedToId: workerIds[0] },
        });
      }
      const schedule = await tx.cleanupSchedule.update({ where: { id }, data: updateData, include: scheduleInclude });
      return {
        schedule,
        newWorkerIds,
        crewToNotify: addedReportIds.length > 0 ? workerIds.filter((workerId) => existingWorkerIds.includes(workerId)) : [],
      };
    });

    await Promise.all(newWorkerIds.map((userId) => NotificationService.create({
      userId,
      title: "New Cleanup Schedule Assigned",
      message: `You have been assigned to "${schedule.title}" at ${schedule.barangay} on ${scheduleDateFormatter.format(schedule.scheduledAt)}.`,
      type: "CLEANUP_SCHEDULE",
    }).catch((error) => logger.warn({ err: error, scheduleId: id, userId }, "Could not notify schedule worker"))));
    await this.notifyCrewOfAdditionalReports(schedule, crewToNotify);

    const synced = await this.syncScheduleStatus(id, adminId);
    if (synced && synced.status !== schedule.status) {
      return prisma.cleanupSchedule.findUniqueOrThrow({ where: { id }, include: scheduleInclude });
    }
    return schedule;
  }

  static async updateStatus(
    id: string,
    status: CleanupScheduleStatus,
    userId: string,
    notes?: string,
    isWorker = false,
  ) {
    const { schedule, workerIds, changed } = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "CleanupSchedule" WHERE id = ${id} FOR UPDATE`;
      const existing = await tx.cleanupSchedule.findUnique({
        where: { id },
        include: { workers: { select: { workerId: true } } },
      });
      if (!existing) throw new Error("Schedule not found");

      const workerIds = existing.workers.map((worker) => worker.workerId);
      if (isWorker && !workerIds.includes(userId)) {
        throw new Error("Insufficient permissions.");
      }
      if (isWorker && status !== existing.status &&
          !(existing.status === "UPCOMING" && status === "ONGOING") &&
          !(existing.status === "ONGOING" && status === "COMPLETED")) {
        throw new Error("This schedule status has changed. Refresh and try again.");
      }
      if (status === existing.status && notes === undefined) {
        return {
          schedule: await tx.cleanupSchedule.findUniqueOrThrow({ where: { id }, include: scheduleInclude }),
          workerIds,
          changed: false,
        };
      }

      const updateData: Prisma.CleanupScheduleUpdateInput = {
        status,
        ...(notes !== undefined ? { notes } : {}),
      };
      if (status === "COMPLETED") {
        const reports = await tx.report.findMany({
          where: { cleanupScheduleId: id, isDeleted: false },
          select: { status: true },
        });
        const uncleaned = reports.filter((report) => report.status !== ReportStatus.CLEANED).length;
        if (uncleaned > 0) {
          throw new Error(
            `Cannot mark cleanup schedule as completed: ${uncleaned} of ${reports.length} report location(s) are not yet cleaned. All associated locations must be cleaned first.`,
          );
        }
        if (existing.status !== "COMPLETED") {
          updateData.verifiedBy = { connect: { id: userId } };
          updateData.verifiedAt = new Date();
        }
      } else if (existing.status === "COMPLETED") {
        updateData.verifiedBy = { disconnect: true };
        updateData.verifiedAt = null;
      }

      if (status === "ONGOING" || status === "CANCELLED") {
        const reportStatus = status === "ONGOING" ? ReportStatus.IN_PROGRESS : ReportStatus.VERIFIED;
        const where: Prisma.ReportWhereInput = {
          cleanupScheduleId: id,
          ...(status === "ONGOING" ? { isDeleted: false, status: ReportStatus.CLEANUP_SCHEDULED } : {}),
        };
        const reports = await tx.report.updateManyAndReturn({
          where,
          data: { status: reportStatus, ...(status === "CANCELLED" ? { cleanupScheduleId: null } : {}) },
          select: { id: true },
        });
        if (reports.length > 0) {
          await tx.statusHistory.createMany({
            data: reports.map(({ id: reportId }) => ({
              reportId,
              newStatus: reportStatus,
              notes: status === "ONGOING"
                ? `Cleanup operation started for schedule "${existing.title}".`
                : `Cleanup schedule cancelled (${notes || "No reason specified"}). Report returned to verified pool.`,
              changedById: userId,
            })),
          });
        }
      }

      const schedule = await tx.cleanupSchedule.update({
        where: { id },
        data: updateData,
        include: scheduleInclude,
      });
      return { schedule, workerIds, changed: status !== existing.status };
    });

    if (!changed) return schedule;
    // Notify assigned workers about status change
    const statusLabels: Record<string, string> = {
      UPCOMING: "Upcoming",
      ONGOING: "Ongoing",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    await Promise.all(
      workerIds.map((workerId) =>
        NotificationService.create({
          userId: workerId,
          title: "Cleanup Schedule Updated",
          message: `"${schedule.title}" status changed to ${statusLabels[status] || status}.`,
          type: "CLEANUP_SCHEDULE",
        }).catch(() => {}),
      ),
    );

    return schedule;
  }

  static async delete(id: string) {
    const existing = await prisma.cleanupSchedule.findUnique({
      where: { id },
      include: { workers: { select: { workerId: true } } },
    });

    if (!existing) {
      throw new Error("Schedule not found");
    }

    // Revert any linked reports back to VERIFIED and clear their cleanupScheduleId
    await prisma.report.updateMany({
      where: { cleanupScheduleId: id },
      data: { status: "VERIFIED", cleanupScheduleId: null },
    });

    await prisma.cleanupSchedule.delete({ where: { id } });

    // Notify assigned workers about cancellation
    await Promise.all(
      existing.workers.map((w) =>
        NotificationService.create({
          userId: w.workerId,
          title: "Cleanup Schedule Cancelled",
          message: `"${existing.title}" at ${existing.barangay} has been cancelled and removed.`,
          type: "CLEANUP_SCHEDULE",
        }),
      ),
    );

    return { message: "Schedule deleted successfully" };
  }

  /**
   * Synchronizes the status of a specific cleanup schedule based on the status
   * of all its associated active waste reports.
   *
   * - If ALL associated reports have a 'CLEANED' status (and there is at least 1 report),
   *   the schedule status is automatically set to 'COMPLETED'.
   * - If even one associated report is NOT cleaned, or if there are NO reports,
   *   does not mark as completed.
   * - Never auto-completes CANCELLED schedules.
   */
  static async syncScheduleStatus(scheduleId: string, verifierId?: string) {
    try {
      const schedule = await prisma.cleanupSchedule.findUnique({
        where: { id: scheduleId },
        include: {
          reports: {
            where: { isDeleted: false },
            select: { id: true, status: true },
          },
          workers: { select: { workerId: true } },
        },
      });

      if (!schedule) return null;
      if (schedule.status === "COMPLETED" || schedule.status === "CANCELLED") {
        return schedule;
      }

      const totalReports = schedule.reports.length;
      const cleanedReports = schedule.reports.filter(
        (r) => r.status === ReportStatus.CLEANED,
      ).length;

      // Must have at least 1 report, and ALL reports must be CLEANED
      if (totalReports > 0 && cleanedReports === totalReports) {
        const updateData: Prisma.CleanupScheduleUpdateInput = {
          status: "COMPLETED",
          verifiedAt: schedule.verifiedAt ?? new Date(),
          notes: schedule.notes
            ? schedule.notes
            : "All associated waste reports have been cleaned.",
        };

        if (verifierId) {
          updateData.verifiedBy = { connect: { id: verifierId } };
        }

        const updated = await prisma.cleanupSchedule.update({
          where: {
            id: scheduleId,
            status: { in: ["UPCOMING", "ONGOING"] },
            reports: {
              some: { isDeleted: false },
              none: { isDeleted: false, status: { not: ReportStatus.CLEANED } },
            },
          },
          data: updateData,
          include: scheduleInclude,
        });

        // Notify assigned workers about automatic completion
        await Promise.all(
          schedule.workers.map((w) =>
            NotificationService.create({
              userId: w.workerId,
              title: "Cleanup Schedule Completed",
              message: `"${schedule.title}" has been automatically marked as Completed because all associated waste reports are cleaned.`,
              type: "CLEANUP_SCHEDULE",
            }).catch(() => {}),
          ),
        );

        return updated;
      }

      // If schedule is UPCOMING and any report is IN_PROGRESS or CLEANED, advance schedule to ONGOING
      if (
        schedule.status === "UPCOMING" &&
        schedule.reports.some(
          (r) =>
            r.status === ReportStatus.IN_PROGRESS ||
            r.status === ReportStatus.CLEANED,
        )
      ) {
        const updated = await prisma.cleanupSchedule.update({
          where: { id: scheduleId, status: "UPCOMING" },
          data: { status: "ONGOING" },
          include: scheduleInclude,
        });
        return updated;
      }

      return schedule;
    } catch (err) {
      console.warn("Failed to sync cleanup schedule status:", scheduleId, err);
      return null;
    }
  }

  /**
   * Reconciles all UPCOMING and ONGOING schedules where all associated waste reports
   * are CLEANED. Updates their status to COMPLETED and persists in the database.
   */
  static async reconcileAllSchedules(): Promise<number> {
    try {
      const outOfSync = await prisma.cleanupSchedule.findMany({
        where: {
          status: { in: ["UPCOMING", "ONGOING"] },
          reports: {
            some: { isDeleted: false },
          },
        },
        include: {
          reports: {
            where: { isDeleted: false },
            select: { id: true, status: true },
          },
          workers: { select: { workerId: true } },
        },
      });

      const toComplete = outOfSync.filter(
        (s) =>
          s.reports.length > 0 &&
          s.reports.every((r) => r.status === ReportStatus.CLEANED),
      );

      if (toComplete.length === 0) return 0;

      let completed = 0;
      for (const schedule of toComplete) {
        const update = await prisma.cleanupSchedule.updateMany({
          where: {
            id: schedule.id,
            status: { in: ["UPCOMING", "ONGOING"] },
            reports: {
              some: { isDeleted: false },
              none: { isDeleted: false, status: { not: ReportStatus.CLEANED } },
            },
          },
          data: {
            status: "COMPLETED",
            verifiedAt: schedule.verifiedAt ?? new Date(),
            notes:
              schedule.notes ||
              "All associated waste reports have been cleaned.",
          },
        });
        if (update.count === 0) continue;
        completed++;

        // Notify workers
        await Promise.all(
          schedule.workers.map((w) =>
            NotificationService.create({
              userId: w.workerId,
              title: "Cleanup Schedule Completed",
              message: `"${schedule.title}" has been automatically marked as Completed because all associated waste reports are cleaned.`,
              type: "CLEANUP_SCHEDULE",
            }).catch(() => {}),
          ),
        );
      }

      return completed;
    } catch (error) {
      console.warn("Failed to reconcile cleanup schedules:", error);
      return 0;
    }
  }

  static async getSchedules(filters: {
    page?: string;
    limit?: string;
    status?: string;
    barangay?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    await this.reconcileAllSchedules();

    const pagination = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: Prisma.CleanupScheduleWhereInput = {};

    if (filters.status) {
      where.status = filters.status as CleanupScheduleStatus;
    }

    if (filters.barangay) {
      where.barangay = { contains: filters.barangay, mode: "insensitive" };
    }

    if (filters.startDate || filters.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) {
        where.scheduledAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.scheduledAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { barangay: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [schedules, total] = await Promise.all([
      prisma.cleanupSchedule.findMany({
        where,
        include: scheduleInclude,
        orderBy: { scheduledAt: "asc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.cleanupSchedule.count({ where }),
    ]);

    return buildPaginatedResponse(schedules, total, pagination);
  }

  static async getUpcomingPublic() {
    await this.reconcileAllSchedules();
    const now = new Date();
    const schedules = await prisma.cleanupSchedule.findMany({
      where: {
        OR: [
          { status: "UPCOMING", scheduledAt: { gte: now } },
          { status: "ONGOING" },
        ],
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        workers: {
          include: {
            worker: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });

    return schedules;
  }

  static async getWorkerSchedules(
    workerId: string,
    filters: {
      page?: string;
      limit?: string;
      status?: string;
    },
  ) {
    await this.reconcileAllSchedules();

    const pagination = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: Prisma.CleanupScheduleWhereInput = {
      workers: { some: { workerId } },
    };

    if (filters.status) {
      where.status = filters.status as CleanupScheduleStatus;
    }

    const [schedules, total] = await Promise.all([
      prisma.cleanupSchedule.findMany({
        where,
        include: scheduleInclude,
        orderBy: { scheduledAt: "asc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.cleanupSchedule.count({ where }),
    ]);

    return buildPaginatedResponse(schedules, total, pagination);
  }

  /**
   * Generates a consolidated cleanup report summarizing all associated waste reports,
   * reporting citizens, locations, waste classifications, quantities, assigned workers,
   * and completion verification status for a specific schedule.
   */
  static async getConsolidatedReport(scheduleId: string) {
    await this.syncScheduleStatus(scheduleId);

    const schedule = await prisma.cleanupSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        workers: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { assignedAt: "asc" },
        },
        reports: {
          where: { isDeleted: false },
          include: {
            reporter: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            images: true,
            statusHistory: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const totalReports = schedule.reports.length;
    const distinctCitizenIds = new Set<string>();
    let anonymousCount = 0;
    schedule.reports.forEach((r) => {
      if (r.reporterId) {
        distinctCitizenIds.add(r.reporterId);
      } else {
        anonymousCount += 1;
      }
    });
    const totalCitizens = distinctCitizenIds.size + anonymousCount;

    const cleanedCount = schedule.reports.filter((r) => r.status === "CLEANED").length;
    const inProgressCount = schedule.reports.filter((r) => r.status === "IN_PROGRESS").length;
    const scheduledCount = schedule.reports.filter((r) => r.status === "CLEANUP_SCHEDULED").length;

    const groupedReports = schedule.reports.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      category: r.category,
      severity: r.severity,
      wasteQuantity: r.analysisWasteCount,
      latitude: r.latitude,
      longitude: r.longitude,
      address: r.address,
      reporterId: r.reporterId,
      reporter: r.reporter
        ? {
            id: r.reporter.id,
            name: `${r.reporter.firstName} ${r.reporter.lastName}`,
            email: r.reporter.email,
          }
        : null,
      isAnonymous: r.isAnonymous,
      photoUrls: r.images
        .filter((img) => img.type === "REPORT")
        .map((img) => img.imageUrl),
      cleanupPhotoUrls: r.images
        .filter((img) => img.type === "CLEANUP")
        .map((img) => img.imageUrl),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const cleanedNotes = schedule.notes
      ? schedule.notes.replace(/^Automatically completed:\s*/i, "").trim()
      : schedule.notes;
    const finalNotes = cleanedNotes
      ? cleanedNotes.charAt(0).toUpperCase() + cleanedNotes.slice(1)
      : cleanedNotes;

    return {
      scheduleId: schedule.id,
      scheduleTitle: schedule.title,
      description: schedule.description,
      barangay: schedule.barangay,
      scheduledAt: schedule.scheduledAt.toISOString(),
      overallStatus: schedule.status,
      notes: finalNotes,
      completionInfo: {
        completedAt:
          schedule.status === "COMPLETED"
            ? (schedule.verifiedAt || schedule.updatedAt).toISOString()
            : null,
        verifiedAt: schedule.verifiedAt ? schedule.verifiedAt.toISOString() : null,
        verifiedBy: schedule.verifiedBy
          ? {
              id: schedule.verifiedBy.id,
              name: `${schedule.verifiedBy.firstName} ${schedule.verifiedBy.lastName}`,
            }
          : null,
        notes: finalNotes,
      },
      summary: {
        totalReports,
        totalCitizens,
        cleanedReportsCount: cleanedCount,
        inProgressReportsCount: inProgressCount,
        scheduledReportsCount: scheduledCount,
        isFullyCleaned: totalReports > 0 && cleanedCount === totalReports,
      },
      assignedWorkers: schedule.workers.map((w) => ({
        id: w.worker.id,
        firstName: w.worker.firstName,
        lastName: w.worker.lastName,
        email: w.worker.email,
        phone: w.worker.phone,
      })),
      groupedReports,
      equipment: schedule.equipment,
      generatedAt: new Date().toISOString(),
    };
  }
}
