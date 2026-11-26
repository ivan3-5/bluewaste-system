import { Response } from "express";
import { ScheduleService } from "../services/schedule.service";
import { ActivityLogService, formatActorName } from "../services/activity-log.service";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError, QueryFilters } from "../utils/http";

export class ScheduleController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const schedule = await ScheduleService.create(req.body, req.user!.id);
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "SCHEDULE_CREATED",
        category: "SCHEDULE",
        description: `Created cleanup schedule "${schedule.title}" (${schedule.barangay})`,
        entityType: "CleanupSchedule",
        entityId: schedule.id,
        metadata: {
          barangay: schedule.barangay,
          scheduledAt: schedule.scheduledAt,
          workerCount: schedule.workers?.length ?? 0,
        },
      });
      res.status(201).json(schedule);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to create schedule",
        "SCHEDULE_CREATE_FAILED",
      );
    }
  }

  static async findById(req: AuthRequest, res: Response) {
    try {
      const schedule = await ScheduleService.findById(req.params.id);
      res.json(schedule);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch schedule", "SCHEDULE_FETCH_FAILED");
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const schedule = await ScheduleService.update(
        req.params.id,
        req.body,
        req.user!.id,
      );
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "SCHEDULE_UPDATED",
        category: "SCHEDULE",
        description: `Updated cleanup schedule "${schedule.title}"`,
        entityType: "CleanupSchedule",
        entityId: schedule.id,
        metadata: { updatedFields: Object.keys(req.body || {}) },
      });
      res.json(schedule);
    } catch (error) {
      handleControllerError(
        res,
        error,
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
        req.user!.role === "FIELD_WORKER",
      );
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "SCHEDULE_STATUS_UPDATED",
        category: "SCHEDULE",
        description: `Updated cleanup schedule "${schedule.title}" status to ${status}`,
        entityType: "CleanupSchedule",
        entityId: schedule.id,
        metadata: { status, notes: notes ?? undefined },
      });
      res.json(schedule);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to update schedule status",
        "SCHEDULE_STATUS_UPDATE_FAILED",
      );
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await ScheduleService.delete(req.params.id);
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "SCHEDULE_DELETED",
        category: "SCHEDULE",
        description: `Deleted cleanup schedule (${req.params.id})`,
        entityType: "CleanupSchedule",
        entityId: req.params.id,
      });
      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to delete schedule",
        "SCHEDULE_DELETE_FAILED",
      );
    }
  }

  static async getSchedules(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await ScheduleService.getSchedules(query);
      res.json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch schedules", "SCHEDULE_FETCH_FAILED");
    }
  }

  static async getUpcoming(req: AuthRequest, res: Response) {
    try {
      const schedules = await ScheduleService.getUpcomingPublic();
      res.json(schedules);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch upcoming schedules",
        "SCHEDULE_UPCOMING_FAILED",
      );
    }
  }

  static async getMySchedules(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await ScheduleService.getWorkerSchedules(
        req.user!.id,
        query,
      );
      res.json(result);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch assigned schedules",
        "SCHEDULE_MY_FETCH_FAILED",
      );
    }
  }

  static async getConsolidatedReport(req: AuthRequest, res: Response) {
    try {
      const report = await ScheduleService.getConsolidatedReport(req.params.id);
      res.json(report);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to generate consolidated cleanup report",
        "SCHEDULE_REPORT_FAILED",
      );
    }
  }
}
