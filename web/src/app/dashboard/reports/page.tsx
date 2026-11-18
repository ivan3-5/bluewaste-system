import Link from "next/link";
import { Plus } from "lucide-react";
import { ReportsTable } from "@/components/ReportsTable";
import { getDashboardReports } from "@/lib/dashboard-reports";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

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
        actions={
          <Button asChild className="rounded-xl font-semibold">
            <Link href="/report-waste">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Report
            </Link>
          </Button>
        }
      />

      <ReportsTable reports={adminReports} />
    </div>
  );
}
