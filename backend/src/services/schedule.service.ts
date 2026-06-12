import prisma from "../config/database";
import {
  CleanupScheduleStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import {
  getPaginationParams,
  buildPaginatedResponse,
} from "../utils/pagination";
import { NotificationService } from "./notification.service";

const scheduleInclude = {
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  verifiedBy: {
    select: { id: true, firstName: true, lastName: true },
  },
  reports: true,
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

    const schedule = await prisma.cleanupSchedule.create({
      data: {
        title: data.title,
        description: data.description,
        barangay: data.barangay,
        latitude: data.latitude,
        longitude: data.longitude,
        scheduledAt: new Date(data.scheduledAt),
        createdById: adminId,
        equipment: data.equipment || [],
        workers: {
          create: data.workerIds.map((workerId) => ({
            workerId,
          })),
        },
        reports:
          data.reportIds && data.reportIds.length > 0
            ? {
                connect: data.reportIds.map((id) => ({ id })),
              }
            : undefined,
      },
      include: scheduleInclude,
    });

    if (data.reportIds && data.reportIds.length > 0) {
      await prisma.report.updateMany({
        where: { id: { in: data.reportIds } },
        data: { status: "CLEANUP_SCHEDULED" },
      });

      // Add status history
      const historyData = data.reportIds.map((id) => ({
        reportId: id,
        newStatus: "CLEANUP_SCHEDULED" as const,
        notes: `Assigned to Cleanup Schedule: ${data.title}`,
        changedById: adminId,
      }));
      await prisma.statusHistory.createMany({ data: historyData });
    }

    // Notify assigned workers
    const scheduledDate = new Date(data.scheduledAt).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" },
    );
    await Promise.all(
      data.workerIds.map((workerId) =>
        NotificationService.create({
          userId: workerId,
          title: "New Cleanup Schedule Assigned",
          message: `You have been assigned to "${data.title}" at ${data.barangay} on ${scheduledDate}.`,
          type: "CLEANUP_SCHEDULE",
        }),
      ),
    );

    return schedule;
  }

  static async findById(id: string) {
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
      status?: string;
      equipment?: string[];
    },
    adminId: string,
  ) {
    const existing = await prisma.cleanupSchedule.findUnique({
      where: { id },
      include: { workers: { select: { workerId: true } } },
    });

    if (!existing) {
      throw new Error("Schedule not found");
    }

    // Build update data
    const updateData: Prisma.CleanupScheduleUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.barangay !== undefined) updateData.barangay = data.barangay;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.scheduledAt !== undefined)
      updateData.scheduledAt = new Date(data.scheduledAt);
    if (data.status !== undefined)
      updateData.status = data.status as CleanupScheduleStatus;
    if (data.equipment !== undefined) updateData.equipment = data.equipment;

    if (data.reportIds !== undefined) {
      updateData.reports = {
        set: data.reportIds.map((id) => ({ id })),
      };
    }

    // Handle worker reassignment
    if (data.workerIds !== undefined) {
      // Validate workers
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

      const existingWorkerIds = existing.workers.map((w) => w.workerId);
      const newWorkerIds = data.workerIds.filter(
        (wId) => !existingWorkerIds.includes(wId),
      );
      const removedWorkerIds = existingWorkerIds.filter(
        (wId) => !data.workerIds!.includes(wId),
      );

      // Delete removed workers and add new ones in a transaction
      await prisma.$transaction([
        ...(removedWorkerIds.length > 0
          ? [
              prisma.cleanupScheduleWorker.deleteMany({
                where: {
                  scheduleId: id,
                  workerId: { in: removedWorkerIds },
                },
              }),
            ]
          : []),
        ...(newWorkerIds.length > 0
          ? [
              prisma.cleanupScheduleWorker.createMany({
                data: newWorkerIds.map((workerId) => ({
                  scheduleId: id,
                  workerId,
                })),
              }),
            ]
          : []),
      ]);

      // Notify newly assigned workers
      if (newWorkerIds.length > 0) {
        const scheduledDate = new Date(
          data.scheduledAt ?? existing.scheduledAt.toISOString(),
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        await Promise.all(
          newWorkerIds.map((workerId) =>
            NotificationService.create({
              userId: workerId,
              title: "New Cleanup Schedule Assigned",
              message: `You have been assigned to "${data.title ?? existing.title}" at ${data.barangay ?? existing.barangay} on ${scheduledDate}.`,
              type: "CLEANUP_SCHEDULE",
            }),
          ),
        );
      }
    }

    const schedule = await prisma.cleanupSchedule.update({
      where: { id },
      data: updateData,
      include: scheduleInclude,
    });

    if (data.reportIds !== undefined) {
      await prisma.report.updateMany({
        where: {
          id: { in: data.reportIds },
          status: { not: "CLEANUP_SCHEDULED" },
        },
        data: { status: "CLEANUP_SCHEDULED" },
      });
    }

    return schedule;
  }

  static async updateStatus(
    id: string,
    status: string,
    userId: string,
    notes?: string,
  ) {
    const existing = await prisma.cleanupSchedule.findUnique({
      where: { id },
      include: {
        workers: { select: { workerId: true } },
      },
    });

    if (!existing) {
      throw new Error("Schedule not found");
    }

    const updateData: Prisma.CleanupScheduleUpdateInput = {
      status: status as CleanupScheduleStatus,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // If admin verifies as completed, record the verifier
    if (status === "COMPLETED") {
      updateData.verifiedBy = { connect: { id: userId } };
      updateData.verifiedAt = new Date();
    }

    const schedule = await prisma.cleanupSchedule.update({
      where: { id },
      data: updateData,
      include: scheduleInclude,
    });

    if (status === "COMPLETED") {
      const reports = await prisma.report.findMany({
        where: { cleanupScheduleId: id },
      });

      if (reports.length > 0) {
        await prisma.report.updateMany({
          where: { cleanupScheduleId: id },
          data: { status: "CLEANED" },
        });

        const historyData = reports.map((r) => ({
          reportId: r.id,
          newStatus: "CLEANED" as const,
          notes: `Cleanup Schedule completed. ${notes || ""}`,
          changedById: userId,
        }));
        await prisma.statusHistory.createMany({ data: historyData });
      }
    }

    // Notify assigned workers about status change
    const statusLabels: Record<string, string> = {
      UPCOMING: "Upcoming",
      ONGOING: "Ongoing",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    await Promise.all(
      existing.workers.map((w) =>
        NotificationService.create({
          userId: w.workerId,
          title: "Cleanup Schedule Updated",
          message: `"${existing.title}" status changed to ${statusLabels[status] || status}.`,
          type: "CLEANUP_SCHEDULE",
        }),
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

  static async getSchedules(filters: {
    page?: string;
    limit?: string;
    status?: string;
    barangay?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
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
    const now = new Date();
    const schedules = await prisma.cleanupSchedule.findMany({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
        scheduledAt: { gte: now },
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
}
