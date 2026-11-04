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
  ExternalLink,
  Play,
  Check,
  Sparkles,
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

const STATUS_ACTION_LABELS: Record<string, { label: string; icon: "play" | "check" | "upload" }> = {
  IN_PROGRESS: {
    label: "Start Cleanup",
    icon: "play",
  },
  CLEANED: {
    label: "Mark as Cleaned",
    icon: "check",
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
  const [showHistory, setShowHistory] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [activePhotoTab, setActivePhotoTab] = useState<"report" | "cleanup">("report");

  const nextStatuses = report ? STATUS_TRANSITIONS[report.status] || [] : [];
  const reportImages =
    report?.images?.filter((img) => img.type === "REPORT") || [];
  const existingCleanupImages =
    report?.images?.filter((img) => img.type === "CLEANUP") || [];
  const hasCleanupProof =
    cleanupPhotos.length > 0 || existingCleanupImages.length > 0;

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

    // Guard: Prevent marking as cleaned if there are no cleanup proof photos
    if (newStatus === "CLEANED" && !hasCleanupProof) {
      pushToast({
        id: `task-status-warn-${report.id}-${Date.now()}`,
        title: "Cleanup Proof Required",
        message:
          "Please upload at least one cleanup proof photo before marking the task as cleaned.",
        type: "STATUS_CHANGE",
        variant: "warning",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      return;
    }

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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-16 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Report not found</p>
        <Link
          href="/field-worker/tasks"
          className="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Back to tasks
        </Link>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`;
  const isCleaned = report.status === "CLEANED";
  const isInProgress = report.status === "IN_PROGRESS";
  const isScheduledOrVerified = report.status === "VERIFIED" || report.status === "CLEANUP_SCHEDULED";

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8">
      {/* ── Top Navigation & Quick Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to tasks
          </button>
          <span className="hidden sm:inline-block rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2 py-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            ID: #{report.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            Open Google Maps
          </a>

          {/* Quick Start Button in Top Bar if ready to start */}
          {nextStatuses.includes("IN_PROGRESS") && (
            <button
              onClick={() => handleStatusUpdate("IN_PROGRESS")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:shadow disabled:opacity-50"
            >
              <Play className="h-3 w-3 fill-white" />
              Start Cleanup
            </button>
          )}
        </div>
      </div>

      {/* ── Compact Header & Task Summary Card ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm transition">
        <div className="flex flex-col gap-3">
          {/* Title & Badges */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Field Operations Task
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {report.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              {report.priority && report.priority !== "LOW" && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                    report.priority === "CRITICAL"
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                      : report.priority === "HIGH"
                        ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300"
                        : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-300"
                  }`}
                >
                  {PRIORITY_LABELS[report.priority]} Priority
                </span>
              )}
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {WASTE_CATEGORY_LABELS[report.category]}
              </span>
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <p className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
              {report.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2 border border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
              <div className="truncate">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {report.address || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2 border border-slate-100 dark:border-slate-800">
              <Clock className="h-4 w-4 shrink-0 text-teal-500 dark:text-teal-400" />
              <div className="truncate">
                <span>Reported: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatDateTime(report.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2 border border-slate-100 dark:border-slate-800">
              <User className="h-4 w-4 shrink-0 text-purple-500 dark:text-purple-400" />
              <div className="truncate">
                <span>Reporter: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {report.reporter && !report.isAnonymous
                    ? `${report.reporter.firstName} ${report.reporter.lastName}`
                    : "Anonymous Citizen"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Operational 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Route Map & Evidence Gallery (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Route Map Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Navigation className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  GPS Route to Report Site
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Live GPS
                </span>
              </div>
            </div>
            <div className="h-64 sm:h-[320px] flex flex-col">
              <TaskRouteMap lat={report.latitude} lng={report.longitude} reportTitle={report.title} />
            </div>
          </div>

          {/* Photo Documentation Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Photo Documentation
                </h2>
              </div>

              {/* Segmented Control Tabs */}
              <div className="flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab("report")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] transition ${
                    activePhotoTab === "report"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span>Report Evidence</span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px]">
                    {reportImages.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab("cleanup")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] transition ${
                    activePhotoTab === "cleanup"
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span>Cleanup Proof</span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px]">
                    {existingCleanupImages.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-4">
              {activePhotoTab === "report" ? (
                reportImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {reportImages.map((img: ReportImage) => (
                      <button
                        key={img.id}
                        onClick={() => setLightboxImage(img.imageUrl)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs transition hover:scale-[1.02] hover:shadow-md"
                      >
                        <Image
                          src={img.imageUrl}
                          alt="Report evidence"
                          fill
                          sizes="(max-width: 640px) 33vw, 20vw"
                          className="object-cover transition duration-300 group-hover:brightness-95"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                          <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                            View Full
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No report evidence photos attached.
                  </div>
                )
              ) : (
                existingCleanupImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {existingCleanupImages.map((img: ReportImage) => (
                      <button
                        key={img.id}
                        onClick={() => setLightboxImage(img.imageUrl)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs transition hover:scale-[1.02] hover:shadow-md"
                      >
                        <Image
                          src={img.imageUrl}
                          alt="Cleanup proof"
                          fill
                          sizes="(max-width: 640px) 33vw, 20vw"
                          className="object-cover transition duration-300 group-hover:brightness-95"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                          <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                            View Full
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No cleanup photos uploaded yet. When marking this task as cleaned, upload photos to verify work.
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Center & Status History (5 cols on lg, 4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* ── Status Action Center ── */}
          {nextStatuses.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    nextStatuses.includes("CLEANED")
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      : "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400"
                  }`}>
                    {nextStatuses.includes("CLEANED") ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Task Action Center
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {nextStatuses.includes("CLEANED")
                        ? "Task in progress. Mark cleaned when finished."
                        : "Ready to begin field cleanup operation."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Notification */}
              {success && (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              {/* Cleanup Photo Upload (Only when completing task to CLEANED) */}
              {nextStatuses.includes("CLEANED") && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span>Cleanup Proof Photos</span>
                      <span className="text-red-500 font-bold">*</span>
                      {!hasCleanupProof ? (
                        <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          Required
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                          Photo Attached
                        </span>
                      )}
                    </Label>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {cleanupPhotos.length}/5 photos
                    </span>
                  </div>

                  {cleanupPhotos.length < 5 && (
                    <label className={`group flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                      !hasCleanupProof
                        ? "border-amber-300 dark:border-amber-700/70 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-600"
                        : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-800/70"
                    }`}>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        <Camera className="h-4 w-4" />
                        <span className="text-xs font-bold">
                          {!hasCleanupProof ? "Upload required cleanup proof" : "Add more cleanup photos"}
                        </span>
                      </div>
                      <span className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        PNG, JPG up to 10MB each
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

                  {/* Photo Thumbnails */}
                  {cleanupPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {cleanupPhotos.map((file, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
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
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="statusNotes"
                  className="text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Notes (optional)
                </Label>
                <Textarea
                  id="statusNotes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder={
                    nextStatuses.includes("CLEANED")
                      ? "Add notes on disposal volume, truck details, or site conditions..."
                      : "Add any task dispatch notes..."
                  }
                  rows={2}
                  className="resize-none rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-xs transition focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-1 space-y-2">
                {nextStatuses.map((nextStatus) => {
                  const action = STATUS_ACTION_LABELS[nextStatus];
                  const isCleanAction = nextStatus === "CLEANED";
                  const isActionDisabled = isSubmitting || (isCleanAction && !hasCleanupProof);

                  return (
                    <div key={nextStatus} className="space-y-1.5">
                      <button
                        onClick={() => handleStatusUpdate(nextStatus)}
                        disabled={isActionDisabled}
                        title={
                          isCleanAction && !hasCleanupProof
                            ? "Please upload at least 1 cleanup proof photo to enable this action"
                            : undefined
                        }
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                          isCleanAction
                            ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                            : "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : isCleanAction ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-white" />
                        )}
                        <span>{action?.label || REPORT_STATUS_LABELS[nextStatus]}</span>
                      </button>

                      {isCleanAction && !hasCleanupProof && (
                        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>Upload at least 1 cleanup proof photo to proceed</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isCleaned ? (
            /* Completed Banner */
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Task Completed
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    This cleanup has been completed and verified.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Status History Audit Trail ── */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex w-full items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Status History</span>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                    {report.statusHistory.length}
                  </span>
                </div>
                {showHistory ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showHistory && (
                <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2.5 pl-4 space-y-4">
                    {report.statusHistory.map((entry, i) => {
                      const isFirst = i === 0;
                      return (
                        <div key={entry.id} className="relative group text-xs">
                          {/* Dot marker */}
                          <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                            isFirst ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                          }`} />

                          {/* Status Badge Line */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {entry.previousStatus && (
                              <>
                                <span className="font-semibold text-slate-600 dark:text-slate-400">
                                  {REPORT_STATUS_LABELS[entry.previousStatus] || entry.previousStatus}
                                </span>
                                <span className="text-slate-400">→</span>
                              </>
                            )}
                            <StatusBadge status={entry.newStatus} />
                          </div>

                          {/* Notes if any */}
                          {entry.notes && (
                            <p className="mt-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 text-[11px] text-slate-700 dark:text-slate-300 leading-normal border border-slate-100 dark:border-slate-800">
                              {entry.notes}
                            </p>
                          )}

                          {/* Meta info */}
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                            {entry.changedBy && (
                              <span>
                                {entry.changedBy.firstName} {entry.changedBy.lastName}
                              </span>
                            )}
                            {entry.changedBy && <span>•</span>}
                            <span>{formatDateTime(entry.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox Modal ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            title="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[85vh] w-[85vw] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Evidence photo full size"
              fill
              className="rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
