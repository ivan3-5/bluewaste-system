import prisma from "../config/database";
import { ReportStatus, WasteCategory, Severity, Prisma } from "@prisma/client";
import { GeoCache } from "../utils/geo-cache";
import { ReportSpamService } from "./report-spam.service";

export type ReportMapData = {
  id: string;
  title: string;
  description?: string;
  aiReason?: string | null;
  category: WasteCategory;
  status: ReportStatus;
  severity?: Severity | null;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: Date;
  updatedAt?: Date;
  images: { imageUrl: string }[];
};

export class ReportGeoService {
  static async getMapData(filters?: {
    status?: ReportStatus;
    category?: WasteCategory;
    limit?: string;
  }) {
    await ReportSpamService.purgeExpiredSpamIfDue();
    const parsedLimit = Number.parseInt(filters?.limit || "", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 5000)
      : 2000;

    const cacheKey = `bluewaste:geo:map:${JSON.stringify({
      status: filters?.status || null,
      category: filters?.category || null,
      limit,
    })}`;

    const cached = await GeoCache.get<ReportMapData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: Prisma.ReportWhereInput = {
      isDeleted: false,
      isSpam: false,
      status: { not: ReportStatus.CLEANED },
    };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;

    let reports: ReportMapData[] = [];

    try {
      reports = (await prisma.report.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          aiReason: true,
          category: true,
          status: true,
          severity: true,
          latitude: true,
          longitude: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          images: { take: 1, select: { imageUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      })) as unknown as ReportMapData[];
    } catch (error) {
      // Backward-compatible fallback for deployments with older DB schema.
      const legacyWhere: Prisma.ReportWhereInput = {};
      if (filters?.status) legacyWhere.status = filters.status;
      if (filters?.category) legacyWhere.category = filters.category;

      if (!filters?.status) {
        legacyWhere.status = { not: ReportStatus.CLEANED };
      }

      reports = await prisma.report.findMany({
        where: legacyWhere,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          status: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          images: { take: 1, select: { imageUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }) as unknown as ReportMapData[];

      console.warn("getMapData fallback query used:", error);
    }

    await GeoCache.set(cacheKey, reports);

    return reports;
  }

  static async getHeatmapData(filters?: { limit?: string }) {
    await ReportSpamService.purgeExpiredSpamIfDue();

    const cacheKey = `bluewaste:geo:heatmap:${JSON.stringify({
      limit: filters?.limit || null,
    })}`;

    const cached = await GeoCache.get<Array<{ lat: number; lng: number; intensity: number }>>(cacheKey);
    if (cached) {
      return cached;
    }

    const parsedLimit = Number.parseInt(filters?.limit || "", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 10000)
      : 5000;

    const reports = await prisma.report.findMany({
      where: {
        isDeleted: false,
        isSpam: false,
        status: { not: ReportStatus.CLEANED },
      },
      select: {
        latitude: true,
        longitude: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }) as unknown as ReportMapData[];

    const heatmapData = reports.map((r) => ({
      lat: r.latitude,
      lng: r.longitude,
      intensity: 0.5,
    }));

    await GeoCache.set(cacheKey, heatmapData);

    return heatmapData;
  }
}
