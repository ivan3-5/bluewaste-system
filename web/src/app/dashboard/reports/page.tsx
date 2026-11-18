import { ReportsTable } from "@/components/ReportsTable";
import { getDashboardReports } from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const adminReports = await getDashboardReports(500);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Browse, filter, and sort all submitted coastal waste reports.
      </p>

      <ReportsTable reports={adminReports} />
    </div>
  );
}
