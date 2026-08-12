"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Navigation,
} from "lucide-react";
import { FieldWorkerTaskDetailSkeleton } from "@/components/skeletons/page-skeletons";
import { useLiveNotifications } from "@/contexts/LiveNotificationContext";

// Task-specific route map (worker location → report)
const TaskRouteMap = dynamic(
  () => import("../../../../components/map/TaskRouteMap"),
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
  const { pushToast } = useLiveNotifications();

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

      const msg =
        newStatus === "CLEANED"
          ? "Report marked as cleaned! Great work."
          : `Task status updated to ${REPORT_STATUS_LABELS[newStatus] || newStatus}.`;

      setSuccess(msg);
      pushToast({
        id: `task-status-${report.id}-${Date.now()}`,
        title: "Status Updated",
        message: msg,
        type: "STATUS_CHANGE",
        variant: "success",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      setStatusNotes("");
      setCleanupPhotos([]);
    } catch (error) {
      pushToast({
        id: `task-status-err-${report.id}-${Date.now()}`,
        title: "Update Failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update task status.",
        type: "STATUS_CHANGE",
        variant: "error",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-blue-600 hover:shadow-md"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Ambient background gradients */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-teal-400/10 blur-[80px]" />
        
        <div className="relative border-b border-slate-100/60 px-6 py-8 sm:px-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600/80">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Field Operations Task
          </p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
            <h1 className="min-w-0 flex-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <StatusBadge status={report.status} />
              {report.priority && report.priority !== "LOW" ? (
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm ${
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
              <span className="rounded-full bg-slate-100/80 px-3 py-1.5 text-xs font-bold tracking-wide text-slate-600 shadow-sm backdrop-blur-sm">
                {WASTE_CATEGORY_LABELS[report.category]}
              </span>
            </div>
          </div>
        </div>

        <div className="relative space-y-6 bg-slate-50/50 px-6 py-6 sm:px-8 sm:py-8">
          <div className="rounded-2xl border border-slate-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-[15px] leading-relaxed text-slate-700">
              {report.description || "No additional description provided."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md hover:shadow-blue-500/5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coordinates</span>
                <span className="text-xs font-semibold text-slate-700">
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </span>
              </div>
            </div>
            
            <div className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md hover:shadow-teal-500/5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100 group-hover:text-teal-700">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reported At</span>
                <span className="text-xs font-semibold text-slate-700">{formatDateTime(report.createdAt)}</span>
              </div>
            </div>
            
            {report.reporter && !report.isAnonymous && (
              <div className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md hover:shadow-purple-500/5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100 group-hover:text-purple-700">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporter</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {report.reporter.firstName} {report.reporter.lastName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Map */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="border-b border-slate-100/60 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-sm font-bold text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Navigation className="h-4 w-4" />
              </div>
              Route to Report
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Live GPS
            </span>
          </div>
          <p className="mt-1 pl-10 text-xs text-slate-400">
            Your location → {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
          </p>
        </div>
        <div className="h-72 sm:h-[380px] flex flex-col">
          <TaskRouteMap lat={report.latitude} lng={report.longitude} reportTitle={report.title} />
        </div>
      </div>

      {/* Photos Grid */}
      {(reportImages.length > 0 || existingCleanupImages.length > 0) && (
        <div className={`grid gap-5 ${
          reportImages.length > 0 && existingCleanupImages.length > 0
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1"
        }`}>
          {/* Report Photos */}
          {reportImages.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="border-b border-slate-100/60 bg-slate-50/50 px-6 py-4">
                <h2 className="flex items-center gap-3 text-sm font-bold text-slate-900">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  Report Photos
                  <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {reportImages.length}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4">
                {reportImages.map((img: ReportImage) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxImage(img.imageUrl)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20"
                  >
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <Image
                      src={img.imageUrl}
                      alt="Report evidence"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cleanup Photos (already uploaded) */}
          {existingCleanupImages.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-green-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="border-b border-green-100/60 bg-green-50/50 px-6 py-4">
                <h2 className="flex items-center gap-3 text-sm font-bold text-green-900">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  Cleanup Photos
                  <span className="rounded-full bg-green-200/60 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
                    {existingCleanupImages.length}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4">
                {existingCleanupImages.map((img: ReportImage) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxImage(img.imageUrl)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-green-200/60 bg-green-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/20"
                  >
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <Image
                      src={img.imageUrl}
                      alt="Cleanup proof"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Update Section */}
      {nextStatuses.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-orange-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="border-b border-orange-100/60 bg-orange-50/50 px-6 py-4">
            <h2 className="flex items-center gap-3 text-sm font-bold text-orange-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              Update Status
            </h2>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            {/* Success message */}
            {success && (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200/60 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 shadow-sm">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                {success}
              </div>
            )}

            {/* Cleanup photo upload (when completing task) */}
            {nextStatuses.includes("CLEANED") && (
              <div className="space-y-4">
                <Label className="text-[13px] font-bold tracking-wide text-slate-700">
                  Upload Cleanup Photos (proof of work)
                </Label>

                {cleanupPhotos.length < 5 && (
                  <label className="group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-inner">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600">
                      <Camera className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <span className="mt-4 text-[13px] font-bold text-slate-600 group-hover:text-blue-600">
                      Click to upload photos
                    </span>
                    <span className="mt-1.5 text-[11px] font-medium text-slate-400">
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
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {cleanupPhotos.map((file, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Cleanup photo ${i + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          title="Remove photo"
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm backdrop-blur-md transition-all hover:bg-red-600 hover:scale-110 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
              <Label
                htmlFor="statusNotes"
                className="text-[13px] font-bold tracking-wide text-slate-700"
              >
                Notes (optional)
              </Label>
              <Textarea
                id="statusNotes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes about the task..."
                rows={3}
                className="resize-none rounded-2xl border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {nextStatuses.map((nextStatus) => {
                const action = STATUS_ACTION_LABELS[nextStatus];
                const isCleaned = nextStatus === "CLEANED";
                const baseButtonClass = "group flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[13px] font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50 sm:w-auto";
                
                const buttonClass = isCleaned 
                  ? `${baseButtonClass} bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-green-500/25`
                  : `${baseButtonClass} bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/25`;

                return (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={isSubmitting}
                    className={buttonClass}
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : isCleaned ? (
                      <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                    ) : (
                      <Upload className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
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
        <div className="relative overflow-hidden rounded-[2rem] border border-green-200/60 bg-gradient-to-br from-green-50 to-emerald-50/30 p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-400/10 blur-[40px]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100/80 text-green-600 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-green-900">
                Task Completed
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-green-700/80">
                This report has been cleaned and verified. Great job!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      {report.statusHistory && report.statusHistory.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="group flex w-full items-center justify-between bg-slate-50/50 px-6 py-5 text-[13px] font-bold text-slate-900 transition-colors hover:bg-slate-50"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200 group-hover:text-slate-700">
                <Clock className="h-4 w-4" />
              </div>
              Status History
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] text-slate-700">
                {report.statusHistory.length}
              </span>
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-slate-300 group-hover:text-slate-600">
              {showHistory ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>
          {showHistory && (
            <div className="border-t border-slate-100/60 bg-slate-50/30 p-6 sm:p-8">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {report.statusHistory.map((entry, i) => {
                  const isFirst = i === 0;
                  return (
                    <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline marker */}
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow transition-colors duration-300 hover:bg-blue-50 hover:text-blue-600 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {isFirst ? (
                          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-slate-300 transition-colors group-hover:bg-blue-400" />
                        )}
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-3rem)] rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:w-[calc(50%-2.5rem)]">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {entry.previousStatus && (
                            <>
                              <StatusBadge status={entry.previousStatus} />
                              <span className="font-bold text-slate-300">→</span>
                            </>
                          )}
                          <StatusBadge status={entry.newStatus} />
                        </div>
                        
                        {entry.notes && (
                          <p className="mb-3 text-[13px] leading-relaxed text-slate-600">
                            {entry.notes}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                          {entry.changedBy ? (
                            <>
                              <User className="h-3 w-3" />
                              <span>{entry.changedBy.firstName} {entry.changedBy.lastName}</span>
                              <span>·</span>
                            </>
                          ) : null}
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(entry.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
          <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Full size"
              fill
              className="rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
