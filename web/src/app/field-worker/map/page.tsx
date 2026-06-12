"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAssignedReports } from "@/hooks/useReports";
import { useQueryClient } from "@tanstack/react-query";
import {
  ReportStatus,
  WASTE_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  Report,
  MapReport,
} from "@/types";
import { StatusBadge } from "@/components/reports/StatusBadge";
import {
  MapPin,
  X,
  ArrowRight,
  RefreshCw,
  Crosshair,
  Clock,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  MapPanelSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

const WasteMap = dynamic(() => import("@/components/map/WasteMap"), {
  ssr: false,
});

const WorkerRoutePanel = dynamic(
  () => import("@/components/map/WorkerRoutePanel"),
  { ssr: false }
);

const STATUS_FILTERS: { value: ReportStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "CLEANUP_SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLEANED", label: "Cleaned" },
];

type MapTab = "assigned" | "route";

export default function FieldWorkerMapPage() {
  const [activeTab, setActiveTab] = useState<MapTab>("assigned");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const queryClient = useQueryClient();
  const mapRef = useRef<L.Map | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isRefetching } = useAssignedReports({
    page: 1,
    status: statusFilter || undefined,
  });

  // Auto-refresh every 10 seconds (matching mobile app behavior)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["assigned-reports"] });
    }, 10000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const reports = useMemo(() => data?.data || [], [data]);
  const pagination = data?.pagination;

  const mapReports = useMemo<MapReport[]>(() => {
    return reports.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      latitude: r.latitude,
      longitude: r.longitude,
      address: r.address,
      createdAt: r.createdAt,
      images: r.images,
    }));
  }, [reports]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [reports]);

  // Map from report.id -> full Report, for lookups in handleReportClick
  const reportsMap = useMemo(() => {
    const map = new Map<string, Report>();
    reports.forEach((r) => map.set(r.id, r));
    return map;
  }, [reports]);

  const handleReportClick = useCallback((report: MapReport) => {
    setSelectedReport((prev) => {
      // Toggle off if the same marker is clicked again
      if (prev?.id === report.id) return null;
      // Otherwise find the full Report object and show it
      const fullReport = reportsMap.get(report.id) || null;
      return fullReport;
    });
  }, [reportsMap]);

  const handleMapReady = useCallback((map: L.Map | null) => {
    mapRef.current = map;
  }, []);

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([7.3132, 125.6844], 13, { animate: true });
    }
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["assigned-reports"] });
  }, [queryClient]);

  const handleClosePanel = useCallback(() => {
    setSelectedReport(null);
  }, []);

  // Scroll to top of panel when report changes
  useEffect(() => {
    if (selectedReport && panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [selectedReport]);

  // Close detail panel when switching tabs
  useEffect(() => {
    setSelectedReport(null);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeadingSkeleton />
        <MapPanelSkeleton />
      </div>
    );
  }

  const totalCount = pagination?.total || reports.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Field Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          View assigned waste reports and navigate your optimized route
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          id="tab-assigned-map"
          onClick={() => setActiveTab("assigned")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "assigned"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Assigned Map
        </button>
        <button
          id="tab-worker-route"
          onClick={() => setActiveTab("route")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "route"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {/* Route icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="19" r="3" />
            <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
            <circle cx="18" cy="5" r="3" />
          </svg>
          Worker Route
        </button>
      </div>

      {/* ── Assigned Map tab ─────────────────────────────────────────── */}
      {activeTab === "assigned" && (
        <>
          {/* Top Panel - Matches mobile's _buildTopPanel */}
          <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tap any marker to open complete report details.
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefetching}
                className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                title="Refresh reports"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-600 ${isRefetching ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {/* Status Count Pills - matches mobile */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === ""
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {totalCount} Total
              </button>
              {STATUS_FILTERS.filter((f) => f.value !== "").map(({ value, label }) => {
                const isActive = statusFilter === value;
                const count = statusCounts[value];
                if (!count && !isActive) return null;
                return (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {count} {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-xl border overflow-hidden relative">
            {/* Gradient Overlay - matches mobile */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-[500] bg-gradient-to-b from-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-[500] bg-gradient-to-t from-white/10 to-transparent" />

            {/* Map */}
            <div className="h-[500px] sm:h-[600px] relative">
              <WasteMap
                reports={mapReports}
                onReportClick={handleReportClick}
                onMapReady={handleMapReady}
              />

              {/* Floating Action Buttons - matches mobile's _buildMapActions */}
              <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1 bg-white rounded-xl border shadow-lg overflow-hidden">
                <button
                  onClick={handleRecenter}
                  className="p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  title="Recenter map"
                  aria-label="Recenter map"
                >
                  <Crosshair className="w-4 h-4 text-gray-600" />
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  className="p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Refresh markers"
                  aria-label="Refresh markers"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-600 ${isRefetching ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Loading Overlay - matches mobile */}
            {isRefetching && !isLoading && (
              <div className="absolute inset-0 z-[1001] bg-black/5 pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Empty State - matches mobile */}
            {!isLoading && reports.length === 0 && (
              <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/60">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {statusFilter
                      ? `No ${REPORT_STATUS_LABELS[statusFilter as ReportStatus] || ""} reports assigned`
                      : "No assigned reports on map"}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {statusFilter
                      ? "Try a different filter to see reports on the map."
                      : "There are no reports assigned to you right now."}
                  </p>
                  {statusFilter && (
                    <button
                      onClick={() => setStatusFilter("")}
                      className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Selected Report Header Bar (mobile-friendly quick peek) */}
            {selectedReport && (
              <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-b shadow-sm px-4 py-3 sm:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selectedReport.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedReport.status} />
                      <span className="text-xs text-gray-500">
                        {WASTE_CATEGORY_LABELS[selectedReport.category]}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleClosePanel}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="Close details"
                    aria-label="Close details"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Report Detail Panel - Matches mobile's bottom sheet modal */}
          {selectedReport && (
            <div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleClosePanel();
              }}
            >
              <div
                ref={panelRef}
                className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
              >
                {/* Drag Handle (mobile) */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm pt-3 pb-1 flex justify-center sm:hidden rounded-t-2xl">
                  <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Close button */}
                <button
                  onClick={handleClosePanel}
                  className="absolute top-3 right-3 z-20 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>

                {/* Content */}
                <div className="px-5 pb-6 pt-2 sm:pt-6">
                  {/* Title */}
                  <h2 className="text-lg font-extrabold text-gray-900 pr-10 leading-tight mb-3">
                    {selectedReport.title}
                  </h2>

                  {/* Status & Category Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <StatusBadge status={selectedReport.status} />
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                      {WASTE_CATEGORY_LABELS[selectedReport.category]}
                    </span>
                  </div>

                  {/* Info Rows - matches mobile _InfoRow pattern */}
                  <div className="space-y-3">
                    {/* Coordinates */}
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Coordinates
                        </p>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    {selectedReport.address && (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            Address
                          </p>
                          <p className="text-sm text-gray-800 mt-0.5">
                            {selectedReport.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description Section */}
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Description
                      </p>
                      <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedReport.description?.trim()
                            ? selectedReport.description
                            : "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Photo Count */}
                    <div className="flex items-start gap-2.5">
                      <ImageIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Attached Photos
                        </p>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {selectedReport.images?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Report Images Preview */}
                    {selectedReport.images && selectedReport.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedReport.images.slice(0, 4).map((img, idx) => (
                          <div
                            key={img.id || idx}
                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                          >
                            <img
                              src={img.imageUrl}
                              alt={`Report ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reported Date */}
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Reported
                        </p>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {formatDateTime(selectedReport.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </p>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {formatDateTime(selectedReport.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <Link
                      href={`/field-worker/tasks/${selectedReport.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-5 py-3 text-sm font-semibold transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      View Full Task Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={handleClosePanel}
                      className="flex w-full items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Worker Route tab ──────────────────────────────────────────── */}
      {activeTab === "route" && <WorkerRoutePanel />}
    </div>
  );
}