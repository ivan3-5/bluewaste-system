import { Response } from "express";
import { logger } from "./logger";

export function sendError(
  res: Response,
  status: number,
  message: string,
  code?: string,
) {
  return res.status(status).json({
    message,
    error: message,
    ...(code ? { code } : {}),
  });
}

export type QueryFilters = Record<string, unknown>;

/**
 * Standard error handler for Express controllers. Checks known service
 * exception messages and maps them to appropriate HTTP status codes and error codes.
 */
export function handleControllerError(
  res: Response,
  error: unknown,
  defaultMessage: string,
  defaultCode = "INTERNAL_ERROR",
) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : defaultMessage;

  // 404 Not Found mappings
  if (message === "Report not found") return sendError(res, 404, message, "REPORT_NOT_FOUND");
  if (message === "Field worker not found") return sendError(res, 404, message, "WORKER_NOT_FOUND");
  if (message === "Schedule not found") return sendError(res, 404, message, "SCHEDULE_NOT_FOUND");
  if (message === "Reporting zone not found") return sendError(res, 404, message, "ZONE_NOT_FOUND");
  if (message === "User not found") return sendError(res, 404, message, "USER_NOT_FOUND");

  // 403 Forbidden mappings
  if (
    message === "Insufficient permissions." ||
    message === "Citizen user accounts cannot be edited by administrators." ||
    message.includes("Citizen user accounts cannot be edited") ||
    message.includes("Citizen accounts cannot be edited")
  ) {
    return sendError(res, 403, message, "FORBIDDEN");
  }

  // 401 Unauthorized mappings
  if (message === "Invalid email or password" || message === "Invalid or expired refresh token") {
    return sendError(res, 401, message, "UNAUTHORIZED");
  }

  // 409 Conflict mappings
  if (message === "Email already registered" || message === "Email already in use") {
    return sendError(res, 409, message, "EMAIL_TAKEN");
  }
  if (message.startsWith("Cannot mark cleanup schedule as completed:") ||
      message === "This schedule status has changed. Refresh and try again.") {
    return sendError(res, 409, message, "SCHEDULE_STATUS_CONFLICT");
  }

  // 400 Bad Request mappings
  if (message === "Report is marked as spam") return sendError(res, 400, message, "REPORT_SPAM");
  if (message === "One or more worker IDs are invalid") return sendError(res, 400, message, "INVALID_WORKER_IDS");
  if (message === "Cannot create schedule for a past date") return sendError(res, 400, message, "SCHEDULE_VALIDATION_FAILED");
  if (message === "One or more selected waste reports do not exist or were deleted" ||
      message.startsWith("Cannot schedule report(s) that are already completed or rejected:")) {
    return sendError(res, 409, message, "REPORT_UNAVAILABLE_FOR_SCHEDULE");
  }
  if (
    message.startsWith("Cannot create schedule:") ||
    message.startsWith("Cannot update schedule:") ||
    message.includes("already assigned to")
  ) {
    return sendError(res, 400, message, "REPORT_ALREADY_SCHEDULED");
  }
  if (message.startsWith("Reports can only be submitted within")) {
    return sendError(res, 400, message, "OUTSIDE_REPORTING_ZONE");
  }
  if (message === "Zone name is required" || message.startsWith("A zone needs")) {
    return sendError(res, 400, message, "ZONE_VALIDATION_FAILED");
  }
  if (message === "Cannot delete your own account" || message === "Missing required fields" || message === "Invalid role") {
    return sendError(res, 400, message, "VALIDATION_ERROR");
  }

  logger.error({ err: error, code: defaultCode }, defaultMessage);
  return sendError(res, 500, defaultMessage, defaultCode);
}
