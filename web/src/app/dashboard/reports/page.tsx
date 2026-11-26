import { ReportsTable } from "@/components/ReportsTable";
import { getDashboardReports } from "@/lib/dashboard-reports";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const adminReports = await getDashboardReports(500);

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          <>
            Browse, filter, and sort all submitted coastal waste reports.
            {adminReports && (
              <> {adminReports.length} total report{adminReports.length !== 1 ? "s" : ""}.</>
            )}
          </>
        }
      />

      <ReportsTable reports={adminReports} />
    </div>
  );
}
