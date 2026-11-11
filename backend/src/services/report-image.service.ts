import prisma from "../config/database";
import { createHash } from "node:crypto";
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
    clientUploadId?: unknown,
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
    const digest = files.length === 1 && typeof clientUploadId === "string" &&
      /^[a-zA-Z0-9_-]{1,96}$/.test(clientUploadId)
      ? createHash("sha256").update(JSON.stringify([reportId, type, requesterId, clientUploadId])).digest("hex")
      : null;
    const imageId = digest?.replace(/^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12}).*$/, "$1-$2-$3-$4-$5");
    if (imageId) {
      const saved = await prisma.reportImage.findUnique({ where: { id: imageId } });
      if (saved) return [saved];
    }
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

      const { images, isFirstReportPhoto, duplicate } = await prisma.$transaction(async (tx) => {
        // Serialize attachment counts across simultaneous uploads to this report.
        await tx.$queryRaw`SELECT id FROM "Report" WHERE id = ${reportId} FOR UPDATE`;
        if (imageId) {
          const saved = await tx.reportImage.findUnique({ where: { id: imageId } });
          if (saved) return { images: [saved], isFirstReportPhoto: false, duplicate: true };
        }
        const count = await tx.reportImage.count({ where });
        if (count + uploaded.length > MAX_PHOTOS_PER_TYPE) {
          throw new Error(REPORT_PHOTO_LIMIT_MESSAGE);
        }
        const images = await Promise.all(uploaded.map(({ url, publicId }) =>
          tx.reportImage.create({ data: { ...where, id: imageId, imageUrl: url, publicId } }),
        ));
        return { images, isFirstReportPhoto: type === ImageType.REPORT && count === 0, duplicate: false };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

      if (duplicate) await this.removeUnlinkedPhotos(uploaded);
      if (isFirstReportPhoto) {
        ReportAnalysisService.analyzeReport(reportId).catch((err) => {
          logger.warn({ err, reportId }, "Auto analysis failed for report");
        });
      }
      return images;
    } catch (error) {
      await this.removeUnlinkedPhotos(uploaded);
      throw error;
    }
  }

  private static async removeUnlinkedPhotos(photos: { publicId: string }[]) {
    await Promise.all(photos.map(({ publicId }) =>
      CloudinaryService.deleteImage(publicId).catch((err) => {
        logger.warn({ err, publicId }, "Could not remove an unlinked report photo");
      }),
    ));
  }
}
