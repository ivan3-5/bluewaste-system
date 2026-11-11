import prisma from "../config/database";
import { ImageType, Prisma } from "@prisma/client";
import { CloudinaryService } from "./cloudinary.service";
import { ReportAnalysisService } from "./report-analysis.service";
import { logger } from "../utils/logger";

const MAX_PHOTOS_PER_TYPE = 5;
export const REPORT_PHOTO_LIMIT_MESSAGE = `You can attach up to ${MAX_PHOTOS_PER_TYPE} photos of each type per report.`;

export class ReportImageService {
  static async addImagesToReport(
    reportId: string,
    files: Express.Multer.File[] | undefined,
    requester: { id?: string; role?: string } | undefined,
    typeParam?: string,
  ) {
    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        reporterId: true,
        assignedToId: true,
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const requesterId = requester?.id;
    const requesterRole = requester?.role;
    const type = typeParam === "CLEANUP" ? ImageType.CLEANUP : ImageType.REPORT;
    const isAssignedWorker =
      type === ImageType.CLEANUP && requesterRole === "FIELD_WORKER" &&
      !!requesterId && (report.assignedToId === requesterId || !!await prisma.reportWorker.findUnique({
        where: { reportId_workerId: { reportId, workerId: requesterId } },
        select: { id: true },
      }));

    const canUpload =
      requesterRole === "LGU_ADMIN" ||
      (!!requesterId && (report.reporterId === requesterId || report.assignedToId === requesterId)) ||
      isAssignedWorker;

    if (!canUpload) {
      throw new Error("Insufficient permissions.");
    }

    const where = { reportId, type };
    const existingCount = await prisma.reportImage.count({ where });
    if (existingCount + files.length > MAX_PHOTOS_PER_TYPE) {
      throw new Error(REPORT_PHOTO_LIMIT_MESSAGE);
    }

    const uploads = await Promise.allSettled(
      files.map((file) => CloudinaryService.uploadImage(file.buffer)),
    );
    const uploaded = uploads.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    const failedUpload = uploads.find((result) => result.status === "rejected");

    try {
      if (failedUpload) throw failedUpload.reason;

      const { images, isFirstReportPhoto } = await prisma.$transaction(async (tx) => {
        // Serialize attachment counts across simultaneous uploads to this report.
        await tx.$queryRaw`SELECT id FROM "Report" WHERE id = ${reportId} FOR UPDATE`;
        const count = await tx.reportImage.count({ where });
        if (count + uploaded.length > MAX_PHOTOS_PER_TYPE) {
          throw new Error(REPORT_PHOTO_LIMIT_MESSAGE);
        }
        const images = await Promise.all(uploaded.map(({ url, publicId }) =>
          tx.reportImage.create({ data: { ...where, imageUrl: url, publicId } }),
        ));
        return { images, isFirstReportPhoto: type === ImageType.REPORT && count === 0 };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

      if (isFirstReportPhoto) {
        ReportAnalysisService.analyzeReport(reportId).catch((err) => {
          logger.warn({ err, reportId }, "Auto analysis failed for report");
        });
      }
      return images;
    } catch (error) {
      await Promise.all(uploaded.map(({ publicId }) =>
        CloudinaryService.deleteImage(publicId).catch((err) => {
          logger.warn({ err, publicId }, "Could not remove an unlinked report photo");
        }),
      ));
      throw error;
    }
  }
}
