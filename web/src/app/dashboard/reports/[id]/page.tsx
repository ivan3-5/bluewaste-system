import { getDashboardReportById } from "@/lib/dashboard-reports";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import MapView from "@/components/MapView";
import { ReportStatusUpdater } from "@/components/ReportStatusUpdater";
import Link from "next/link";
import { CleanupPhotoCarousel } from "@/components/CleanupPhotoCarousel";
import { getReverseGeocodedLocation, formatAnalysisDetails } from "@/lib/utils";
import { AiAnalysisPanel } from "@/components/AiAnalysisPanel";
import Image from "next/image";
import { CheckCircle2, CalendarDays } from "lucide-react";

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
      <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-2xl font-black tracking-tight">
          Report unavailable
        </h1>
        <p className="text-sm">
          Prisma cannot reach the database right now, so this report cannot be
          loaded. Check `DATABASE_URL` and your Neon connection, then refresh.
        </p>
      </div>
    );
  }

  const cleanupImages = report.images.filter(
    (image) => image.type === "CLEANUP",
  );

  const isAlreadyScheduled =
    Boolean(report.cleanupScheduleId) ||
    ["CLEANUP_SCHEDULED", "IN_PROGRESS", "CLEANED"].includes(report.status);

  let displayLocationName = report.locationName;
  if (displayLocationName.toLowerCase().startsWith("waste report")) {
    const geocoded = await getReverseGeocodedLocation(report.latitude, report.longitude);
    if (geocoded) {
      displayLocationName = geocoded;
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Report Detail
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review report context, compare before and after photos, then
              update cleanup workflow actions.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Current Status
            </p>
            <StatusBadge status={report.status} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Image Comparison
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare the citizen-submitted report with cleanup proof photos.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <figcaption className="border-b border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Citizen Submission
                </figcaption>
                <div className="relative h-72 w-full sm:h-80">
                  <Image
                    src={report.imageUrl}
                    alt={report.locationName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </figure>

              {cleanupImages.length > 0 ? (
                <figure className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <figcaption className="border-b border-emerald-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Cleanup Result
                  </figcaption>
                  <CleanupPhotoCarousel
                    images={cleanupImages.map((image) => ({
                      id: image.id,
                      imageUrl: image.imageUrl,
                    }))}
                  />
                </figure>
              ) : (
                <div className="flex min-h-[18rem] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:min-h-[20rem]">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      No Cleanup Photo Yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Cleanup photos will appear here once uploaded by the field
                      worker.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Location Map</h2>
            <p className="mt-1 text-sm text-slate-500">
              Exact report coordinates for on-ground verification.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
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
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {/* Gemini AI Analysis Panel */}
          <AiAnalysisPanel
            reportId={report.id}
            hasWaste={Boolean(report.aiModel != null || report.analyzedAt != null || (report.severity != null && report.severity !== "SPAM") || (report.aiCategories && report.aiCategories.length > 0)) ? report.category !== "no_waste" : null}
            aiCategories={report.aiCategories}
            severity={report.severity as "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null}
            confidence={report.confidence}
            aiReason={report.aiReason}
            aiModel={report.aiModel}
            aiProcessingMs={report.aiProcessingMs}
            aiGeminiMs={report.aiGeminiMs}
            analyzedAt={report.analyzedAt}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Report Information
            </h2>
            <dl className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Location Name
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">
                  {displayLocationName}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Category
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {report.category.replace(/_/g, " ")}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Coordinates
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Severity
                </dt>
                <dd className="mt-1">
                  <SeverityBadge severity={report.severity} showFallback />
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Reported At
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {new Date(report.reportedAt).toLocaleString()}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-700">
                  {formatAnalysisDetails(report.aiCategories, report.description || report.aiReason)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the report status and assignment as the cleanup progresses.
            </p>
            <div className="mt-4 space-y-4">
              <ReportStatusUpdater
                reportId={report.id}
                initialStatus={report.status}
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Cleanup Scheduling
                </p>
                {isAlreadyScheduled ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200/80 border border-slate-300/80 px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed shadow-none"
                    >
                      <CheckCircle2 className="h-4 w-4 text-slate-500" />
                      Cleanup Schedules
                    </button>
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200/90 p-3 text-xs text-amber-900 shadow-xs">
                      <CalendarDays className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-bold block text-amber-900">Schedule Already Set</span>
                        This report is already assigned to a cleanup schedule.
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/dashboard/schedules"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Cleanup Schedules
                  </Link>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
