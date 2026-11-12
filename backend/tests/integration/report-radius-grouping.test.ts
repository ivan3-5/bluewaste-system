import { describe, expect, it } from "vitest";
import {
  haversineDistance,
  formatDistance,
  groupReportsByRadius,
  DEFAULT_RADIUS_METERS,
} from "../../src/utils/geo-grouping";

describe("GPS 50-Meter Radius Grouping Feature", () => {
  // Test coordinates in Panabo City coastal sector (Brgy. Cagangohan / San Pedro)
  // Seed coordinate: 7.301200, 125.684500
  // ~20m north: 7.301380, 125.684500
  // ~40m east: 7.301200, 125.684860
  // ~120m away (outside 50m radius): 7.302280, 125.684500
  // ~200m away (another cluster): 7.303000, 125.684500 and 7.303150, 125.684500 (~16m apart)

  const report1 = {
    id: "rep-1",
    title: "Plastic bottles near Cagangohan shoreline",
    description: "Citizen reported plastic bottles",
    category: "with_waste",
    status: "VERIFIED",
    latitude: 7.3012,
    longitude: 125.6845,
    address: "Cagangohan Coastal Area",
    reporterId: "citizen-1",
    reporter: { id: "citizen-1", firstName: "Maria", lastName: "Santos" },
    isAnonymous: false,
    createdAt: new Date("2026-11-01T08:00:00Z"),
  };

  const report2 = {
    id: "rep-2",
    title: "Sachets and wrappers by the seawall",
    description: "Second report 20m from first report",
    category: "with_waste",
    status: "VERIFIED",
    latitude: 7.30138,
    longitude: 125.6845,
    address: "Cagangohan Seawall",
    reporterId: "citizen-2",
    reporter: { id: "citizen-2", firstName: "Juan", lastName: "Dela Cruz" },
    isAnonymous: false,
    createdAt: new Date("2026-11-01T09:30:00Z"),
  };

  const report3 = {
    id: "rep-3",
    title: "Fishing lines and netting near boat launch",
    description: "Third report 40m from first report",
    category: "with_waste",
    status: "VERIFIED",
    latitude: 7.3012,
    longitude: 125.68486,
    address: "Cagangohan Boat Ramp",
    reporterId: "citizen-3",
    reporter: { id: "citizen-3", firstName: "Pedro", lastName: "Penduko" },
    isAnonymous: false,
    createdAt: new Date("2026-11-01T10:00:00Z"),
  };

  const reportOutsideRadius = {
    id: "rep-outside",
    title: "Debris near San Pedro bridge",
    description: "Located ~120m north, outside the 50m radius",
    category: "with_waste",
    status: "VERIFIED",
    latitude: 7.30228,
    longitude: 125.6845,
    address: "San Pedro Bridge shoreline",
    reporterId: "citizen-4",
    reporter: { id: "citizen-4", firstName: "Ana", lastName: "Reyes" },
    isAnonymous: false,
    createdAt: new Date("2026-11-01T11:00:00Z"),
  };

  const cluster2ReportA = {
    id: "rep-cluster2-a",
    title: "Cluster 2 report A",
    category: "with_waste",
    status: "VERIFIED",
    latitude: 7.303,
    longitude: 125.6845,
    address: "San Pedro Pier",
    reporterId: "citizen-5",
    isAnonymous: false,
    createdAt: new Date("2026-11-02T08:00:00Z"),
  };

  const cluster2ReportB = {
    id: "rep-cluster2-b",
    title: "Cluster 2 report B (~16m from A)",
    category: "with_waste",
    status: "VERIFIED",
    latitude: 7.30315,
    longitude: 125.6845,
    address: "San Pedro Pier North",
    reporterId: "citizen-6",
    isAnonymous: false,
    createdAt: new Date("2026-11-02T08:15:00Z"),
  };

  describe("1. Haversine Distance Calculation", () => {
    it("returns 0 for identical GPS coordinates", () => {
      const d = haversineDistance(7.3012, 125.6845, 7.3012, 125.6845);
      expect(d).toBe(0);
    });

    it("calculates accurate geographical distances in meters", () => {
      // 7.301200 to 7.301380 is ~20 meters
      const dist20m = haversineDistance(7.3012, 125.6845, 7.30138, 125.6845);
      expect(dist20m).toBeGreaterThan(18);
      expect(dist20m).toBeLessThan(22);

      // 7.301200, 125.6845 to 7.301200, 125.68486 is ~39.7 meters
      const dist40m = haversineDistance(7.3012, 125.6845, 7.3012, 125.68486);
      expect(dist40m).toBeGreaterThan(38);
      expect(dist40m).toBeLessThan(42);

      // Distance to outside report is ~120m
      const distOutside = haversineDistance(
        7.3012,
        125.6845,
        7.30228,
        125.6845,
      );
      expect(distOutside).toBeGreaterThan(115);
      expect(distOutside).toBeLessThan(125);
    });

    it("formats distances cleanly for UI presentation", () => {
      expect(formatDistance(15.4)).toBe("15 m");
      expect(formatDistance(48)).toBe("48 m");
      expect(formatDistance(1500)).toBe("1.5 km");
      expect(formatDistance(0.5)).toBe("< 1 m");
    });
  });

  describe("2. Radius-Based Grouping (50-Meter Default)", () => {
    it("uses 50 meters as default radius", () => {
      expect(DEFAULT_RADIUS_METERS).toBe(50);
    });

    it("groups nearby waste reports that fall within the same 50-meter cleanup area", () => {
      const allReports = [report1, report2, report3, reportOutsideRadius];
      const groups = groupReportsByRadius(allReports, 50);

      // Expect 2 groups:
      // Group 1: report1, report2, report3 (all within 50m of cluster seed)
      // Group 2: reportOutsideRadius (120m away, outside radius)
      expect(groups.length).toBe(2);

      const group1 = groups.find((g) => g.reports.some((r) => r.id === "rep-1"))!;
      expect(group1).toBeDefined();
      expect(group1.reportCount).toBe(3);
      expect(group1.isGrouped).toBe(true);
      expect(group1.reports.map((r) => r.id)).toEqual(
        expect.arrayContaining(["rep-1", "rep-2", "rep-3"]),
      );

      const groupOutside = groups.find((g) =>
        g.reports.some((r) => r.id === "rep-outside"),
      )!;
      expect(groupOutside).toBeDefined();
      expect(groupOutside.reportCount).toBe(1);
      expect(groupOutside.isGrouped).toBe(false);
    });

    it("reports outside the radius belong to a separate group", () => {
      const allReports = [
        report1,
        report2,
        reportOutsideRadius,
        cluster2ReportA,
        cluster2ReportB,
      ];
      const groups = groupReportsByRadius(allReports, 50);

      // Group A: rep-1, rep-2
      // Group B: rep-outside (isolated)
      // Group C: rep-cluster2-a, rep-cluster2-b
      expect(groups.length).toBe(3);

      const cluster1 = groups.find((g) => g.reports.some((r) => r.id === "rep-1"))!;
      const cluster2 = groups.find((g) =>
        g.reports.some((r) => r.id === "rep-cluster2-a"),
      )!;
      const isolated = groups.find((g) =>
        g.reports.some((r) => r.id === "rep-outside"),
      )!;

      expect(cluster1.reportCount).toBe(2);
      expect(cluster2.reportCount).toBe(2);
      expect(isolated.reportCount).toBe(1);
    });

    it("avoids duplicate grouping of the same waste report", () => {
      const allReports = [
        report1,
        report2,
        report3,
        reportOutsideRadius,
        cluster2ReportA,
        cluster2ReportB,
      ];
      const groups = groupReportsByRadius(allReports, 50);

      // Verify each report appears exactly once across all groups
      const allAssignedIds = groups.flatMap((g) => g.reports.map((r) => r.id));
      const uniqueIds = new Set(allAssignedIds);

      expect(allAssignedIds.length).toBe(allReports.length);
      expect(uniqueIds.size).toBe(allReports.length);
    });

    it("ensures each report retains its original citizen submission and report details", () => {
      const groups = groupReportsByRadius([report1, report2], 50);
      const group = groups[0];

      const r1 = group.reports.find((r) => r.id === "rep-1")!;
      expect(r1.title).toBe(report1.title);
      expect(r1.description).toBe(report1.description);
      expect(r1.reporterId).toBe("citizen-1");
      expect(r1.reporter?.firstName).toBe("Maria");
      expect(r1.reporter?.lastName).toBe("Santos");
      expect(r1.address).toBe("Cagangohan Coastal Area");

      const r2 = group.reports.find((r) => r.id === "rep-2")!;
      expect(r2.reporter?.firstName).toBe("Juan");
    });

    it("calculates pairwise distances between relevant report locations in a group", () => {
      const groups = groupReportsByRadius([report1, report2, report3], 50);
      const group = groups[0];

      expect(group.pairwiseDistances.length).toBe(3); // (3 choose 2) = 3 pairs
      expect(group.maxDistanceMeters).toBeGreaterThan(0);
      expect(group.maxDistanceMeters).toBeLessThanOrEqual(50);

      // Check distance from center
      expect(group.distancesFromCenter.length).toBe(3);
      group.distancesFromCenter.forEach((info) => {
        expect(info.distanceMeters).toBeLessThanOrEqual(50);
      });
    });

    it("supports a configurable radius", () => {
      // With radius = 10m, rep-1 and rep-2 (~20m apart) should NOT group
      const tightGroups = groupReportsByRadius([report1, report2], 10);
      expect(tightGroups.length).toBe(2);

      // With radius = 150m, all 4 reports should merge into 1 group
      const wideGroups = groupReportsByRadius(
        [report1, report2, report3, reportOutsideRadius],
        150,
      );
      expect(wideGroups.length).toBe(1);
      expect(wideGroups[0].reportCount).toBe(4);
    });
  });
});

