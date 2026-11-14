import { describe, expect, it, vi } from "vitest";
import {
  isSpamNotification,
  getNotificationReportHref,
} from "@/lib/notifications";
import type { Notification } from "@/types";
import { GET } from "@/app/api/reports/route";
import { GET as getStatsRoute } from "@/app/api/dashboard/stats/route";
import { getDashboardCategoryDistribution } from "@/lib/dashboard-reports";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  default: {
    report: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    $queryRaw: vi.fn(),
  },
}));

describe("Spam Notification Identification and Navigation", () => {
  const spamReportId = "38436f4c-1234-5678-9abc-def012345678";
  const regularReportId = "e1790c20-8765-4321-ba98-fedcba098765";

  describe("isSpamNotification", () => {
    it("identifies spam notification when report.isSpam is true", () => {
      const notification: Notification = {
        id: "notif-1",
        title: "Report Update",
        message: "Status update on your submission",
        type: "SYSTEM",
        isRead: false,
        reportId: spamReportId,
        report: {
          id: spamReportId,
          title: "Waste report",
          status: "REJECTED",
          isSpam: true,
        },
        createdAt: new Date().toISOString(),
      };

      expect(isSpamNotification(notification)).toBe(true);
    });

    it("identifies spam notification by 'New Spam Report' title (as seen in dashboard)", () => {
      const notification: Notification = {
        id: "notif-2",
        title: "New Spam Report",
        message: 'A new report flagged as spam has been submitted: "Waste report"',
        type: "SYSTEM",
        isRead: false,
        reportId: spamReportId,
        report: {
          id: spamReportId,
          title: "Waste report",
          status: "PENDING",
        },
        createdAt: new Date().toISOString(),
      };

      expect(isSpamNotification(notification)).toBe(true);
    });

    it("identifies spam notification by message mentioning 'flagged as spam'", () => {
      const notification: Partial<Notification> = {
        id: "notif-3",
        title: "System Alert",
        message: 'A new report flagged as spam has been submitted: "Coastline photo"',
        type: "SYSTEM",
        reportId: spamReportId,
      };

      expect(isSpamNotification(notification)).toBe(true);
    });

    it("identifies spam notification by message mentioning 'marked as spam'", () => {
      const notification: Partial<Notification> = {
        id: "notif-4",
        title: "Report Status",
        message: 'Your report "Clean Shore" was automatically marked as spam by the system.',
        type: "SYSTEM",
        reportId: spamReportId,
      };

      expect(isSpamNotification(notification)).toBe(true);
    });

    it("does NOT identify regular waste report as spam", () => {
      const notification: Notification = {
        id: "notif-5",
        title: "New Waste Report",
        message: 'A new plastic bottle report has been submitted: "Waste report"',
        type: "NEW_REPORT",
        isRead: false,
        reportId: regularReportId,
        report: {
          id: regularReportId,
          title: "Waste report",
          status: "PENDING",
          isSpam: false,
        },
        createdAt: new Date().toISOString(),
      };

      expect(isSpamNotification(notification)).toBe(false);
    });

    it("does NOT identify status change (e.g. cleanup completed) as spam", () => {
      const notification: Notification = {
        id: "notif-6",
        title: "Report Completed",
        message: 'Report "Waste report" has been marked as cleaned (Panabo City Coastal Road).',
        type: "STATUS_CHANGE",
        isRead: true,
        reportId: regularReportId,
        report: {
          id: regularReportId,
          title: "Waste report",
          status: "CLEANED",
          isSpam: false,
        },
        createdAt: new Date().toISOString(),
      };

      expect(isSpamNotification(notification)).toBe(false);
    });

    it("does NOT identify worker assignment notification as spam", () => {
      const notification: Notification = {
        id: "notif-7",
        title: "New Assignment",
        message: "You have been assigned to a coastal cleanup zone.",
        type: "ASSIGNMENT",
        isRead: false,
        reportId: regularReportId,
        report: {
          id: regularReportId,
          title: "Zone A Cleanup",
          status: "CLEANUP_SCHEDULED",
          isSpam: false,
        },
        createdAt: new Date().toISOString(),
      };

      expect(isSpamNotification(notification)).toBe(false);
    });

    it("returns false for null or undefined notification", () => {
      expect(isSpamNotification(null)).toBe(false);
      expect(isSpamNotification(undefined)).toBe(false);
    });
  });

  describe("getNotificationReportHref (Conditional Navigation)", () => {
    it("redirects spam notifications to /dashboard/spam when reportId is present", () => {
      const spamNotification: Notification = {
        id: "notif-spam-1",
        title: "New Spam Report",
        message: 'A new report flagged as spam has been submitted: "Waste report"',
        type: "SYSTEM",
        isRead: false,
        reportId: spamReportId,
        report: {
          id: spamReportId,
          title: "Waste report",
          status: "PENDING",
          isSpam: true,
        },
        createdAt: new Date().toISOString(),
      };

      const href = getNotificationReportHref(spamNotification);
      expect(href).toBe("/dashboard/spam");
      // Never redirects to regular report details page
      expect(href).not.toBe(`/dashboard/reports/${spamReportId}`);
    });

    it("redirects spam notifications to /dashboard/spam even if reportId is undefined", () => {
      const spamNotification: Partial<Notification> = {
        id: "notif-spam-2",
        title: "New Spam Report",
        message: 'A new report flagged as spam has been submitted: "Coastline photo"',
        type: "SYSTEM",
      };

      const href = getNotificationReportHref(spamNotification);
      expect(href).toBe("/dashboard/spam");
    });

    it("retains regular navigation to /dashboard/reports/[id] for regular waste reports", () => {
      const regularNotification: Notification = {
        id: "notif-regular-1",
        title: "New Waste Report",
        message: 'A new plastic bottle report has been submitted: "Waste report"',
        type: "NEW_REPORT",
        isRead: false,
        reportId: regularReportId,
        report: {
          id: regularReportId,
          title: "Waste report",
          status: "PENDING",
          isSpam: false,
        },
        createdAt: new Date().toISOString(),
      };

      const href = getNotificationReportHref(regularNotification);
      expect(href).toBe(`/dashboard/reports/${regularReportId}`);
      expect(href).not.toBe("/dashboard/spam");
    });

    it("retains regular navigation to /dashboard/reports/[id] for completed status updates", () => {
      const completedNotification: Notification = {
        id: "notif-regular-2",
        title: "Report Completed",
        message: 'Report "Waste report" has been marked as cleaned.',
        type: "STATUS_CHANGE",
        isRead: true,
        reportId: regularReportId,
        report: {
          id: regularReportId,
          title: "Waste report",
          status: "CLEANED",
          isSpam: false,
        },
        createdAt: new Date().toISOString(),
      };

      const href = getNotificationReportHref(completedNotification);
      expect(href).toBe(`/dashboard/reports/${regularReportId}`);
    });

    it("returns null for non-report notifications (e.g. general system broadcast)", () => {
      const broadcastNotification: Partial<Notification> = {
        id: "notif-sys-1",
        title: "Scheduled Maintenance",
        message: "System maintenance tonight at 12:00 AM.",
        type: "SYSTEM",
      };

      const href = getNotificationReportHref(broadcastNotification);
      expect(href).toBeNull();
    });
  });

  describe("Spam vs Regular Reports API Filtering", () => {
    it("filters with isSpam: true when isSpam=true is requested", async () => {
      const request = new NextRequest("http://localhost/api/reports?isSpam=true");
      await GET(request);

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            isSpam: true,
          }),
        }),
      );
    });

    it("filters with isSpam: false when regular reports are requested without isSpam param", async () => {
      const request = new NextRequest("http://localhost/api/reports");
      await GET(request);

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            isSpam: false,
          }),
        }),
      );
    });
  });

  describe("Waste Category Distribution (Spam as No Waste)", () => {
    it("returns with_waste and no_waste counts including spam reports", async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
        { bucket: "with_waste", count: 5n },
        { bucket: "no_waste", count: 1n },
      ]);

      const categories = await getDashboardCategoryDistribution();

      expect(categories).toEqual([
        { key: "with_waste", label: "With Waste", count: 5 },
        { key: "no_waste", label: "No Waste", count: 1 },
      ]);
    });

    it("includes spam reports in noWasteCount in /api/dashboard/stats", async () => {
      vi.mocked(prisma.report.count)
        .mockResolvedValueOnce(6) // totalReports
        .mockResolvedValueOnce(5) // withWasteCount
        .mockResolvedValueOnce(1) // noWasteCount (spam included)
        .mockResolvedValueOnce(0) // pendingCount
        .mockResolvedValueOnce(3); // resolvedCount

      const response = await getStatsRoute();
      const json = await response.json();

      expect(json).toEqual({
        totalReports: 6,
        withWasteCount: 5,
        noWasteCount: 1,
        pendingCount: 0,
        resolvedCount: 3,
      });

      // Verify noWasteCount query includes isSpam: true condition
      expect(prisma.report.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            OR: expect.arrayContaining([
              expect.objectContaining({ isSpam: true }),
            ]),
          }),
        }),
      );
    });
  });
});

