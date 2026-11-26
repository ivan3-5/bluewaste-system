import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError } from "../utils/http";
import { ReportingZoneService } from "../services/reportingZone.service";
import { ActivityLogService, formatActorName } from "../services/activity-log.service";

export class ReportingZoneController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const activeOnly = req.query.all !== "true";
      const zones = await ReportingZoneService.list(activeOnly);
      res.json(zones);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch reporting zones",
        "ZONE_FETCH_FAILED",
      );
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const zone = await ReportingZoneService.create({
        ...req.body,
        createdById: req.user!.id,
      });
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "REPORTING_ZONE_CREATED",
        category: "ZONE",
        description: `Created reporting zone "${zone.name}"`,
        entityType: "ReportingZone",
        entityId: zone.id,
      });
      res.status(201).json(zone);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to create reporting zone",
        "ZONE_CREATE_FAILED",
      );
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const zone = await ReportingZoneService.update(req.params.id, req.body);
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "REPORTING_ZONE_UPDATED",
        category: "ZONE",
        description: `Updated reporting zone "${zone.name}"`,
        entityType: "ReportingZone",
        entityId: zone.id,
        metadata: { updatedFields: Object.keys(req.body || {}) },
      });
      res.json(zone);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to update reporting zone",
        "ZONE_UPDATE_FAILED",
      );
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await ReportingZoneService.delete(req.params.id);
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "REPORTING_ZONE_DELETED",
        category: "ZONE",
        description: `Deleted reporting zone (${req.params.id})`,
        entityType: "ReportingZone",
        entityId: req.params.id,
      });
      res.json({ message: "Reporting zone deleted successfully" });
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to delete reporting zone",
        "ZONE_DELETE_FAILED",
      );
    }
  }
}
