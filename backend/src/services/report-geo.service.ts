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

export type IncidentMapData = {
  id: string;
  category: WasteCategory;
  status: ReportStatus;
  severity?: Severity | null;
  latitude: number;
  longitude: number;
  address: string | null;
  /** Number of unique citizen reports grouped into this incident */
  contributorCount: number;
  /** IDs of all linked Report rows */
  reportIds: string[];
  /** Thumbnail image from the first linked report */
  imageUrl: string | null;
  createdAt: Date;
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

  // ─── Incident-grouped map data ──────────────────────────────────────────────

  /**
   * Returns one entry per `WasteIncident` (deduplicated), instead of one per `Report`.
   * Used by the Leaflet map to show grouped markers with contributor-count badges.
   */
  static async getIncidentMapData(filters?: {
    status?: ReportStatus;
    category?: WasteCategory;
    limit?: string;
  }) {
    await ReportSpamService.purgeExpiredSpamIfDue();

    const parsedLimit = Number.parseInt(filters?.limit || "", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 5000)
      : 2000;

    const cacheKey = `bluewaste:geo:incidents:${JSON.stringify({
      status: filters?.status || null,
      category: filters?.category || null,
      limit,
    })}`;

    const cached = await GeoCache.get<IncidentMapData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: Prisma.WasteIncidentWhereInput = {
      isResolved: false,
    };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;

    let incidents: IncidentMapData[] = [];

    try {
      const raw = await prisma.wasteIncident.findMany({
        where,
        select: {
          id: true,
          category: true,
          status: true,
          severity: true,
          latitude: true,
          longitude: true,
          address: true,
          contributorCount: true,
          createdAt: true,
          reports: {
            where: { isDeleted: false, isSpam: false },
            select: {
              id: true,
              images: { take: 1, select: { imageUrl: true } },
            },
            orderBy: { createdAt: "asc" },
            take: 50, // cap linked reports per incident for performance
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      incidents = raw.map((inc) => {
        // Use the first report's image as the representative image
        const firstImageUrl =
          inc.reports.find((r) => r.images.length > 0)?.images[0]?.imageUrl ??
          null;

        return {
          id: inc.id,
          category: inc.category,
          status: inc.status,
          severity: inc.severity,
          latitude: inc.latitude,
          longitude: inc.longitude,
          address: inc.address,
          contributorCount: inc.contributorCount,
          reportIds: inc.reports.map((r) => r.id),
          imageUrl: firstImageUrl,
          createdAt: inc.createdAt,
        };
      });
    } catch (error) {
      console.warn("getIncidentMapData failed:", error);
      // Graceful fallback: return per-report map data as single-contributor incidents
      const reports = await this.getMapData(filters);
      incidents = reports.map((r) => ({
        id: r.id,
        category: r.category,
        status: r.status,
        severity: r.severity ?? null,
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        contributorCount: 1,
        reportIds: [r.id],
        imageUrl: r.images?.[0]?.imageUrl ?? null,
        createdAt: r.createdAt,
      }));
    }

    await GeoCache.set(cacheKey, incidents);
    return incidents;
  }
}
