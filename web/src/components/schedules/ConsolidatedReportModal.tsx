"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { generateConsolidatedCleanupReportPdf } from "@/lib/cleanup-report-pdf";
import {
  ConsolidatedCleanupReport,
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
  WASTE_CATEGORY_LABELS,
} from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { format } from "date-fns";
import {
  FileText,
  FileDown,
  Loader2,
  X,
  Users,
  MapPin,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface ConsolidatedReportModalProps {
  scheduleId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConsolidatedReportModal({
  scheduleId,
  isOpen,
  onClose,
}: ConsolidatedReportModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery<ConsolidatedCleanupReport>({
    queryKey: ["schedule-report", scheduleId],
    queryFn: async () => {
      if (!scheduleId) throw new Error("No schedule ID provided");
      const res = await api.get(`/schedules/${scheduleId}/report`);
      return res.data as ConsolidatedCleanupReport;
    },
    enabled: isOpen && Boolean(scheduleId),
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = async () => {
    if (!report) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await generateConsolidatedCleanupReportPdf(
        report,
        `combined-cleanup-report-${report.scheduleId.slice(0, 8)}.pdf`,
      );
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Failed to export the combined report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (isExporting) return;
    setExportError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        overlayClassName="bg-black/50 backdrop-blur-sm"
        className="max-w-4xl max-h-[92vh] flex flex-col p-0 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-slate-100 leading-tight">
                Consolidated Cleanup Mission Report
              </DialogTitle>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Official unified cleanup activity & report breakdown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || isError || !report || isExporting}
              className="gap-1.5 h-8 text-xs font-semibold rounded-xl border-gray-200 dark:border-slate-700 dark:text-slate-200"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              {isExporting ? "Exporting…" : "Export PDF"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isExporting}
              className="h-8 w-8 p-0 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {exportError && (
          <p role="alert" className="px-6 pt-3 text-xs font-medium text-rose-700 dark:text-rose-300">
            {exportError}
          </p>
        )}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold">Generating unified cleanup report...</p>
            </div>
          )}

          {isError && (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
                Failed to load consolidated report
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                Could not retrieve aggregated cleanup data for this schedule.
              </p>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Official Document Letterhead */}
              <div className="text-center pb-4 border-b border-gray-200 dark:border-slate-800 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold">
                  Republic of the Philippines • Province of Davao del Norte
                </p>
                <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 tracking-tight">
                  CITY ENVIRONMENT AND NATURAL RESOURCES OFFICE (CENRO)
                </h2>
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                  City of Panabo — Coastal Waste Management Division
                </p>
              </div>

              {/* Schedule Title & Meta Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-blue-50/30 to-white dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 border border-indigo-100/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                      style={{
                        backgroundColor: `${SCHEDULE_STATUS_COLORS[report.overallStatus]}15`,
                        color: SCHEDULE_STATUS_COLORS[report.overallStatus],
                        border: `1px solid ${SCHEDULE_STATUS_COLORS[report.overallStatus]}35`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            SCHEDULE_STATUS_COLORS[report.overallStatus],
                        }}
                      />
                      {SCHEDULE_STATUS_LABELS[report.overallStatus]}
                    </span>
                    <span className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
                      ID: {report.scheduleId.slice(0, 8)}...
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                    {report.scheduleTitle}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{report.barangay}</span>
                    <span>•</span>
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      {format(new Date(report.scheduledAt), "MMMM d, yyyy (EEEE)")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
                    Grouped Reports
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-1">
                    {report.summary.totalReports}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Waste locations
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
                    Reporting Citizens
                  </p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {report.summary.totalCitizens}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Unique contributors
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
                    Locations Cleaned
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {report.summary.cleanedReportsCount} / {report.summary.totalReports}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    {report.summary.isFullyCleaned ? "100% complete" : "In progress"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
                    Assigned Workers
                  </p>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {report.assignedWorkers.length}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Field responders
                  </p>
                </div>
              </div>

              {/* Completion Information (if verified or notes exist) */}
              {(report.completionInfo?.verifiedAt || report.completionInfo?.notes || report.notes) && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Cleanup Completion & Verification Information</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950 dark:text-emerald-200">
                    {report.completionInfo?.verifiedBy && (
                      <p>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-400">Verified By:</span>{" "}
                        {report.completionInfo.verifiedBy.name}
                      </p>
                    )}
                    {report.completionInfo?.verifiedAt && (
                      <p>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-400">Verification Date:</span>{" "}
                        {format(new Date(report.completionInfo.verifiedAt), "MMM d, yyyy h:mm a")}
                      </p>
                    )}
                  </div>
                  {(report.completionInfo?.notes || report.notes) && (
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 pl-6 border-l-2 border-emerald-300 dark:border-emerald-700 italic">
                      &quot;{report.completionInfo?.notes || report.notes}&quot;
                    </p>
                  )}
                </div>
              )}

              {/* Grouped Waste Reports Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Individual Associated Waste Reports ({report.groupedReports.length})
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Retaining original report identity, citizen attribution & coordinates
                  </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {report.groupedReports.map((r, idx) => (
                    <div
                      key={r.id}
                      className="p-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>

                        {r.photoUrls[0] && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                            <Image
                              src={r.photoUrls[0]}
                              alt={r.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                              {r.title}
                            </p>
                            <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              ID: {r.id.slice(0, 8)}...
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(r.id, r.id)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Copy full Report ID"
                            >
                              {copiedId === r.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{r.address || "Panabo City"}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ({r.latitude.toFixed(5)}, {r.longitude.toFixed(5)})
                            </span>
                          </p>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {WASTE_CATEGORY_LABELS[r.category] || r.category}
                            </span>
                            {r.severity && <SeverityBadge severity={r.severity} />}
                            {r.wasteQuantity != null && (
                              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                Est. Quantity: {r.wasteQuantity} items
                              </span>
                            )}
                            <span className="text-[11px] text-gray-500 dark:text-slate-400">
                              Reporter: {r.isAnonymous ? "Anonymous Citizen" : r.reporter?.name || "Citizen"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-end justify-between md:justify-start gap-2 shrink-0">
                        <StatusBadge status={r.status} />
                        {r.cleanupPhotoUrls.length > 0 && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-medium">
                            ✓ Proof Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Personnel and Equipment Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Field Responders ({report.assignedWorkers.length})
                  </h5>
                  <div className="space-y-1.5">
                    {report.assignedWorkers.map((w) => (
                      <div
                        key={w.id}
                        className="text-xs text-gray-800 dark:text-slate-200 flex items-center justify-between"
                      >
                        <span className="font-semibold">
                          {w.firstName} {w.lastName}
                        </span>
                        <span className="text-gray-500 dark:text-slate-400 text-[11px]">
                          {w.phone || w.email || "Field Worker"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    Allocated Protective Gear & Equipment
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {report.equipment && report.equipment.length > 0 ? (
                      report.equipment.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[11px] font-medium text-gray-700 dark:text-slate-300"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Standard cleanup safety equipment
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Signatures / Authority Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="font-bold text-gray-800 dark:text-slate-200 uppercase">
                    Prepared By:
                  </p>
                  <div className="mt-8 pt-1 border-t border-gray-400 mx-auto max-w-xs font-semibold text-gray-700 dark:text-slate-300">
                    City ENRO Field Coordination Unit
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-slate-200 uppercase">
                    Approved By:
                  </p>
                  <div className="mt-8 pt-1 border-t border-gray-400 mx-auto max-w-xs font-semibold text-gray-700 dark:text-slate-300">
                    CGDH, City ENRO Panabo
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
