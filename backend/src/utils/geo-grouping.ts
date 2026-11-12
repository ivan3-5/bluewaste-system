/**
 * GPS Radius Grouping Utilities for BlueWaste System
 *
 * Implements geodesic distance calculations using the Haversine formula and
 * spatial clustering to group waste reports within a configurable radius
 * (defaulting to 50 meters) for efficient cleanup operations.
 */

export interface GeoPoint {
  id: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export interface DistancePair {
  fromId: string;
  toId: string;
  distanceMeters: number;
}

export interface ReportDistanceInfo {
  reportId: string;
  distanceMeters: number;
}

export interface RadiusGroup<T extends GeoPoint = GeoPoint> {
  id: string;
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  reports: T[];
  reportCount: number;
  citizenCount: number;
  isGrouped: boolean;
  maxDistanceMeters: number;
  averageDistanceMeters: number;
  pairwiseDistances: DistancePair[];
  distancesFromCenter: ReportDistanceInfo[];
  barangay?: string;
}

export const DEFAULT_RADIUS_METERS = 50;

/**
 * Haversine formula: calculates the great-circle distance between two GPS coordinates in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const a =
    sinDLat * sinDLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLon * sinDLon;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place (10 cm precision)
}

/**
 * Human-readable distance formatter (e.g. "15 m", "48.2 m", "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1) return "< 1 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Checks if a coordinate is valid and non-zero
 */
export function isValidCoordinate(lat?: any, lng?: any): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = typeof lat === "number" ? lat : parseFloat(String(lat));
  const numLng = typeof lng === "number" ? lng : parseFloat(String(lng));
  if (isNaN(numLat) || isNaN(numLng)) return false;
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) return false;
  if (numLat === 0 && numLng === 0) return false;
  return true;
}

/**
 * Groups an array of reports based on a geographical radius threshold (default: 50 meters).
 *
 * Algorithm Guarantees:
 * 1. Each report is assigned to exactly one group (no duplicate grouping).
 * 2. Nearby reports within the radius threshold of the group cluster belong to the same group.
 * 3. Reports outside the radius threshold belong to a separate group.
 * 4. All original report attributes and citizen submission details are preserved.
 * 5. Full pairwise distances and distances from the group center are computed.
 */
export function groupReportsByRadius<T extends GeoPoint>(
  reports: T[],
  radiusMeters: number = DEFAULT_RADIUS_METERS,
): RadiusGroup<T>[] {
  const effectiveRadius = Math.max(1, radiusMeters);

  // Filter only valid coordinates
  const validReports = reports.filter((r) =>
    isValidCoordinate(r.latitude, r.longitude),
  );

  const assigned = new Set<string>();
  const groups: RadiusGroup<T>[] = [];

  // Deterministic sorting (by creation date or ID)
  const sortedReports = [...validReports].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return String(a.id).localeCompare(String(b.id));
  });

  for (let i = 0; i < sortedReports.length; i++) {
    const seed = sortedReports[i];
    if (assigned.has(seed.id)) continue;

    const groupMembers: T[] = [seed];
    assigned.add(seed.id);

    // Initial center is seed coordinate
    let centerLat = seed.latitude;
    let centerLng = seed.longitude;

    // Greedily find all unassigned reports within radius of seed / current center
    for (let j = 0; j < sortedReports.length; j++) {
      const candidate = sortedReports[j];
      if (assigned.has(candidate.id)) continue;

      const dist = haversineDistance(
        centerLat,
        centerLng,
        candidate.latitude,
        candidate.longitude,
      );

      if (dist <= effectiveRadius) {
        groupMembers.push(candidate);
        assigned.add(candidate.id);
      }
    }

    // Recalculate center as the true centroid of all members in the group
    const sumLat = groupMembers.reduce((sum, r) => sum + r.latitude, 0);
    const sumLng = groupMembers.reduce((sum, r) => sum + r.longitude, 0);
    const centroidLat = sumLat / groupMembers.length;
    const centroidLng = sumLng / groupMembers.length;

    // Check if any member would exceed effectiveRadius from centroid; if so, fallback to seed
    const allWithinCentroid = groupMembers.every(
      (m) =>
        haversineDistance(centroidLat, centroidLng, m.latitude, m.longitude) <=
        effectiveRadius,
    );

    const finalCenter = allWithinCentroid
      ? { latitude: centroidLat, longitude: centroidLng }
      : { latitude: seed.latitude, longitude: seed.longitude };

    // Compute pairwise distances between all members in this group
    const pairwiseDistances: DistancePair[] = [];
    let maxDistanceMeters = 0;
    let totalPairDistance = 0;
    let pairCount = 0;

    for (let a = 0; a < groupMembers.length; a++) {
      for (let b = a + 1; b < groupMembers.length; b++) {
        const d = haversineDistance(
          groupMembers[a].latitude,
          groupMembers[a].longitude,
          groupMembers[b].latitude,
          groupMembers[b].longitude,
        );
        pairwiseDistances.push({
          fromId: groupMembers[a].id,
          toId: groupMembers[b].id,
          distanceMeters: d,
        });
        if (d > maxDistanceMeters) maxDistanceMeters = d;
        totalPairDistance += d;
        pairCount++;
      }
    }

    // Compute distance from center for each report
    const distancesFromCenter: ReportDistanceInfo[] = groupMembers.map((m) => ({
      reportId: m.id,
      distanceMeters: haversineDistance(
        finalCenter.latitude,
        finalCenter.longitude,
        m.latitude,
        m.longitude,
      ),
    }));

    // Calculate unique citizen count
    const citizenIds = new Set<string>();
    let anonCount = 0;
    groupMembers.forEach((m: any) => {
      const rId = m.reporterId || m.reporter?.id;
      if (rId) citizenIds.add(rId);
      else if (m.isAnonymous) anonCount++;
    });
    const citizenCount = citizenIds.size + anonCount || groupMembers.length;

    // Derive representative barangay or address
    const representativeBarangay =
      groupMembers.find((m: any) => m.barangay)?.barangay ||
      groupMembers.find((m: any) => m.address)?.address ||
      undefined;

    groups.push({
      id: `group-${seed.id}`,
      center: finalCenter,
      radiusMeters: effectiveRadius,
      reports: groupMembers,
      reportCount: groupMembers.length,
      citizenCount,
      isGrouped: groupMembers.length > 1,
      maxDistanceMeters,
      averageDistanceMeters:
        pairCount > 0 ? Math.round((totalPairDistance / pairCount) * 10) / 10 : 0,
      pairwiseDistances,
      distancesFromCenter,
      barangay: representativeBarangay,
    });
  }

  return groups;
}

