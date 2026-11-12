"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMapData } from "@/hooks/useReports";
import { Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const WasteMap = dynamic(() => import("@/components/map/WasteMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export default function PublicMapPage() {
  const [bucket, setBucket] = useState<"" | "with_waste">("");
  const { data: reports = [], isLoading } = useMapData();

  const filteredReports = useMemo(() => {
    if (bucket === "with_waste") {
      return reports.filter((report) => report.status !== "CLEANED");
    }
    return reports;
  }, [reports, bucket]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Reports</h2>
          <p className="mt-0.5 text-sm text-gray-400">
            View all waste reports and cleanup progress across Panabo City
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            title="Filter by waste bucket"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={bucket}
            onChange={(e) =>
              setBucket(e.target.value as "" | "with_waste")
            }
          >
            <option value="">All Reports</option>
            <option value="with_waste">With Waste</option>
          </select>
          <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-500">
            {filteredReports.length}
          </span>
        </div>
      </div>

      {/* Map container */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading ? (
          <div className="h-96 md:h-[600px]">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
        ) : (
          <div className="h-96 md:h-[600px]">
            <WasteMap reports={filteredReports} />
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold">📍 Real-time Waste Tracking</p>
        <p className="mt-1 text-blue-600">
          View active waste reports and cleanup progress. Click on any marker to
          see details, or{" "}
          <a
            href="/register"
            className="font-semibold underline hover:text-blue-800"
          >
            sign up
          </a>{" "}
          to submit your own report.
        </p>
      </div>
    </div>
  );
}
