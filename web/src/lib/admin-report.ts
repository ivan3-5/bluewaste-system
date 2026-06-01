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
  reporterName?: string | null;
  reporterEmail?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  reportedAt: string | Date;
  updatedAt: string | Date;
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
