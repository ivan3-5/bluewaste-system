import { citizenComment } from "@/lib/utils";
import { getDashboardReportById } from "@/lib/dashboard-reports";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CleanupPhotoCarousel } from "@/components/CleanupPhotoCarousel";
import { getReverseGeocodedLocation } from "@/lib/utils";
import { AiAnalysisPanel } from "@/components/AiAnalysisPanel";
import { ReportPhotoCarousel } from "@/components/ReportPhotoCarousel";
import { GenerateReportButton } from "@/components/GenerateReportButton";
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import {
  CombinedReportButton,
  CopyButton,
  StatusWorkflowStepper,
  ReportDetailActionHub,
  ReportDetailMap,
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

  if (report && (report.isSpam || report.severity === "SPAM")) {
    redirect("/dashboard/spam");
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

  const assignedWorkerList: string[] =
    report.assignedWorkers && report.assignedWorkers.length > 0
      ? report.assignedWorkers
          .map((w) => `${w.firstName} ${w.lastName}`.trim())
          .filter(Boolean)
      : assignedWorkersText
        ? assignedWorkersText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

  const cleanupWorkerName =
    report.cleanedByName ||
    assignedWorkersText ||
    report.assignedToName ||
    "Assigned Field Worker";

  const hasWasteAnalysis = Boolean(
    report.aiModel != null ||
    report.analyzedAt != null ||
    report.severity != null ||
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
          <ReportDetailActionHub
            reportId={report.id}
            initialStatus={report.status}
            isAlreadyScheduled={isAlreadyScheduled}
            reportLatitude={report.latitude}
            reportLongitude={report.longitude}
            reportLocation={displayLocationName}
          >
            <GenerateReportButton
              report={{ ...report, locationName: displayLocationName }}
            />
            {report.combinedCleanupScheduleId && (
              <CombinedReportButton
                key={report.combinedCleanupScheduleId}
                scheduleId={report.combinedCleanupScheduleId}
              />
            )}
          </ReportDetailActionHub>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <StatusWorkflowStepper status={report.status} />
        </div>
      </section>

      {/* ── Main High-Efficiency 2-Column Content ── */}
      <div className="grid gap-3.5 lg:grid-cols-12 items-stretch">
        {/* ── Left Column: Visual & Geographic Intelligence (7 cols) ── */}
        <div className="flex flex-col lg:col-span-7 h-full">
          {/* Card: Photographic Evidence (Citizen vs Cleanup Result) */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs flex-1 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
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

            <div className="grid gap-3 sm:grid-cols-2 flex-1 items-stretch">
              {/* Citizen Submission Box */}
              <figure className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col justify-between h-full">
                <div className="flex-1 flex flex-col min-h-0">
                  <figcaption className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-slate-500" />
                      Citizen Submission
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Original Report</span>
                  </figcaption>
                  {reportImages.length > 0 ? (
                    <ReportPhotoCarousel
                      images={reportImages}
                      className="flex-1 flex flex-col min-h-0"
                      heightClassName="h-64 sm:h-72 lg:h-full lg:flex-1 min-h-[260px] sm:min-h-[288px] lg:min-h-[330px]"
                      reporterName={report.reporterName || "Anonymous Citizen"}
                      reportedAt={report.reportedAt}
                    />
                  ) : (
                    <div className="flex flex-1 min-h-[260px] sm:min-h-[288px] lg:min-h-[330px] items-center justify-center p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      No citizen submission photo available.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
                  <span className="truncate">
                    Submitted by:{" "}
                    <strong className="font-bold text-slate-800 dark:text-slate-200">
                      {report.reporterName || "Anonymous Citizen"}
                    </strong>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    Click photo to view large
                  </span>
                </div>
              </figure>

              {/* Cleanup Result Box */}
              <figure className="overflow-hidden rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col justify-between h-full">
                <div className="flex-1 flex flex-col min-h-0">
                  <figcaption className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Cleanup Result
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">Field Verification</span>
                  </figcaption>
                  {cleanupImages.length > 0 ? (
                    <CleanupPhotoCarousel
                      images={cleanupImages.map((image) => ({
                        id: image.id,
                        imageUrl: image.imageUrl,
                      }))}
                      className="flex-1 flex flex-col min-h-0"
                      heightClassName="h-64 sm:h-72 lg:h-full lg:flex-1 min-h-[260px] sm:min-h-[288px] lg:min-h-[330px]"
                      submittedBy={cleanupWorkerName}
                      submittedAt={report.cleanedAt}
                    />
                  ) : (
                    <div className="flex flex-1 min-h-[260px] sm:min-h-[288px] lg:min-h-[330px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-1.5">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Awaiting Cleanup Proof
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400 max-w-[200px]">
                        Field workers will upload resolution photos once the site has been cleaned.
                      </p>
                    </div>
                  )}
                </div>
                {cleanupImages.length > 0 ? (
                  <div className="flex items-center justify-between border-t border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 px-3 py-1.5 text-[11px] text-emerald-900 dark:text-emerald-200 shrink-0">
                    <span className="truncate flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Submitted by:{" "}
                      <strong className="font-bold text-emerald-800 dark:text-emerald-200">
                        {cleanupWorkerName}
                      </strong>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 shrink-0">
                      Click photo to view large
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 px-3 py-1.5 text-[11px] text-emerald-900/70 dark:text-emerald-200/70 shrink-0">
                    <span className="truncate flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70 dark:text-emerald-400/70 shrink-0" />
                      <span>Pending resolution proof</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      Field verification
                    </span>
                  </div>
                )}
              </figure>
            </div>
          </section>
        </div>

        {/* ── Right Column: AI Analysis & Report Details (5 cols) ── */}
        <div className="space-y-3.5 lg:col-span-5">
          {/* Gemini AI Analysis Panel (Redesigned compact) */}
          <AiAnalysisPanel
            hasWaste={hasWasteAnalysis ? report.category !== "no_waste" && report.severity !== "SPAM" : null}
            severity={report.severity}
          />

          {/* Consolidated Report Specification & Personnel Card */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Report Context & Worker
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
                <div className="flex items-center justify-between gap-1">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Assigned Worker{assignedWorkerList.length > 1 ? "s" : ""}
                  </dt>
                  {isAlreadyScheduled && (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1 py-0.2 rounded shrink-0">
                      Scheduled
                    </span>
                  )}
                </div>
                <dd className="mt-1" title={assignedWorkersText || "Unassigned"}>
                  {assignedWorkerList.length > 0 ? (
                    <div className={`${assignedWorkerList.length > 1 ? "grid grid-cols-2" : "flex"} gap-1.5 pt-0.5`}>
                      {assignedWorkerList.map((name, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-2xs min-w-0"
                          title={name}
                        >
                          <Users className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{name}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 text-xs">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Unassigned</span>
                    </div>
                  )}
                </dd>
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

            <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="mb-0.5 block text-[10px] font-semibold uppercase text-slate-400">
                Citizen Comment
              </span>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {citizenComment(report.description, report.aiReason)}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* ── Full-Width Section: Location Coordinates Map ── */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {displayLocationName}
            </span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </span>
          </div>
        </div>

        <ReportDetailMap
          lat={report.latitude}
          lng={report.longitude}
          status={report.status}
          radius={50}
          locationName={displayLocationName}
        />
      </section>
    </div>
  );
}
