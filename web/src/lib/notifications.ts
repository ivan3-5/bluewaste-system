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

