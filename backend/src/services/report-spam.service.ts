import prisma from "../config/database";
import { env } from "../config/env";
import { GeoCache } from "../utils/geo-cache";

export class ReportSpamService {
  private static readonly SPAM_RETENTION_MS =
    env.SPAM_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  private static readonly SPAM_PURGE_INTERVAL_MS = 60 * 60 * 1000;
  private static lastSpamPurgeAt = 0;

  static async purgeExpiredSpamIfDue() {
    const now = Date.now();
    if (now - this.lastSpamPurgeAt < this.SPAM_PURGE_INTERVAL_MS) {
      return;
    }

    this.lastSpamPurgeAt = now;
    try {
      await this.purgeExpiredSpamReports();
    } catch (error) {
      console.warn("Failed background spam purge:", error);
    }
  }

  static async purgeExpiredSpamReports() {
    const cutoff = new Date(Date.now() - this.SPAM_RETENTION_MS);

    const result = await prisma.report.updateMany({
      where: {
        isDeleted: false,
        isSpam: true,
        spamMarkedAt: {
          not: null,
          lte: cutoff,
        },
      },
      data: {
        isDeleted: true,
      },
    });

    if (result.count > 0) {
      await GeoCache.invalidateAll();
    }

    return result.count;
  }

  static async restoreSpam(reportId: string) {
    const report = await prisma.report.findFirst({
      where: { id: reportId, isDeleted: false, isSpam: true },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        isSpam: false,
        spamMarkedAt: null,
        spamReason: null,
      },
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

    await GeoCache.invalidateAll();

    return updated;
  }
}
