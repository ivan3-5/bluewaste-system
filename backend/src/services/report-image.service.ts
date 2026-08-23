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

    const uploadPromises = files.map(async (file, index) => {
      const result = await CloudinaryService.uploadImage(file.buffer);

      // If typeParam is explicitly passed as something else (e.g. "AFTER_CLEANUP"), respect it.
      // Otherwise, the first image is "REPORT", and subsequent images are "ANGLE".
      let imageType = typeParam;
      if (!imageType || imageType === "REPORT") {
        imageType = index === 0 ? "REPORT" : "ANGLE";
      }

      return prisma.reportImage.create({
        data: {
          reportId,
          imageUrl: result.url,
          publicId: result.publicId,
          type: imageType as ImageType,
        },
      });
    });

    const images = await Promise.all(uploadPromises);

    // Run analysis asynchronously in the background so image upload response is fast and doesn't time out
    ReportAnalysisService.analyzeReport(reportId).catch((err) => {
      logger.warn({ err, reportId }, "Auto analysis failed for report");
    });

    return images;
  }
}
