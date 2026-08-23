import prisma from "../config/database";
import { ReportStatus, WasteCategory, Prisma, Role, NotificationType, Severity, AnalysisStatus } from "@prisma/client";
import { getPaginationParams, buildPaginatedResponse } from "../utils/pagination";
import { NotificationService } from "./notification.service";
import { GeoCache } from "../utils/geo-cache";
import { ReportSpamService } from "./report-spam.service";
import { ReportDedupService } from "./report-dedup.service";

type Viewer = {
  id: string;
  role: string;
};

export function sanitizeReportForPrivacy<T extends Record<string, any>>(
  report: T,
  viewerId?: string,
): T {
  if (!report || !report.isAnonymous) {
    return report;
  }
  const isReporter = Boolean(
    viewerId && report.reporterId && report.reporterId === viewerId,
  );
  if (isReporter) {
    return report;
  }

  const sanitized: any = { ...report };
  if (sanitized.reporter) {
    sanitized.reporter = {
      id: null,
      firstName: "Anonymous",
      lastName: "Citizen",
      email: null,
      phone: null,
    };
  }
  if (Array.isArray(sanitized.statusHistory)) {
    sanitized.statusHistory = sanitized.statusHistory.map((history: any) => {
      if (
        history.changedBy &&
        (history.notes === "Report submitted" ||
          (report.reporterId && history.changedById === report.reporterId))
      ) {
        return {
          ...history,
          changedById: null,
          changedBy: {
            id: null,
            firstName: "Anonymous",
            lastName: "Citizen",
          },
        };
      }
      return history;
    });
  }

  return sanitized as T;
}

export class ReportCrudService {
  static async create(data: {
    title: string;
    description: string;
    category: WasteCategory;
    latitude: number;
    longitude: number;
    address?: string;
    isAnonymous?: boolean;
    reporterId?: string;
    isSpamFlagged?: boolean;
    spamReason?: string;
    yoloConfidence?: number;
    severity?: "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null;
    analysisStatus?: "DIRTY" | "CLEAN" | null;
    analysisConfidence?: number | null;
    analysisWasteCount?: number | null;
    aiModel?: string | null;
    aiCategories?: string[] | null;
    aiReason?: string | null;
    aiProcessingMs?: number | null;
    aiGeminiMs?: number | null;
  }) {
    await ReportSpamService.purgeExpiredSpamIfDue();

    const clientSpamFlagged = data.isSpamFlagged === true;
    const resolvedSpamReason = clientSpamFlagged
      ? (data.spamReason ?? "No waste detected by YOLOv8")
      : data.category === "no_waste"
        ? "No visible waste or pollution detected in the submitted image."
        : null;
    const isSpam = clientSpamFlagged || data.category === "no_waste";
    const yoloConfidenceFraction =
      typeof data.yoloConfidence === "number" && data.yoloConfidence > 0
        ? data.yoloConfidence / 100.0
        : null;

    const report = await prisma.$transaction(async (tx) => {
      const resolvedDescription =
        data.description && data.description.trim().length > 0
          ? data.description
          : data.aiReason && data.aiReason.trim().length > 0
            ? data.aiReason
            : "Waste report submitted via mobile capture.";

      const created = await tx.report.create({
        data: {
          title: data.title,
          description: resolvedDescription,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          isAnonymous: Boolean(data.isAnonymous || !data.reporterId),
          isSpam,
          spamMarkedAt: isSpam ? new Date() : null,
          spamReason: resolvedSpamReason,
          analysisConfidence:
            typeof data.analysisConfidence === "number" && data.analysisConfidence > 0
              ? data.analysisConfidence
              : yoloConfidenceFraction,
          ...((data.severity != null || data.aiModel != null || data.aiCategories != null) && {
            ...(data.severity != null && { severity: data.severity as Severity }),
            analysisStatus: (data.analysisStatus as AnalysisStatus) ?? null,
            analysisWasteCount: data.analysisWasteCount ?? null,
            analyzedAt: new Date(),
          }),
          ...(data.aiModel != null && { aiModel: data.aiModel }),
          ...(data.aiCategories != null && { aiCategories: data.aiCategories }),
          ...(data.aiReason != null && { aiReason: data.aiReason }),
          ...(data.aiProcessingMs != null && { aiProcessingMs: data.aiProcessingMs }),
          ...(data.aiGeminiMs != null && { aiGeminiMs: data.aiGeminiMs }),
          reporterId: data.reporterId ?? null,
        },
        include: {
          reporter: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          images: true,
        },
      });

      if (data.reporterId) {
        await tx.statusHistory.create({
          data: {
            reportId: created.id,
            newStatus: ReportStatus.PENDING,
            changedById: data.reporterId,
            notes: "Report submitted",
          },
        });
      }

      // ── Same-waste incident deduplication ─────────────────────────────────
      // Only run for genuine waste reports (not spam / no_waste)
      if (!isSpam && data.category !== "no_waste") {
        try {
          await ReportDedupService.assignOrCreateIncident(
            tx,
            created.id,
            data.latitude,
            data.longitude,
            data.category as WasteCategory,
            (data.severity as Severity | null) ?? null,
            data.address,
          );
        } catch (dedupError) {
          // Dedup failure must never abort the main report creation
          console.warn("[dedup] Failed to assign incident for report", created.id, dedupError);
        }
      }

      return created;
    });

    try {
      if (isSpam) {
        await NotificationService.notifyAdmins(
          "New Spam Report",
          `A new report flagged as spam has been submitted: "${data.title}"`,
          report.id,
          NotificationType.SYSTEM,
        );
      } else {
        await NotificationService.notifyAdmins(
          "New Waste Report",
          `A new ${data.category.replace("_", " ").toLowerCase()} report has been submitted: "${data.title}"`,
          report.id,
          NotificationType.NEW_REPORT,
        );
      }

      if (report.reporterId) {
        if (isSpam) {
          await NotificationService.create({
            userId: report.reporterId,
            title: "Report Marked as Spam",
            message: `Your report "${report.title}" was flagged as spam (${resolvedSpamReason ?? "No visible waste detected"}).`,
            type: NotificationType.SYSTEM,
            reportId: report.id,
          });
        } else {
          await NotificationService.create({
            userId: report.reporterId,
            title: "Report Submitted",
            message: `Your report "${report.title}" has been successfully submitted and is pending verification.`,
            type: NotificationType.NEW_REPORT,
            reportId: report.id,
          });
        }
      }
    } catch (error) {
      console.warn("Failed to notify admins/reporter for new report:", report.id, error);
    }

    await GeoCache.invalidateAll();

    return report;
  }

