import prisma from "../config/database";
import { ImageType } from "@prisma/client";
import { CloudinaryService } from "./cloudinary.service";
import { ReportAnalysisService } from "./report-analysis.service";
import { logger } from "../utils/logger";

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

    const canUpload =
      requesterRole === "LGU_ADMIN" ||
      report.reporterId === requesterId ||
      report.assignedToId === requesterId;

    if (!canUpload) {
      throw new Error("Insufficient permissions.");
    }

    const uploadPromises = files.map(async (file) => {
      const result = await CloudinaryService.uploadImage(file.buffer);
      return prisma.reportImage.create({
        data: {
          reportId,
          imageUrl: result.url,
          publicId: result.publicId,
          type: (typeParam || "REPORT") as ImageType,
        },
      });
    });

    const images = await Promise.all(uploadPromises);

    // Auto-run analysis on the report after images are uploaded
    try {
      await ReportAnalysisService.analyzeReport(reportId);
    } catch (err) {
      logger.warn({ err, reportId }, "Auto analysis failed for report");
    }

    return images;
  }
}
