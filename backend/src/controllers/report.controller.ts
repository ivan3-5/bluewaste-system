import { Response } from "express";
import { ReportCrudService } from "../services/report-crud.service";
import { ReportGeoService } from "../services/report-geo.service";
import { ReportSpamService } from "../services/report-spam.service";
import { ReportImageService } from "../services/report-image.service";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError, QueryFilters } from "../utils/http";

export class ReportController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const report = await ReportCrudService.create({
        ...req.body,
        reporterId: req.user?.id,
        // Forward YOLO spam-flag fields from the Flutter client payload
        isSpamFlagged: req.body.isSpamFlagged === true,
        spamReason: req.body.spamReason ?? undefined,
        yoloConfidence:
          typeof req.body.yoloConfidence === "number"
            ? req.body.yoloConfidence
            : undefined,
      });
      res.status(201).json(report);
    } catch (error) {
      handleControllerError(res, error, "Failed to create report", "REPORT_CREATE_FAILED");
    }
  }

  static async findById(req: AuthRequest, res: Response) {
    try {
      const report = await ReportCrudService.findById(req.params.id, req.user);
      res.json(report);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch report", "REPORT_FETCH_FAILED");
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status, notes } = req.body;
      const report = await ReportCrudService.updateStatus(
        req.params.id,
        status,
        req.user!.id,
        notes,
      );
      res.json(report);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to update status",
        "REPORT_STATUS_UPDATE_FAILED",
      );
    }
  }

  static async getReports(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await ReportCrudService.getReports(query);
      res.json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch reports", "REPORT_FETCH_FAILED");
    }
  }

  static async assignWorker(req: AuthRequest, res: Response) {
    try {
      const { assignedToId, workerIds } = req.body;
      const report = await ReportCrudService.assignWorker(
        req.params.id,
        workerIds !== undefined ? workerIds : assignedToId,
        req.user!.id,
      );
      res.json(report);
    } catch (error) {
      handleControllerError(res, error, "Failed to assign worker", "REPORT_ASSIGN_FAILED");
    }
  }

  static async getMyReports(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await ReportCrudService.getMyReports(req.user!.id, query);
      res.json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch reports", "REPORT_FETCH_FAILED");
    }
  }

  static async getAssignedReports(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await ReportCrudService.getAssignedReports(req.user!.id, query);
      res.json(result);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch assigned reports",
        "ASSIGNED_REPORT_FETCH_FAILED",
      );
    }
  }

  static async getMapData(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const reports = await ReportGeoService.getMapData(query);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      res.json(reports);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch map data", "MAP_DATA_FETCH_FAILED");
    }
  }

  static async getHeatmapData(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const data = await ReportGeoService.getHeatmapData(query);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      res.json(data);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch heatmap data",
        "HEATMAP_FETCH_FAILED",
      );
    }
  }

  /**
   * GET /reports/incidents/map
   * Returns one entry per WasteIncident (deduplicated) for the Leaflet map.
   * Each entry includes contributorCount and representativeImageUrl.
   */
  static async getIncidentMapData(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const incidents = await ReportGeoService.getIncidentMapData(query);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      res.json(incidents);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch incident map data",
        "INCIDENT_MAP_FETCH_FAILED",
      );
    }
  }

  static async addImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[] | undefined;
      const images = await ReportImageService.addImagesToReport(id, files, req.user, req.body.type);
      res.status(201).json(images);
    } catch (error) {
      handleControllerError(res, error, "Failed to upload images", "IMAGE_UPLOAD_FAILED");
    }
  }

  static async restoreSpam(req: AuthRequest, res: Response) {
    try {
      const report = await ReportSpamService.restoreSpam(req.params.id);
      res.json(report);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to restore spam report",
        "REPORT_RESTORE_FAILED",
      );
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await ReportCrudService.softDelete(req.params.id);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      handleControllerError(res, error, "Failed to delete report", "REPORT_DELETE_FAILED");
    }
  }
}
