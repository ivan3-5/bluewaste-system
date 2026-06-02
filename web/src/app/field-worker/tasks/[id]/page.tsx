"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  useReport,
  useUpdateReportStatus,
  useUploadReportImages,
} from "@/hooks/useReports";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ReportStatus,
  WASTE_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  PRIORITY_LABELS,
  ReportImage,
} from "@/types";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { FieldWorkerTaskDetailSkeleton } from "@/components/skeletons/page-skeletons";

// Lightweight read-only map for showing report location
const ReadOnlyMap = dynamic(
  () => import("../../../../components/map/ReadOnlyMap"),
  { ssr: false },
);

// Valid field-worker status transitions
const STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  PENDING: [],
  VERIFIED: ["IN_PROGRESS"],
  CLEANUP_SCHEDULED: ["IN_PROGRESS"],
  IN_PROGRESS: ["CLEANED"],
  CLEANED: [],
  REJECTED: [],
};

const STATUS_ACTION_LABELS: Record<string, { label: string; color: string }> = {
  IN_PROGRESS: {
    label: "Start Cleanup",
    color: "bg-orange-600 hover:bg-orange-700",
  },
  CLEANED: {
    label: "Mark as Cleaned",
    color: "bg-green-600 hover:bg-green-700",
  },
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: report, isLoading } = useReport(id);
  const updateStatus = useUpdateReportStatus();
  const uploadImages = useUploadReportImages();

  const [statusNotes, setStatusNotes] = useState("");
  const [cleanupPhotos, setCleanupPhotos] = useState<File[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const nextStatuses = report ? STATUS_TRANSITIONS[report.status] || [] : [];

  const addPhotos = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024,
    );
    setCleanupPhotos((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 5);
    });
  }, []);

  const removePhoto = (index: number) => {
    setCleanupPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    if (!report) return;
    setIsSubmitting(true);
    setSuccess("");

    try {
      // Upload cleanup photos if marking as cleaned
      if (newStatus === "CLEANED" && cleanupPhotos.length > 0) {
        await uploadImages.mutateAsync({
          reportId: report.id,
          files: cleanupPhotos,
          type: "CLEANUP",
        });
      }

      await updateStatus.mutateAsync({
        id: report.id,
        status: newStatus,
        notes: statusNotes || undefined,
      });

      setSuccess(
        newStatus === "CLEANED"
          ? "Report marked as cleaned! Great work."
          : "Status updated successfully.",
      );
      setStatusNotes("");
      setCleanupPhotos([]);
    } catch {
      // Error handled by react-query
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <FieldWorkerTaskDetailSkeleton />;
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">Report not found</p>
        <Link
          href="/field-worker/tasks"
          className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to tasks
        </Link>
      </div>
    );
  }

  const reportImages =
    report.images?.filter((img) => img.type === "REPORT") || [];
  const existingCleanupImages =
    report.images?.filter((img) => img.type === "CLEANUP") || [];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </button>

      {/* Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Field Operations Task
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              {report.priority && report.priority !== "LOW" ? (
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    report.priority === "CRITICAL"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : report.priority === "HIGH"
                        ? "border-orange-200 bg-orange-50 text-orange-700"
                        : "border-yellow-200 bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {PRIORITY_LABELS[report.priority]}
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {WASTE_CATEGORY_LABELS[report.category]}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="rounded-xl border border-slate-100 bg-white/80 p-4">
            <p className="text-sm leading-relaxed text-slate-700">
              {report.description || "No additional description provided."}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>
                Coordinates: {report.latitude.toFixed(5)},{" "}
                {report.longitude.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>{formatDateTime(report.createdAt)}</span>
            </div>
            {report.reporter && !report.isAnonymous && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {report.reporter.firstName} {report.reporter.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Map */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-blue-600" />
            Report Location
          </h2>
        </div>
        <div className="h-64 sm:h-72">
          <ReadOnlyMap lat={report.latitude} lng={report.longitude} />
        </div>
      </div>

      {/* Report Photos */}
      {reportImages.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Report Photos ({reportImages.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {reportImages.map((img: ReportImage) => (
              <button
                key={img.id}
                onClick={() => setLightboxImage(img.imageUrl)}
                className="group aspect-square overflow-hidden rounded-xl border border-slate-200 transition hover:shadow-sm"
              >
                <img
                  src={img.imageUrl}
                  alt="Report evidence"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cleanup Photos (already uploaded) */}
      {existingCleanupImages.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Cleanup Photos ({existingCleanupImages.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {existingCleanupImages.map((img: ReportImage) => (
              <button
                key={img.id}
                onClick={() => setLightboxImage(img.imageUrl)}
                className="group aspect-square overflow-hidden rounded-xl border border-green-200 transition hover:shadow-sm"
              >
                <img
                  src={img.imageUrl}
                  alt="Cleanup proof"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Section */}
      {nextStatuses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Update Status
            </h2>
          </div>
          <div className="space-y-4 p-5">
            {/* Success message */}
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Cleanup photo upload (when completing task) */}
            {nextStatuses.includes("CLEANED") && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Upload Cleanup Photos (proof of work)
                </Label>

                {cleanupPhotos.length < 5 && (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 transition-colors hover:border-blue-400 hover:bg-blue-50/60">
                    <Camera className="mb-2 h-6 w-6 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">
                      Click to upload photos
                    </span>
                    <span className="mt-1 text-xs text-slate-400">
                      {cleanupPhotos.length}/5 photos · Max 10MB each
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) addPhotos(e.target.files);
                      }}
                    />
                  </label>
                )}

                {cleanupPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {cleanupPhotos.map((file, i) => (
                      <div key={i} className="group relative aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Cleanup photo ${i + 1}`}
                          className="h-full w-full rounded-lg border border-slate-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          title="Remove photo"
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="statusNotes"
                className="text-sm font-medium text-gray-700"
              >
                Notes (optional)
              </Label>
              <Textarea
                id="statusNotes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes about the task..."
                rows={3}
                className="resize-none border-slate-200 bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {nextStatuses.map((nextStatus) => {
                const action = STATUS_ACTION_LABELS[nextStatus];
                return (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={isSubmitting}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 sm:w-auto ${action?.color || "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : nextStatus === "CLEANED" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {action?.label || REPORT_STATUS_LABELS[nextStatus]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Completed Banner */}
      {report.status === "CLEANED" && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 shadow-sm">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Task Completed
            </p>
            <p className="text-xs text-green-600">
              This report has been cleaned and verified.
            </p>
          </div>
        </div>
      )}

      {/* Status History */}
      {report.statusHistory && report.statusHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex w-full items-center justify-between bg-slate-50/70 px-5 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100/70"
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Status History ({report.statusHistory.length})
            </span>
            {showHistory ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {showHistory && (
            <div className="space-y-4 border-t border-slate-100 px-5 py-4">
              {report.statusHistory.map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-3 relative">
                  {i < report.statusHistory!.length - 1 && (
                    <div className="absolute left-[7px] top-5 h-full w-px bg-slate-200" />
                  )}
                  <div className="relative z-10 mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 border-blue-400 bg-blue-100" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {entry.previousStatus && (
                        <>
                          <StatusBadge status={entry.previousStatus} />
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      <StatusBadge status={entry.newStatus} />
                    </div>
                    {entry.notes && (
                      <p className="mt-1 text-xs text-slate-600">
                        {entry.notes}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {entry.changedBy
                        ? `${entry.changedBy.firstName} ${entry.changedBy.lastName} · `
                        : ""}
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            title="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
