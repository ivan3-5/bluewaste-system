import { getDashboardReportById } from "@/lib/dashboard-reports";
import { StatusBadge } from "@/components/StatusBadge";
import MapView from "@/components/MapView";
import { ReportStatusUpdater } from "@/components/ReportStatusUpdater";
import AssignWorker from "@/components/AssignWorker";
import { notFound } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Report Detail
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Full submission details and location verification.
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img
            src={report.imageUrl}
            alt={report.locationName}
            className="h-full w-full max-h-[32rem] object-cover"
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Location Name
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {report.locationName}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Category
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {report.category}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Coordinates
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Reported At
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date(report.reportedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="text-sm text-slate-600">
              {report.description || "No description provided."}
            </p>
          </div>

          {cleanupImages.length > 0 && (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700">
                  Cleanup Photos
                </p>
                <p className="text-sm text-slate-600">
                  Uploaded by the field worker after cleanup completion.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {cleanupImages.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm"
                  >
                    <img
                      src={image.imageUrl}
                      alt="Cleanup proof"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <ReportStatusUpdater
            reportId={report.id}
            initialStatus={report.status}
          />
          <div className="mt-4">
            <AssignWorker
              reportId={report.id}
              initialAssignedToId={report.assignedToId}
              initialAssignedToName={report.assignedToName}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold text-slate-900">Location Map</h2>
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
              locationName: report.locationName,
              description: report.description,
              status: report.status,
              reportedAt: report.reportedAt,
              updatedAt: report.updatedAt,
            },
          ]}
          center={[report.latitude, report.longitude]}
          zoom={16}
        />
      </div>
    </div>
  );
}
