import { DashboardMapClient } from "@/components/map/DashboardMapClient";
import { DEFAULT_DASHBOARD_RANGE, getDashboardPeriod, isDashboardRange } from "@/lib/dashboard-period";
import { getDashboardReports } from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

export default async function DashboardMapPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const { range: requestedRange } = await searchParams;
  const range = isDashboardRange(requestedRange) ? requestedRange : DEFAULT_DASHBOARD_RANGE;
  const adminReports = await getDashboardReports(1000, getDashboardPeriod(range));

  return <DashboardMapClient reports={adminReports} dateRange={range} />;
}
