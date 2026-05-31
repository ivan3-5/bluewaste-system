"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMapData } from "@/hooks/useReports";
import { Filter } from "lucide-react";

const WasteMap = dynamic(() => import("@/components/map/WasteMap"), {
  ssr: false,
});

export default function CitizenMapPage() {
  const [bucket, setBucket] = useState<"" | "with_waste" | "no_waste">("");
  const { data: reports = [], isLoading } = useMapData();

  const filteredReports = useMemo(() => {
    if (bucket === "with_waste") {
      return reports.filter((report) => report.status !== "CLEANED");
    }
    if (bucket === "no_waste") {
      return reports.filter((report) => report.status === "CLEANED");
    }
    return reports;
  }, [reports, bucket]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Map</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Active waste reports across Panabo City
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            title="Filter by waste bucket"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={bucket}
            onChange={(e) =>
              setBucket(e.target.value as "" | "with_waste" | "no_waste")
            }
          >
            <option value="">All Reports</option>
            <option value="with_waste">With Waste</option>
            <option value="no_waste">No Waste</option>
          </select>
          <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-500">
            {filteredReports.length}
          </span>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-[calc(100vh-14rem)] overflow-hidden rounded-2xl border border-gray-100 shadow-md">
        {isLoading ? (
          <div className="flex h-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span className="text-sm">Loading map…</span>
            </div>
          </div>
        ) : (
          <WasteMap reports={filteredReports} />
        )}
      </div>

      {/* Waste bucket legend strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {(
          [
            { key: "with_waste", label: "With Waste" },
            { key: "no_waste", label: "No Waste" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setBucket(bucket === key ? "" : key)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
              bucket === key
                ? "border-transparent bg-blue-600 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <span
              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                bucket === key
                  ? "bg-white/70"
                  : key === "with_waste"
                    ? "bg-red-500"
                    : "bg-emerald-500"
              }`}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