  static async findById(id: string, viewer?: Viewer) {
    if (!viewer) {
      throw new Error("Insufficient permissions.");
    }

    const where: Prisma.ReportWhereInput = {
      id,
      isDeleted: false,
    };

    if (viewer.role === Role.FIELD_WORKER) {
      where.assignedToId = viewer.id;
    } else if (viewer.role === Role.CITIZEN) {
      where.reporterId = viewer.id;
    }

    const report = await prisma.report.findFirst({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedWorkers: {
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
        images: { orderBy: { createdAt: "asc" } },
        statusHistory: {
          include: {
            changedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!report) {
      if (viewer.role === Role.FIELD_WORKER || viewer.role === Role.CITIZEN) {
        const exists = await prisma.report.findFirst({
          where: { id, isDeleted: false },
          select: { id: true },
        });
        if (exists) {
          throw new Error("Insufficient permissions.");
        }
      }

      throw new Error("Report not found");
    }

    return sanitizeReportForPrivacy(report, viewer?.id);
  }

  static async updateStatus(
    reportId: string,
    status: ReportStatus,
    changedById: string,
    notes?: string,
  ) {
    const report = await prisma.report.findFirst({
      where: { id: reportId, isDeleted: false, isSpam: false },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const [updatedReport] = await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: { status },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true } },
          images: { take: 1 },
        },
      }),
      prisma.statusHistory.create({
        data: {
          reportId,
          previousStatus: report.status,
          newStatus: status,
          changedById,
          notes,
        },
      }),
    ]);

    if (report.reporterId) {
      await NotificationService.create({
        userId: report.reporterId,
        title: "Report Status Updated",
        message: `Your report "${report.title}" status changed to ${status.replace("_", " ")}`,
        type: "STATUS_CHANGE",
        reportId,
      });
    }

