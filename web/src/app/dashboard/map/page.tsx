import { DashboardMapClient } from "@/components/map/DashboardMapClient";
import { getDashboardReports } from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

export default async function DashboardMapPage() {
  const adminReports = await getDashboardReports(1000);

  return <DashboardMapClient reports={adminReports} />;
}