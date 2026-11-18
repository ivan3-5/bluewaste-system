import { describe, expect, it } from "vitest";
import {
  isSpamNotification,
  getNotificationReportHref,
  getNotificationDestination,
} from "@/lib/notifications";
import type { Notification } from "@/types";

describe("Notification Bell and Routing Utilities", () => {
  const reportId = "8121f30e-ea66-4670-9c53-0128ba43e973";
  const spamReportId = "spam-1234-5678-9abc-def012345678";

  describe("getNotificationDestination", () => {
    it("routes LGU_ADMIN to spam dashboard when notification is spam", () => {
      const notif: Partial<Notification> = {
        title: "New Spam Report",
        message: "A report has been flagged as spam",
        reportId: spamReportId,
      };
      expect(getNotificationDestination(notif, "LGU_ADMIN")).toBe("/dashboard/spam");
    });

    it("routes LGU_ADMIN to schedules when notification is a cleanup operation", () => {
      const notif: Partial<Notification> = {
        title: "Cleanup Mission Scheduled",
        message: "New coastal cleanup operation assigned for Bariles",
      };
      expect(getNotificationDestination(notif, "LGU_ADMIN")).toBe("/dashboard/schedules");
    });

    it("routes LGU_ADMIN to report details when notification links to a valid report", () => {
      const notif: Partial<Notification> = {
        title: "New Waste Report Submitted",
        message: "A citizen reported plastic bottles at Panabo Shoreline",
        reportId,
      };
      expect(getNotificationDestination(notif, "LGU_ADMIN")).toBe(`/dashboard/reports/${reportId}`);
    });

    it("routes FIELD_WORKER to task details when notification has reportId", () => {
      const notif: Partial<Notification> = {
        title: "New Cleanup Assignment",
        message: "You have been assigned to clean report",
        reportId,
      };
      expect(getNotificationDestination(notif, "FIELD_WORKER")).toBe(`/field-worker/tasks/${reportId}`);
    });

    it("routes FIELD_WORKER to schedules when notification mentions cleanup schedule", () => {
      const notif: Partial<Notification> = {
        title: "Cleanup Schedule Updated",
        message: "The deployment time has been adjusted to 6:15 AM",
      };
      expect(getNotificationDestination(notif, "FIELD_WORKER")).toBe("/field-worker/schedules");
    });

    it("routes CITIZEN to my-reports when notification updates a report", () => {
      const notif: Partial<Notification> = {
        title: "Report Status Updated",
        message: "Your reported area has been cleaned by field workers",
        reportId,
      };
      expect(getNotificationDestination(notif, "CITIZEN")).toBe("/citizen/my-reports");
    });

    it("routes to notifications center as fallback when notification lacks details", () => {
      expect(getNotificationDestination(null, "LGU_ADMIN")).toBe("/dashboard/notifications");
      expect(getNotificationDestination(null, "FIELD_WORKER")).toBe("/field-worker/notifications");
      expect(getNotificationDestination(null, "CITIZEN")).toBe("/citizen/notifications");
    });
  });

  describe("Notification Sorting Logic", () => {
    it("sorts notifications newest first", () => {
      const list: Notification[] = [
        {
          id: "1",
          title: "Older notification",
          message: "A few hours ago",
          type: "SYSTEM",
          isRead: true,
          createdAt: "2026-11-18T01:00:00Z",
        },
        {
          id: "2",
          title: "Newest notification",
          message: "Just now",
          type: "NEW_REPORT",
          isRead: false,
          createdAt: "2026-11-18T03:00:00Z",
        },
        {
          id: "3",
          title: "Middle notification",
          message: "An hour ago",
          type: "STATUS_CHANGE",
          isRead: false,
          createdAt: "2026-11-18T02:00:00Z",
        },
      ];

      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });
  });

  describe("Dynamic Badge Count Display", () => {
    it("formats badge text correctly for counts and overflows", () => {
      const getBadgeText = (count: number) => (count > 9 ? "9+" : count.toString());

      expect(getBadgeText(1)).toBe("1");
      expect(getBadgeText(9)).toBe("9");
      expect(getBadgeText(10)).toBe("9+");
      expect(getBadgeText(45)).toBe("9+");
    });
  });
});
