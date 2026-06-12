import { Response } from "express";
import { ScheduleService } from "../services/schedule.service";
import { AuthRequest } from "../middleware/auth";
import { sendError } from "../utils/http";

export class ScheduleController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const schedule = await ScheduleService.create(req.body, req.user!.id);
      res.status(201).json(schedule);
    } catch (error: any) {
      if (error.message === "One or more worker IDs are invalid") {
        return sendError(res, 400, error.message, "INVALID_WORKER_IDS");
      }
      sendError(
        res,
        500,
        "Failed to create schedule",
        "SCHEDULE_CREATE_FAILED",
      );
    }
  }

  static async findById(req: AuthRequest, res: Response) {
    try {
      const schedule = await ScheduleService.findById(req.params.id);
      res.json(schedule);
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return sendError(res, 404, error.message, "SCHEDULE_NOT_FOUND");
      }
      sendError(res, 500, "Failed to fetch schedule", "SCHEDULE_FETCH_FAILED");
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const schedule = await ScheduleService.update(
        req.params.id,
        req.body,
        req.user!.id,
      );
      res.json(schedule);
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return sendError(res, 404, error.message, "SCHEDULE_NOT_FOUND");
      }
      if (error.message === "One or more worker IDs are invalid") {
        return sendError(res, 400, error.message, "INVALID_WORKER_IDS");
      }
      sendError(
        res,
        500,
        "Failed to update schedule",
        "SCHEDULE_UPDATE_FAILED",
      );
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status, notes } = req.body;
      const schedule = await ScheduleService.updateStatus(
        req.params.id,
        status,
        req.user!.id,
        notes,
      );
      res.json(schedule);
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return sendError(res, 404, error.message, "SCHEDULE_NOT_FOUND");
      }
      sendError(
        res,
        500,
        "Failed to update schedule status",
        "SCHEDULE_STATUS_UPDATE_FAILED",
      );
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await ScheduleService.delete(req.params.id);
      res.json({ message: "Schedule deleted successfully" });
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return sendError(res, 404, error.message, "SCHEDULE_NOT_FOUND");
      }
      sendError(
        res,
        500,
        "Failed to delete schedule",
        "SCHEDULE_DELETE_FAILED",
      );
    }
  }

  static async getSchedules(req: AuthRequest, res: Response) {
    try {
      const result = await ScheduleService.getSchedules(req.query as any);
      res.json(result);
    } catch (error: any) {
      sendError(res, 500, "Failed to fetch schedules", "SCHEDULE_FETCH_FAILED");
    }
  }

  static async getUpcoming(req: AuthRequest, res: Response) {
    try {
      const schedules = await ScheduleService.getUpcomingPublic();
      res.json(schedules);
    } catch (error: any) {
      sendError(
        res,
        500,
        "Failed to fetch upcoming schedules",
        "SCHEDULE_UPCOMING_FAILED",
      );
    }
  }

  static async getMySchedules(req: AuthRequest, res: Response) {
    try {
      const result = await ScheduleService.getWorkerSchedules(
        req.user!.id,
        req.query as any,
      );
      res.json(result);
    } catch (error: any) {
      sendError(
        res,
        500,
        "Failed to fetch assigned schedules",
        "SCHEDULE_MY_FETCH_FAILED",
      );
    }
  }
}
