import { ReportsTable } from "@/components/ReportsTable";
import { getDashboardReports } from "@/lib/dashboard-reports";

export default async function ReportsPage() {
  const adminReports = await getDashboardReports(500);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Reports
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Browse, filter, and sort all submitted coastal waste reports.
        </p>
      </div>

      <ReportsTable reports={adminReports} />
    </div>
  );
}
