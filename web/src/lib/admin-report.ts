import type { ReportStatus } from "@/types";
import type { ReportImage } from "@/types";

export type AdminReportCategory = "with_waste" | "no_waste";
export type AdminReportStatus = ReportStatus;

export interface AdminReport {
  id: string;
  imageUrl: string;
  images: ReportImage[];
  category: AdminReportCategory;
  confidence: number;
  latitude: number;
  longitude: number;
  locationName: string;
  description: string | null;
  status: AdminReportStatus;
  /** Severity from the hybrid YOLOv8 + Cloud Vision pipeline */
  severity?: "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  assignedWorkerNames?: string | null;
  assignedWorkers?: Array<{ id: string; firstName: string; lastName: string; email?: string }>;
  cleanupScheduleId?: string | null;
  reportedAt: string | Date;
  updatedAt: string | Date;
  // Gemini Vision AI fields
  analyzedAt?: string | Date | null;
  aiCategories?: string[] | null;
  aiReason?: string | null;
  aiModel?: string | null;
  aiProcessingMs?: number | null;
  aiGeminiMs?: number | null;
}

export const ADMIN_REPORT_CATEGORY_LABELS: Record<AdminReportCategory, string> =
  {
    with_waste: "With Waste",
    no_waste: "No Waste",
  };

export const ADMIN_REPORT_STATUS_LABELS: Record<AdminReportStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  CLEANUP_SCHEDULED: "Cleanup Scheduled",
  IN_PROGRESS: "In Progress",
  CLEANED: "Cleaned",
  REJECTED: "Rejected",
};

/**
 * One entry per grouped waste incident returned by GET /reports/incidents/map.
 * Multiple citizen Report rows may be merged into a single IncidentMapData.
 */
export interface IncidentMapData {
  id: string;
  category: AdminReportCategory;
  status: AdminReportStatus;
  severity?: "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null;
  latitude: number;
  longitude: number;
  address: string | null;
  /** Number of unique citizen reports grouped into this incident */
  contributorCount: number;
  /** IDs of all linked Report rows */
  reportIds: string[];
  /** Thumbnail image from the first linked report */
  imageUrl: string | null;
  createdAt: string | Date;
}
