import prisma from "../config/database";

export interface ZonePoint {
  lat: number;
  lng: number;
}

export const OUTSIDE_ZONE_MESSAGE =
  "Reports can only be submitted within the designated reporting zones.";

function pointInRing(lat: number, lng: number, ring: ZonePoint[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lng;
    const yi = ring[i].lat;
    const xj = ring[j].lng;
    const yj = ring[j].lat;
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export class ReportingZoneService {
  /** True only if the point lies inside at least one active zone (no zones => false). */
  static async isInsideActiveZone(lat: number, lng: number): Promise<boolean> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    const zones = await prisma.reportingZone.findMany({
      where: { isActive: true },
      select: { coordinates: true },
    });
    return zones.some((zone) => {
      const raw = zone.coordinates;
      if (!Array.isArray(raw)) return false;
      const ring = (raw as unknown[]).filter(
        (c): c is ZonePoint =>
          !!c &&
          typeof (c as ZonePoint).lat === "number" &&
          typeof (c as ZonePoint).lng === "number",
      );
      return ring.length >= 3 && pointInRing(lat, lng, ring);
    });
  }

  static async list(activeOnly = true) {
    return prisma.reportingZone.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        coordinates: true,
        isActive: true,
        createdAt: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  static async create(data: {
    name: string;
    coordinates: ZonePoint[];
    createdById: string;
  }) {
    if (!data.name?.trim()) throw new Error("Zone name is required");
    if (!Array.isArray(data.coordinates) || data.coordinates.length < 3) {
      throw new Error("A zone needs at least 3 coordinate points");
    }

    return prisma.reportingZone.create({
      data: {
        name: data.name.trim(),
        coordinates: data.coordinates as object[],
        createdById: data.createdById,
      },
    });
  }

  static async update(
    id: string,
    data: { name?: string; coordinates?: ZonePoint[]; isActive?: boolean },
  ) {
    const zone = await prisma.reportingZone.findUnique({ where: { id } });
    if (!zone) throw new Error("Reporting zone not found");

    if (data.coordinates !== undefined && data.coordinates.length < 3) {
      throw new Error("A zone needs at least 3 coordinate points");
    }

    return prisma.reportingZone.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.coordinates !== undefined
          ? { coordinates: data.coordinates as object[] }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  static async delete(id: string) {
    const zone = await prisma.reportingZone.findUnique({ where: { id } });
    if (!zone) throw new Error("Reporting zone not found");
    await prisma.reportingZone.delete({ where: { id } });
  }
}
