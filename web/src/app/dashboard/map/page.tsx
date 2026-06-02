import MapView from "@/components/MapView";
import { getDashboardReports } from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

export default async function DashboardMapPage() {
  const adminReports = await getDashboardReports(2000);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Map View
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Explore reported waste locations, monitor cleanup progress, and
              manage coastal reporting zones in one interactive workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
              Total Reports: {adminReports.length}
            </span>
          </div>
        </div>
      </div>

      <MapView reports={adminReports} />
    </div>
  );
}
