import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ActivityLogService } from "../services/activity-log.service";
import { handleControllerError } from "../utils/http";
import type { ActivityLogQuery } from "../validators/activity-log.validator";

export class ActivityLogController {
  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const query = req.query as unknown as ActivityLogQuery;
      const result = await ActivityLogService.getLogs(query);
      res.set("Cache-Control", "private, no-store").json(result);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch activity logs",
        "ACTIVITY_LOG_FETCH_FAILED",
      );
    }
  }

  static async getFilterOptions(_req: AuthRequest, res: Response) {
    try {
      const options = await ActivityLogService.getFilterOptions();
      res.set("Cache-Control", "private, no-store").json(options);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch activity log filters",
        "ACTIVITY_LOG_FILTERS_FAILED",
      );
    }
  }
}
