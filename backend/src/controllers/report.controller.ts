import { Response } from "express";
import { ReportCrudService } from "../services/report-crud.service";
import { ReportGeoService } from "../services/report-geo.service";
import { ReportSpamService } from "../services/report-spam.service";
import { REPORT_PHOTO_LIMIT_MESSAGE, ReportImageService } from "../services/report-image.service";
import { ActivityLogService, formatActorName } from "../services/activity-log.service";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError, QueryFilters, sendError } from "../utils/http";

export class ReportController {
  static async getMapStatusCounts(req: AuthRequest, res: Response) {
    try {
      const counts = await ReportGeoService.getMapStatusCounts(
        (req.query || {}) as QueryFilters,
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.json(counts);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to fetch map status counts",
        "MAP_STATUS_COUNTS_FETCH_FAILED",
      );
    }
  }

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
      await ActivityLogService.log({
        userId: report.isAnonymous ? null : req.user?.id ?? null,
        userName: report.isAnonymous
          ? "Anonymous Citizen"
          : req.user
            ? formatActorName(req.user)
            : "Anonymous Citizen",
        userRole: req.user?.role ?? "ANONYMOUS",
        action: "REPORT_SUBMITTED",
        category: "REPORT",
        description: `Submitted waste report "${report.title}"`,
        entityType: "Report",
        entityId: report.id,
        metadata: {
          category: report.category,
          severity: report.severity,
          isSpam: report.isSpam,
          isAnonymous: report.isAnonymous,
        },
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
      const action =
        status === "VERIFIED"
          ? "REPORT_VERIFIED"
          : status === "REJECTED"
            ? "REPORT_REJECTED"
            : "REPORT_STATUS_UPDATED";
      const description =
        status === "VERIFIED"
          ? `Verified waste report "${report.title}"`
          : status === "REJECTED"
            ? `Rejected waste report "${report.title}"`
            : `Updated waste report "${report.title}" status to ${status}`;
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action,
        category: "REPORT",
        description,
        entityType: "Report",
        entityId: report.id,
        metadata: { newStatus: status, notes: notes ?? undefined },
      });
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
      const assignedIds = Array.isArray(workerIds)
        ? workerIds
        : assignedToId
          ? [assignedToId]
          : [];
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "REPORT_ASSIGNED",
        category: "REPORT",
        description: `Assigned ${assignedIds.length} field worker(s) to report "${report?.title ?? req.params.id}"`,
        entityType: "Report",
        entityId: req.params.id,
        metadata: { workerIds: assignedIds },
      });
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
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
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
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
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

  /**
   * GET /reports/radius-groups
   * Calculates GPS-based radius grouping (default: 50 meters).
   * Identifies nearby waste reports, groups them for cleanup scheduling,
   * computes pairwise distances, and preserves individual citizen submissions.
   */
  static async getRadiusGroups(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters & {
        radius?: string;
        hasCleanupSchedule?: string;
      };
      const result = await ReportGeoService.getRadiusGroupedReports(query as any);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.json(result);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Failed to calculate radius grouped reports",
        "RADIUS_GROUPING_FAILED",
      );
    }
  }

  static async addImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[] | undefined;
      const images = await ReportImageService.addImagesToReport(id, files, req.user, req.body.type, req.body.clientUploadId);
      res.status(201).json(images);
    } catch (error) {
      if (error instanceof Error && error.message === REPORT_PHOTO_LIMIT_MESSAGE) {
        return sendError(res, 409, error.message, "REPORT_PHOTO_LIMIT");
      }
      handleControllerError(res, error, "Failed to upload images", "IMAGE_UPLOAD_FAILED");
    }
  }

  static async restoreSpam(req: AuthRequest, res: Response) {
    try {
      const report = await ReportSpamService.restoreSpam(req.params.id);
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "SPAM_REPORT_RESTORED",
        category: "REPORT",
        description: `Restored spam report "${report.title}"`,
        entityType: "Report",
        entityId: report.id,
      });
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
      const deleted = await ReportCrudService.softDelete(req.params.id);
      await ActivityLogService.log({
        userId: req.user?.id,
        userName: formatActorName(req.user),
        userRole: req.user?.role,
        action: "REPORT_DELETED",
        category: "REPORT",
        description: `Deleted waste report "${deleted.title}"`,
        entityType: "Report",
        entityId: req.params.id,
      });
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      handleControllerError(res, error, "Failed to delete report", "REPORT_DELETE_FAILED");
    }
  }
}
