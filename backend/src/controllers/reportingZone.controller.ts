import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError } from "../utils/http";
import { ReportingZoneService } from "../services/reportingZone.service";

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
