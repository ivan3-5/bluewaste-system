import { getDashboardReportById } from "@/lib/dashboard-reports";
import MapView from "@/components/MapView";
import { ReportStatusUpdater } from "@/components/ReportStatusUpdater";
import Link from "next/link";
import { CleanupPhotoCarousel } from "@/components/CleanupPhotoCarousel";
import { getReverseGeocodedLocation } from "@/lib/utils";
import { AiAnalysisPanel } from "@/components/AiAnalysisPanel";
import { ReportPhotoCarousel } from "@/components/ReportPhotoCarousel";
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  ShieldCheck,
  User,
  Users,
  CalendarDays,
} from "lucide-react";
import {
  CopyButton,
  StatusWorkflowStepper,
  GoogleMapsLink,
} from "@/components/ReportDetailClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  let report;

  try {
    report = await getDashboardReportById(id);
  } catch {
    report = null;
  }

  if (!report) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 p-6 text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 underline underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-amber-950 dark:text-amber-100">Report Unavailable</h1>
        <p className="text-sm">
          Could not retrieve the requested report from the database. Please verify your connection or check if the report still exists.
        </p>
      </div>
    );
  }

  const reportImages = report.images.filter(
    (img) => img.type === "REPORT" || img.type === "ANGLE"
  );
  const cleanupImages = report.images.filter(
    (image) => image.type === "CLEANUP"
  );

  const isAlreadyScheduled =
    Boolean(report.cleanupScheduleId) ||
    ["CLEANUP_SCHEDULED", "IN_PROGRESS", "CLEANED"].includes(report.status);

  let displayLocationName = report.locationName;
  if (displayLocationName.toLowerCase().startsWith("waste report")) {
    const geocoded = await getReverseGeocodedLocation(
      report.latitude,
      report.longitude
    );
    if (geocoded) {
      displayLocationName = geocoded;
    }
  }

  const formattedDate = new Date(report.reportedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const assignedWorkersText =
    report.assignedWorkerNames ||
    (report.assignedWorkers && report.assignedWorkers.length > 0
      ? report.assignedWorkers
          .map((w) => `${w.firstName} ${w.lastName}`.trim())
          .join(", ")
      : null);

  const hasWasteAnalysis = Boolean(
    report.aiModel != null ||
    report.analyzedAt != null ||
    (report.severity != null && report.severity !== "SPAM") ||
    (report.aiCategories && report.aiCategories.length > 0)
  );

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto">
      {/* ── Top Navigation & Executive Header ── */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link
              href="/dashboard/reports"
              className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Reports</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">Report Details</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/map"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Compass className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Waste Map</span>
            </Link>
          </div>
        </div>

        {/* Header Title + Badges + Immediate Actions */}
        <div className="mt-2.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
                Report Details
              </h1>
              <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 capitalize">
                {report.category.replace(/_/g, " ")}
              </span>
            </div>

            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 truncate max-w-sm sm:max-w-md" title={displayLocationName}>
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium">{displayLocationName}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{formattedDate}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
                <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                <CopyButton
                  text={`${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                  label="Coords"
                />
              </span>
            </div>
          </div>

          {/* Immediate Action Hub (Zero scrolling required) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800 lg:border-t-0">
            <ReportStatusUpdater
              reportId={report.id}
              initialStatus={report.status}
              compact
            />

            {isAlreadyScheduled ? (
              <Link
                href="/dashboard/schedules"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shadow-2xs"
                title="View schedule details"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Scheduled</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/schedules"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <CalendarDays className="h-3.5 w-3.5 text-white/90" />
                <span>Schedule Cleanup</span>
              </Link>
            )}
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <StatusWorkflowStepper status={report.status} />
        </div>
      </section>

      {/* ── Main High-Efficiency 2-Column Content ── */}
      <div className="grid gap-3.5 lg:grid-cols-12 items-start">
        {/* ── Left Column: Visual & Geographic Intelligence (7 cols) ── */}
        <div className="space-y-3.5 lg:col-span-7">
          {/* Card: Photographic Evidence (Citizen vs Cleanup Result) */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-primary">
                  <Camera className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Visual Comparison
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-slate-700 dark:text-slate-300">
                  Citizen: {reportImages.length}
                </span>
                <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 border border-emerald-200 dark:border-emerald-500/30">
                  Cleanup: {cleanupImages.length}
                </span>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {/* Citizen Submission Box */}
              <figure className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <figcaption className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  <span>Citizen Submission</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Original</span>
                </figcaption>
                {reportImages.length > 0 ? (
                  <ReportPhotoCarousel
                    images={reportImages}
                    heightClassName="h-48 sm:h-52"
                  />
                ) : (
                  <div className="flex h-48 sm:h-52 items-center justify-center p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    No citizen submission photo available.
                  </div>
                )}
              </figure>

              {/* Cleanup Result Box */}
              <figure className="overflow-hidden rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20">
                <figcaption className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Cleanup Result
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">Verification</span>
                </figcaption>
                {cleanupImages.length > 0 ? (
                  <CleanupPhotoCarousel
                    images={cleanupImages.map((image) => ({
                      id: image.id,
                      imageUrl: image.imageUrl,
                    }))}
                    heightClassName="h-48 sm:h-52"
                  />
                ) : (
                  <div className="flex h-48 sm:h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-1.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Awaiting Cleanup Proof
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400 max-w-[200px]">
                      Field crew will upload resolution photos once the site has been cleaned.
                    </p>
                  </div>
                )}
              </figure>
            </div>
          </section>

          {/* Card: Location Map (Space-efficient viewport) */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Location Coordinates
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <GoogleMapsLink
                  latitude={report.latitude}
                  longitude={report.longitude}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
              <MapView
                reports={[
                  {
                    id: report.id,
                    imageUrl: report.imageUrl,
                    images: report.images,
                    category: report.category,
                    confidence: report.confidence,
                    latitude: report.latitude,
                    longitude: report.longitude,
                    locationName: displayLocationName,
                    description: report.description,
                    status: report.status,
                    reportedAt: report.reportedAt,
                    updatedAt: report.updatedAt,
                  },
                ]}
                center={[report.latitude, report.longitude]}
                zoom={16}
                hideControls
                mapHeightClassName="h-48 sm:h-52"
              />
            </div>
          </section>
        </div>

        {/* ── Right Column: AI Analysis & Report Details (5 cols) ── */}
        <div className="space-y-3.5 lg:col-span-5">
          {/* Gemini AI Analysis Panel (Redesigned compact) */}
          <AiAnalysisPanel
            reportId={report.id}
            hasWaste={
              hasWasteAnalysis ? report.category !== "no_waste" : null
            }
            aiCategories={report.aiCategories}
            severity={
              report.severity as "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null
            }
            confidence={report.confidence}
            aiReason={report.aiReason}
            aiModel={report.aiModel}
            aiProcessingMs={report.aiProcessingMs}
            aiGeminiMs={report.aiGeminiMs}
            analyzedAt={report.analyzedAt}
          />

          {/* Consolidated Report Specification & Personnel Card */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Report Context & Team
                </h2>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/60 p-2.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Reporter
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {report.reporterName || "Anonymous Citizen"}
                  </span>
                </dd>
                {report.reporterEmail && (
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {report.reporterEmail}
                  </span>
                )}
              </div>

              <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/60 p-2.5">
                <div className="flex items-center justify-between">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Assigned Crew
                  </dt>
                  {isAlreadyScheduled && (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1 py-0.2 rounded">
                      Scheduled
                    </span>
                  )}
                </div>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {assignedWorkersText || "Unassigned"}
                  </span>
                </dd>
                <div className="mt-1 flex items-center gap-1.5">
                  <Link
                    href="/dashboard/schedules"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    {isAlreadyScheduled ? "View Schedule →" : "+ Assign Team"}
                  </Link>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/60 p-2.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Reported Date
                </dt>
                <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {formattedDate}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/60 p-2.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Last Updated
                </dt>
                <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {new Date(report.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>

            {/* Citizen Notes (if provided) */}
            {report.description ? (
              <div className="mt-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                  Citizen Notes
                </span>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 italic">
                  &ldquo;{report.description}&rdquo;
                </p>
              </div>
            ) : (
              <div className="mt-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 px-2.5 py-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                No citizen notes attached to this report.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
