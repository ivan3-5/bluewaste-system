import MapView from "@/components/MapView";
import { getDashboardReports } from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

export default async function DashboardMapPage() {
  const adminReports = await getDashboardReports(2000);

  return <MapView reports={adminReports} />;
}