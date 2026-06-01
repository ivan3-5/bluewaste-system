import MapView from "@/components/MapView";
import { getDashboardReports } from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

export default async function DashboardMapPage() {
  const adminReports = await getDashboardReports(2000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Map View
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Plot every report location on an interactive Leaflet map.
        </p>
      </div>

      <MapView reports={adminReports} />
    </div>
  );
}