    if (status === ReportStatus.CLEANED) {
      const locationInfo = report.address ? ` (${report.address})` : "";
      await NotificationService.notifyAdmins(
        "Report Completed",
        `Report "${updatedReport.title}" has been marked as cleaned${locationInfo}. Cleanup completed at ${new Date().toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" })}.`,
        reportId,
        NotificationType.STATUS_CHANGE,
      );

      if (report.cleanupScheduleId) {
        const scheduleId = report.cleanupScheduleId;
        const [totalLinked, cleanedLinked] = await Promise.all([
          prisma.report.count({
            where: { cleanupScheduleId: scheduleId, isDeleted: false },
          }),
          prisma.report.count({
            where: {
              cleanupScheduleId: scheduleId,
              isDeleted: false,
              status: ReportStatus.CLEANED,
            },
          }),
        ]);

        if (totalLinked > 0 && cleanedLinked === totalLinked) {
          await prisma.cleanupSchedule.update({
            where: { id: scheduleId },
            data: {
              status: "COMPLETED",
              verifiedAt: new Date(),
              verifiedBy: { connect: { id: changedById } },
            },
          });

          await prisma.statusHistory.create({
            data: {
              reportId,
              newStatus: ReportStatus.CLEANED,
              notes: `Cleanup Schedule auto-completed: all linked reports marked as cleaned.`,
              changedById,
            },
          });
        }
      }
    }

    await GeoCache.invalidateAll();

    // ── Sync parent WasteIncident status ─────────────────────────────────────
    try {
      const updatedReportFull = await prisma.report.findUnique({
        where: { id: reportId },
        select: { incidentId: true },
      });
      if (updatedReportFull?.incidentId) {
        await ReportDedupService.syncIncidentStatus(updatedReportFull.incidentId);
      }
    } catch (syncError) {
      console.warn("[dedup] Failed to sync incident status for report", reportId, syncError);
    }

    // ── Propagate status to all sibling reports in the same incident ─────────
    // When an admin changes one report's status, all grouped reports follow.
    try {
      const { updatedCount } = await ReportDedupService.propagateStatusToSiblings(
        reportId,
        status,
        changedById,
      );
      if (updatedCount > 0) {
        console.log(`[dedup] Propagated status "${status}" to ${updatedCount} sibling report(s) in the same incident.`);
      }
    } catch (propagateError) {
      console.warn("[dedup] Failed to propagate status to siblings for report", reportId, propagateError);
    }

