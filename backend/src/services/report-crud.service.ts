import prisma from "../config/database";
import { ReportStatus, WasteCategory, Prisma, Role, NotificationType, Severity, AnalysisStatus } from "@prisma/client";
import { getPaginationParams, buildPaginatedResponse } from "../utils/pagination";
import { NotificationService } from "./notification.service";
import { GeoCache } from "../utils/geo-cache";
import { ReportSpamService } from "./report-spam.service";

type Viewer = {
  id: string;
  role: string;
};

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
      const created = await tx.report.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          isAnonymous: data.isAnonymous || false,
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
          reporterId: data.isAnonymous ? null : data.reporterId,
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

    return report;
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
    return updatedReport;
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
          images: { take: 1 },
          _count: { select: { images: true, statusHistory: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.report.count({ where }),
    ]);

    return buildPaginatedResponse(reports, total, pagination);
  }

  static async assignWorker(
    reportId: string,
    assignedToId: string,
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

    const worker = await prisma.user.findFirst({
      where: { id: assignedToId, role: Role.FIELD_WORKER, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!worker) {
      throw new Error("Field worker not found");
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { assignedToId: worker.id },
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
        images: { take: 1 },
      },
    });

    await NotificationService.create({
      userId: worker.id,
      title: "New Cleanup Assignment",
      message: `You have been assigned to report "${report.title}".`,
      type: NotificationType.ASSIGNMENT,
      reportId,
    });

    return updatedReport;
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
      assignedToId: userId,
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

    return buildPaginatedResponse(reports, total, pagination);
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
