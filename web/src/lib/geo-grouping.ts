/**
 * GPS Radius Grouping Utilities for BlueWaste Web Frontend
 *
 * Implements Haversine distance calculations and spatial clustering to group
 * nearby waste reports within a configurable radius (default: 50 meters).
 */

import { CleanupRadiusGroup, DistancePair, ReportDistanceInfo } from "@/types";

export interface GeoPoint {
  id: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export const DEFAULT_RADIUS_METERS = 50;

/**
 * Haversine formula: great-circle distance between two GPS coordinates in meters.
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
  return Math.round(R * c * 10) / 10;
}

/**
 * Human-readable distance formatter (e.g. "18 m", "45.2 m", "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1) return "< 1 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Validates GPS latitude and longitude
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
 * Groups an array of reports based on GPS radius (default: 50 meters).
 *
 * Requirements satisfied:
 * - 50-meter default radius (configurable)
 * - Nearby reports within radius grouped into one cleanup area
 * - Reports outside radius belong to separate groups
 * - Avoids duplicate grouping of the same report
 * - Preserves all original report details and citizen submission information
 * - Computes pairwise distances between reports and distances from center
 */
export function groupReportsByRadius<T extends GeoPoint>(
  reports: T[],
  radiusMeters: number = DEFAULT_RADIUS_METERS,
): CleanupRadiusGroup<T>[] {
  const effectiveRadius = Math.max(1, radiusMeters);

  const validReports = reports.filter((r) =>
    isValidCoordinate(r.latitude, r.longitude),
  );

  const assigned = new Set<string>();
  const groups: CleanupRadiusGroup<T>[] = [];

  // Deterministic sorting
  const sortedReports = [...validReports].sort((a, b) => {
    const timeA = a.createdAt || a.reportedAt ? new Date(a.createdAt || a.reportedAt).getTime() : 0;
    const timeB = b.createdAt || b.reportedAt ? new Date(b.createdAt || b.reportedAt).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return String(a.id).localeCompare(String(b.id));
  });

  for (let i = 0; i < sortedReports.length; i++) {
    const seed = sortedReports[i];
    if (assigned.has(seed.id)) continue;

    const groupMembers: T[] = [seed];
    assigned.add(seed.id);

    let centerLat = seed.latitude;
    let centerLng = seed.longitude;

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

    // Centroid of all members in the group
    const sumLat = groupMembers.reduce((sum, r) => sum + r.latitude, 0);
    const sumLng = groupMembers.reduce((sum, r) => sum + r.longitude, 0);
    const centroidLat = sumLat / groupMembers.length;
    const centroidLng = sumLng / groupMembers.length;

    // Verify all members fall within effectiveRadius of centroid
    const allWithinCentroid = groupMembers.every(
      (m) =>
        haversineDistance(centroidLat, centroidLng, m.latitude, m.longitude) <=
        effectiveRadius,
    );

    const finalCenter = allWithinCentroid
      ? { latitude: centroidLat, longitude: centroidLng }
      : { latitude: seed.latitude, longitude: seed.longitude };

    // Pairwise distances
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
        const titleA = (groupMembers[a] as any).title || (groupMembers[a] as any).locationName || "Report";
        const titleB = (groupMembers[b] as any).title || (groupMembers[b] as any).locationName || "Report";
        pairwiseDistances.push({
          fromId: groupMembers[a].id,
          toId: groupMembers[b].id,
          distanceMeters: d,
          reportATitle: titleA,
          reportBTitle: titleB,
        });
        if (d > maxDistanceMeters) maxDistanceMeters = d;
        totalPairDistance += d;
        pairCount++;
      }
    }

    // Distances from group center
    const distancesFromCenter: ReportDistanceInfo[] = groupMembers.map((m) => {
      const d = haversineDistance(
        finalCenter.latitude,
        finalCenter.longitude,
        m.latitude,
        m.longitude,
      );
      return {
        reportId: m.id,
        distanceMeters: d,
        distanceFromCenterMeters: d,
      };
    });

    // Unique citizen count
    const citizenIds = new Set<string>();
    let anonCount = 0;
    groupMembers.forEach((m: any) => {
      const rId = m.reporterId || m.reporter?.id;
      if (rId) citizenIds.add(rId);
      else if (m.isAnonymous) anonCount++;
    });
    const citizenCount = citizenIds.size + anonCount || groupMembers.length;

    const representativeBarangay =
      groupMembers.find((m: any) => m.barangay)?.barangay ||
      groupMembers.find((m: any) => m.locationName)?.locationName ||
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
      maxSpreadMeters: maxDistanceMeters,
      averageDistanceMeters:
        pairCount > 0 ? Math.round((totalPairDistance / pairCount) * 10) / 10 : 0,
      pairwiseDistances,
      distancesFromCenter,
      barangay: representativeBarangay,
    });
  }

  return groups;
}