    return sanitizeReportForPrivacy(updatedReport);
  }

  static async getReports(filters: {
    page?: string;
    limit?: string;
    status?: ReportStatus;
    category?: WasteCategory;
    isSpam?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    await ReportSpamService.purgeExpiredSpamIfDue();
    const pagination = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: Prisma.ReportWhereInput = {
      isDeleted: false,
    };

    const isSpam =
      typeof filters.isSpam === "string"
        ? filters.isSpam === "true"
        : undefined;
    if (typeof isSpam === "boolean") {
      where.isSpam = isSpam;
    } else {
      where.isSpam = false;
    }

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (!Number.isNaN(startDate.getTime())) {
        createdAt.gte = startDate;
      }
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (!Number.isNaN(endDate.getTime())) {
        createdAt.lte = endDate;
      }
    }
    if (Object.keys(createdAt).length > 0) {
      where.createdAt = createdAt;
    }

    const search = filters.search?.trim();
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        {
          reporter: {
            is: { firstName: { contains: search, mode: "insensitive" } },
          },
        },
        {
          reporter: {
            is: { lastName: { contains: search, mode: "insensitive" } },
          },
        },
        {
          reporter: {
            is: { email: { contains: search, mode: "insensitive" } },
          },
        },
        {
          assignedTo: {
            is: { firstName: { contains: search, mode: "insensitive" } },
          },
        },
        {
          assignedTo: {
            is: { lastName: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedWorkers: {
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
          images: { take: 1 },
          _count: { select: { images: true, statusHistory: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.report.count({ where }),
    ]);

    const sanitizedReports = reports.map((r) => sanitizeReportForPrivacy(r));
    return buildPaginatedResponse(sanitizedReports, total, pagination);
  }

  static async assignWorker(
    reportId: string,
    workerIdsInput: string | string[],
    assignedById: string,
  ) {
    const report = await prisma.report.findFirst({
      where: { id: reportId, isDeleted: false },
      select: { id: true, title: true, isSpam: true },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.isSpam) {
      throw new Error("Report is marked as spam");
    }

    const rawWorkerIds = Array.isArray(workerIdsInput)
      ? workerIdsInput
      : workerIdsInput ? [workerIdsInput] : [];

    const workerIds = Array.from(new Set(rawWorkerIds.filter(Boolean)));

    const validWorkers = workerIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: { in: workerIds },
            role: Role.FIELD_WORKER,
            isActive: true,
          },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];

    const validWorkerIds = validWorkers.map((w) => w.id);

    if (validWorkerIds.length === 0) {
      throw new Error("At least one worker must be selected");
    }

    // Existing assigned workers for notification comparison
    const existingAssignments = await prisma.reportWorker.findMany({
      where: { reportId },
      select: { workerId: true },
    });
    const existingWorkerIds = new Set(existingAssignments.map((a) => a.workerId));

    const primaryWorkerId = validWorkerIds.length > 0 ? validWorkerIds[0] : null;

    await prisma.$transaction(async (tx) => {
      // Clear existing worker assignments for this report
      await tx.reportWorker.deleteMany({
        where: { reportId },
      });

      // Create new worker assignments
      if (validWorkerIds.length > 0) {
        await tx.reportWorker.createMany({
          data: validWorkerIds.map((workerId) => ({
            reportId,
            workerId,
          })),
        });
      }

      // Update legacy single worker ID reference
      await tx.report.update({
        where: { id: reportId },
        data: { assignedToId: primaryWorkerId },
      });
    });

    const updatedReport = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedWorkers: {
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
        images: { take: 1 },
      },
    });

    // Notify newly assigned workers
    const newlyAssigned = validWorkers.filter((w) => !existingWorkerIds.has(w.id));
    for (const worker of newlyAssigned) {
      await NotificationService.create({
        userId: worker.id,
        title: "New Cleanup Assignment",
        message: `You have been assigned to report "${report.title}".`,
        type: NotificationType.ASSIGNMENT,
        reportId,
      });
    }

    // ── Propagate worker assignment to all sibling reports in the same incident
    // When an admin assigns workers to one grouped report, all siblings follow.
    try {
      const { updatedCount } = await ReportDedupService.propagateWorkersToSiblings(
        reportId,
        validWorkerIds,
        primaryWorkerId,
      );
      if (updatedCount > 0) {
        console.log(`[dedup] Propagated ${validWorkerIds.length} worker(s) to ${updatedCount} sibling report(s) in the same incident.`);
      }
    } catch (propagateError) {
      console.warn("[dedup] Failed to propagate workers to siblings for report", reportId, propagateError);
    }

    return sanitizeReportForPrivacy(updatedReport!);
  }

  static async getMyReports(
    userId: string,
    filters: { page?: string; limit?: string; status?: ReportStatus },
  ) {
    await ReportSpamService.purgeExpiredSpamIfDue();
    const pagination = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: Prisma.ReportWhereInput = {
      reporterId: userId,
      isDeleted: false,
      isSpam: false,
    };
    if (filters.status) where.status = filters.status;

    let reports: Array<{ id: string; title: string; isSpam: boolean }> = [];
    let total = 0;

    try {
      [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            images: true,
            _count: { select: { images: true, statusHistory: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        prisma.report.count({ where }),
      ]);
    } catch (error) {
      const legacyWhere: Prisma.ReportWhereInput = { reporterId: userId };
      if (filters.status) legacyWhere.status = filters.status;

      [reports, total] = await Promise.all([
        prisma.report.findMany({
          where: legacyWhere,
          include: {
            images: true,
            _count: { select: { images: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        prisma.report.count({ where: legacyWhere }),
      ]);
      console.warn("getMyReports fallback query used:", error);
    }

    return buildPaginatedResponse(reports, total, pagination);
  }

  static async getAssignedReports(
    userId: string,
    filters: { page?: string; limit?: string; status?: ReportStatus },
  ) {
    await ReportSpamService.purgeExpiredSpamIfDue();
    const pagination = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: Prisma.ReportWhereInput = {
      OR: [
        { assignedToId: userId },
        { assignedWorkers: { some: { workerId: userId } } },
      ],
      isDeleted: false,
      isSpam: false,
    };
    if (filters.status) where.status = filters.status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true } },
          images: true,
          _count: { select: { images: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.report.count({ where }),
    ]);

    const sanitizedReports = reports.map((r) => sanitizeReportForPrivacy(r, userId));
    return buildPaginatedResponse(sanitizedReports, total, pagination);
  }

  static async softDelete(reportId: string) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error("Report not found");

    const deletedReport = await prisma.report.update({
      where: { id: reportId },
      data: { isDeleted: true },
    });

    await GeoCache.invalidateAll();
    return deletedReport;
  }
}
