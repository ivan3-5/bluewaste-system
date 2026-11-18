import type { Notification } from "@/types";

/**
 * Determines whether a notification is associated with a report classified or marked as spam.
 * Checks both the linked report's `isSpam` flag and notification metadata (title and message).
 */
export function isSpamNotification(
  notification: Partial<Notification> | null | undefined,
): boolean {
  if (!notification) return false;

  // 1. Explicit report model spam flag
  if (notification.report?.isSpam === true) {
    return true;
  }

  // 2. Notification title / message classification indicators
  const title = (notification.title || "").toLowerCase();
  const message = (notification.message || "").toLowerCase();

  return (
    title.includes("spam") ||
    message.includes("flagged as spam") ||
    message.includes("marked as spam")
  );
}

/**
 * Returns the destination URL for the "View Report" button on a notification card.
 * - If the report is classified as spam, redirects to "/dashboard/spam".
 * - If the report is a regular waste report, redirects to its report details page ("/dashboard/reports/[id]").
 * - If no report is associated, returns null (button hidden).
 */
export function getNotificationReportHref(
  notification: Partial<Notification> | null | undefined,
): string | null {
  if (!notification) return null;

  if (isSpamNotification(notification)) {
    return "/dashboard/spam";
  }

  if (notification.reportId) {
    return `/dashboard/reports/${notification.reportId}`;
  }

  return null;
}

/**
 * Resolves the target destination URL when a user clicks on a notification.
 * Handles role-based routing (LGU_ADMIN, FIELD_WORKER, CITIZEN) as well as
 * content-specific routing (spam alerts, cleanup operations/schedules, reports).
 */
export function getNotificationDestination(
  notification: Partial<Notification> | null | undefined,
  role?: string | null,
): string {
  if (!notification) {
    if (role === "FIELD_WORKER") return "/field-worker/notifications";
    if (role === "CITIZEN") return "/citizen/notifications";
    return "/dashboard/notifications";
  }

  const title = (notification.title || "").toLowerCase();
  const message = (notification.message || "").toLowerCase();
  const isCleanupOrSchedule =
    title.includes("schedule") ||
    message.includes("schedule") ||
    title.includes("cleanup") ||
    message.includes("cleanup") ||
    title.includes("mission") ||
    message.includes("mission");

  if (role === "FIELD_WORKER") {
    if (notification.reportId) {
      return `/field-worker/tasks/${notification.reportId}`;
    }
    if (isCleanupOrSchedule) {
      return "/field-worker/schedules";
    }
    return "/field-worker/notifications";
  }

  if (role === "CITIZEN") {
    if (notification.reportId || title.includes("report") || message.includes("report")) {
      return "/citizen/my-reports";
    }
    return "/citizen/notifications";
  }

  // Admin / Default (LGU_ADMIN)
  if (isSpamNotification(notification)) {
    return "/dashboard/spam";
  }

  if (notification.reportId) {
    return `/dashboard/reports/${notification.reportId}`;
  }

  if (isCleanupOrSchedule) {
    return "/dashboard/schedules";
  }

  return "/dashboard/notifications";
}

