"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMapData } from "@/hooks/useReports";
import {
  Filter,
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  Tag,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  MapReport,
  WASTE_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  STATUS_COLORS,
} from "@/types";
import { timeAgo } from "@/lib/utils";

const WasteMap = dynamic(() => import("@/components/map/WasteMap"), {
  ssr: false,
});

const PANABO_CITY_CENTER: [number, number] = [7.3056, 125.6839];

export default function CitizenMapPage() {
  const [bucket, setBucket] = useState<"" | "with_waste">("");
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Waste Map</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Active waste reports across Panabo City, Davao del Norte
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
          <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 border border-blue-100">
            {filteredReports.length} Reports
          </span>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-[calc(100vh-14rem)] min-h-[450px] overflow-hidden rounded-2xl border border-gray-200 shadow-md">
        {isLoading ? (
          <div className="flex h-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span className="text-sm">Loading map data for Panabo City…</span>
            </div>
          </div>
        ) : (
          <WasteMap
            reports={filteredReports}
            center={PANABO_CITY_CENTER}
            zoom={13.5}
            onReportClick={(report) => setSelectedReport(report)}
          />
        )}
      </div>

      {/* Waste bucket legend strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          onClick={() => setBucket(bucket === "with_waste" ? "" : "with_waste")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
            bucket === "with_waste"
              ? "border-transparent bg-blue-600 text-white shadow-sm"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          <span
            className={`h-2 w-2 flex-shrink-0 rounded-full ${
              bucket === "with_waste" ? "bg-white/70" : "bg-red-500"
            }`}
          />
          With Waste
        </button>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Tag className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-gray-900">Report Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="max-h-[80vh] overflow-y-auto p-5 space-y-4">
              {/* Photo Preview */}
              {selectedReport.images?.[0]?.imageUrl ? (
                <div className="relative h-52 w-full overflow-hidden rounded-xl bg-gray-100 shadow-inner">
                  <Image
                    src={selectedReport.images[0].imageUrl}
                    alt={selectedReport.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
                  No image photo attached
                </div>
              )}

              {/* Title & Badges */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedReport.title}
                </h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${STATUS_COLORS[selectedReport.status] || "#3b82f6"}18`,
                      color: STATUS_COLORS[selectedReport.status] || "#3b82f6",
                      border: `1px solid ${STATUS_COLORS[selectedReport.status] || "#3b82f6"}40`,
                    }}
                  >
                    {REPORT_STATUS_LABELS[selectedReport.status] || selectedReport.status}
                  </span>

                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                    {WASTE_CATEGORY_LABELS[selectedReport.category] || selectedReport.category}
                  </span>

                  {selectedReport.severity && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        selectedReport.severity === "CRITICAL"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : selectedReport.severity === "HIGH"
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : selectedReport.severity === "MODERATE"
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {selectedReport.severity}
                    </span>
                  )}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 text-sm text-gray-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-900">Location: </span>
                    <span>
                      {selectedReport.address ||
                        `${selectedReport.latitude.toFixed(5)}, ${selectedReport.longitude.toFixed(5)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-900">Report Date: </span>
                    <span>
                      {new Date(selectedReport.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-900">Time Submitted: </span>
                    <span>{timeAgo(selectedReport.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

