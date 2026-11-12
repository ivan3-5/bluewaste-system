import { describe, it, expect } from "vitest";
import {
  haversineDistance,
  formatDistance,
  isValidCoordinate,
  groupReportsByRadius,
  DEFAULT_RADIUS_METERS,
} from "./geo-grouping";

describe("Frontend geo-grouping library", () => {
  it("calculates accurate Haversine distance in meters", () => {
    // Cagangohan Barangay Hall to Point 35m away
    const lat1 = 7.3032;
    const lon1 = 125.6811;
    const lat2 = 7.3034;
    const lon2 = 125.6813;
    const dist = haversineDistance(lat1, lon1, lat2, lon2);
    expect(dist).toBeGreaterThan(25);
    expect(dist).toBeLessThan(40);
  });

  it("formats distances cleanly", () => {
    expect(formatDistance(32.456)).toBe("32 m");
    expect(formatDistance(1250)).toBe("1.3 km");
  });

  it("validates GPS coordinates", () => {
    expect(isValidCoordinate(7.3032, 125.6811)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(false);
    expect(isValidCoordinate(95, 125)).toBe(false);
    expect(isValidCoordinate(NaN, 125)).toBe(false);
  });

  it("groups reports within 50-meter radius and isolates reports outside radius", () => {
    const reports = [
      {
        id: "rep-1",
        latitude: 7.3032,
        longitude: 125.6811,
        title: "Report 1",
        createdAt: "2026-11-01T10:00:00Z",
      },
      {
        id: "rep-2",
        // ~25m away from rep-1
        latitude: 7.30335,
        longitude: 125.6812,
        title: "Report 2",
        createdAt: "2026-11-01T10:05:00Z",
      },
      {
        id: "rep-far",
        // ~600m away
        latitude: 7.308,
        longitude: 125.685,
        title: "Report Far",
        createdAt: "2026-11-01T10:10:00Z",
      },
    ];

    const groups = groupReportsByRadius(reports, 50);

    // Group 1 has rep-1 and rep-2
    const clusteredGroup = groups.find((g) => g.isGrouped);
    expect(clusteredGroup).toBeDefined();
    expect(clusteredGroup?.reports.length).toBe(2);
    expect(clusteredGroup?.radiusMeters).toBe(50);
    expect(clusteredGroup?.pairwiseDistances.length).toBe(1);
    expect(clusteredGroup?.pairwiseDistances[0].distanceMeters).toBeLessThanOrEqual(50);

    // rep-far is isolated in its own separate group
    const farGroup = groups.find((g) => g.reports.some((r) => r.id === "rep-far"));
    expect(farGroup).toBeDefined();
    expect(farGroup?.isGrouped).toBe(false);
    expect(farGroup?.reports.length).toBe(1);

    // Prevention of duplicate grouping: total reports across groups equals input
    const allAssignedIds = groups.flatMap((g) => g.reports.map((r) => r.id));
    expect(allAssignedIds.length).toBe(3);
    expect(new Set(allAssignedIds).size).toBe(3);
  });
});

