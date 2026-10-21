"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  CleanupSchedule,
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
  CleanupScheduleStatus,
  Report,
} from "@/types";
import { format } from "date-fns";
import {
  MapPin,
  Clock,
  Users,
  CalendarDays,
  Edit,
  Trash2,
  CheckCircle2,
  FileText,
  Wrench,
  Link2,
  X,
  Phone,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface ScheduleDetailProps {
  schedule: CleanupSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (schedule: CleanupSchedule) => void;
  onRefresh?: (schedule: CleanupSchedule) => void;
  onDelete: (id: string) => Promise<void>;
  onVerify: (id: string, notes?: string) => Promise<void>;
  onWorkerUpdateStatus?: (
    id: string,
    status: CleanupScheduleStatus,
    notes?: string,
  ) => Promise<void>;
  isAdmin: boolean;
}

export function ScheduleDetail({
  schedule,
  isOpen,
  onClose,
  onEdit,
  onRefresh,
  onDelete,
  onVerify,
  onWorkerUpdateStatus,
  isAdmin,
}: ScheduleDetailProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinkingReports, setIsLinkingReports] = useState(false);
  const [linkDraftIds, setLinkDraftIds] = useState<string[]>([]);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Custom confirmation dialog states (no browser prompt / confirm)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState("");

  if (!schedule) return null;

  const handleCopyCoordinates = () => {
    const text = `${schedule.latitude.toFixed(6)}, ${schedule.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(schedule.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmVerify = async () => {
    try {
      setIsVerifying(true);
      await onVerify(schedule.id, verifyNotes.trim() || undefined);
      setShowVerifyModal(false);
      setVerifyNotes("");
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWorkerUpdate = async (status: CleanupScheduleStatus) => {
    if (onWorkerUpdateStatus) {
      await onWorkerUpdateStatus(schedule.id, status);
      onClose();
    }
  };

  // --- Link Reports inline ---
  const { data: eligibleReports = [], isFetching: fetchingReports } = useQuery({
    queryKey: ["reports", "eligible-for-schedule"],
    queryFn: async () => {
      // Only fetch verified reports not yet assigned to any cleanup schedule
      const res = await api.get(
        "/reports?status=VERIFIED&hasCleanupSchedule=false&limit=100",
      );
      const list = (res.data.data as Report[]) || [];
      return list.filter((r) => !r.cleanupScheduleId);
    },
    enabled: isLinkingReports,
  });

  const availableReportsToLink = useMemo(() => {
    const currentReports = (schedule.reports ?? []) as Report[];
    const unassigned = eligibleReports.filter(
      (er) =>
        !er.cleanupScheduleId &&
        !currentReports.some((cr: any) => cr.id === er.id),
    );
    return [...currentReports, ...unassigned];
  }, [schedule.reports, eligibleReports]);

  const linkReportsMutation = useMutation({
    mutationFn: async (reportIds: string[]) => {
      const res = await api.put(`/schedules/${schedule.id}`, {
        reportIds,
        workerIds: schedule.workers.map((w) => w.workerId),
        title: schedule.title,
        description: schedule.description,
        barangay: schedule.barangay,
        latitude: schedule.latitude,
        longitude: schedule.longitude,
        scheduledAt: schedule.scheduledAt,
        equipment: schedule.equipment,
        status: schedule.status,
      });
      return res.data as CleanupSchedule;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["reports", "eligible-for-schedule"],
      });
      setIsLinkingReports(false);
      setLinkDraftIds([]);
      onRefresh?.(updated);
    },
  });

  const openLinkPanel = () => {
    setLinkDraftIds((schedule.reports ?? []).map((r: any) => r.id));
    setIsLinkingReports(true);
  };

  const toggleLinkDraft = (id: string) => {
    setLinkDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          overlayClassName="bg-black/40 backdrop-blur-sm"
          className="max-w-3xl max-h-[92vh] flex flex-col p-0 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="px-8 pt-7 pb-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                    style={{
                      backgroundColor: `${SCHEDULE_STATUS_COLORS[schedule.status]}15`,
                      color: SCHEDULE_STATUS_COLORS[schedule.status],
                      border: `1px solid ${SCHEDULE_STATUS_COLORS[schedule.status]}35`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          SCHEDULE_STATUS_COLORS[schedule.status],
                      }}
                    />
                    {SCHEDULE_STATUS_LABELS[schedule.status]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {schedule.barangay || "Panabo Coastal Area"}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  {schedule.title}
                </DialogTitle>
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Deployment Date
                  </p>
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {format(new Date(schedule.scheduledAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Target Time
                  </p>
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {format(new Date(schedule.scheduledAt), "h:mm a")}
                  </p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    GPS Coordinates
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-mono font-bold text-gray-700 truncate">
                      {schedule.latitude.toFixed(4)}, {schedule.longitude.toFixed(4)}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyCoordinates}
                      title="Copy GPS coordinates"
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {copiedCoords ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Operational Briefing Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Operational Directives & Briefing
              </h4>
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {schedule.description || "No specific instructions provided."}
              </div>
            </div>

            {/* Equipment Allocation (NO TRUNCATION) */}
            {schedule.equipment && schedule.equipment.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    Allocated Protective & Cleanup Gear
                  </h4>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {schedule.equipment.length} items allocated
                  </span>
                </div>
                {/* Full-width flexible chips */}
                <div className="flex flex-wrap gap-2">
                  {schedule.equipment.map((item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-900 shadow-sm"
                    >
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Personnel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Assigned Field Workers ({schedule.workers.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schedule.workers.length === 0 ? (
                  <div className="col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-800 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    No field workers assigned yet. Click &quot;Edit Operation&quot; to
                    assign field workers.
                  </div>
                ) : (
                  schedule.workers.map((w) => (
                    <div
                      key={w.workerId}
                      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                        {w.worker.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {w.worker.firstName} {w.worker.lastName}
                        </p>
                        {w.worker.phone ? (
                          <a
                            href={`tel:${w.worker.phone}`}
                            className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {w.worker.phone}
                          </a>
                        ) : (
                          <p className="text-[11px] text-gray-400">
                            {w.worker.email || "Field Worker"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Linked Waste Reports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Waste Reports ({schedule.reports?.length || 0})
                </h4>
                {isAdmin && !isLinkingReports && (
                  <button
                    onClick={openLinkPanel}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl border border-indigo-100 transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Link Additional Reports
                  </button>
                )}
              </div>

              {/* Inline Link Reports Selector */}
              {isLinkingReports && (
                <div className="border border-indigo-200 rounded-2xl bg-indigo-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      Select Verified Reports to Attach
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsLinkingReports(false)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {fetchingReports ? (
                    <p className="text-xs text-gray-500 py-3 animate-pulse">
                      Loading eligible reports...
                    </p>
                  ) : availableReportsToLink.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">
                      No eligible unassigned waste reports found.
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 bg-white p-2 rounded-xl border border-indigo-100">
                      {availableReportsToLink.map((r) => {
                        const isAssignedToOther = Boolean(
                          r.cleanupScheduleId && r.cleanupScheduleId !== schedule.id,
                        );
                        const isDraftChecked = linkDraftIds.includes(r.id);
                        return (
                          <label
                            key={r.id}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                              isAssignedToOther
                                ? "opacity-50 cursor-not-allowed bg-gray-50"
                                : "hover:bg-indigo-50/50 cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDraftChecked}
                              disabled={isAssignedToOther}
                              onChange={() => {
                                if (!isAssignedToOther) {
                                  toggleLinkDraft(r.id);
                                }
                              }}
                              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-40"
                            />
                            {r.images?.[0]?.imageUrl && (
                              <Image
                                src={r.images[0].imageUrl}
                                alt={r.title}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {r.title}
                                </p>
                                {isAssignedToOther ? (
                                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                    Already Scheduled
                                  </span>
                                ) : isDraftChecked ? (
                                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Selected
                                  </span>
                                ) : (
                                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Available
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                {r.address || schedule.barangay} • {r.status}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsLinkingReports(false)}
                      className="rounded-xl text-xs h-8 px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => linkReportsMutation.mutate(linkDraftIds)}
                      disabled={linkReportsMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-8 px-4 font-bold"
                    >
                      {linkReportsMutation.isPending ? "Saving..." : "Save Links"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Reports Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!schedule.reports || schedule.reports.length === 0 ? (
                  <p className="text-xs text-gray-400 italic col-span-2">
                    No waste reports linked.
                  </p>
                ) : (
                  schedule.reports.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                      {r.images?.[0]?.imageUrl ? (
                        <Image
                          src={r.images[0].imageUrl}
                          alt={r.title}
                          width={56}
                          height={56}
                          unoptimized
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 min-w-0 justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                              {r.title}
                            </p>
                            <Link
                              href={`/dashboard/reports/${r.id}`}
                              target="_blank"
                              className="text-gray-400 hover:text-indigo-600"
                              title="View report details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {r.address || schedule.barangay || "Panabo"}
                          </p>
                        </div>
                        <div className="mt-1">
                          <StatusBadge status={r.status} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Verification / Completion Notes Audit Log */}
            {schedule.notes && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Completion & Verification Log
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed pl-5 whitespace-pre-wrap">
                  {schedule.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-3">
            {isAdmin && (
              <>
                <div>
                  {schedule.status !== "COMPLETED" &&
                    schedule.status !== "CANCELLED" && (
                      <Button
                        onClick={() => setShowVerifyModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 px-4 gap-1.5 shadow-sm shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verify & Complete
                      </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onEdit(schedule)}
                    className="rounded-xl border-gray-200 h-10 px-4 text-xs font-bold gap-1.5 hover:bg-white"
                  >
                    <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit Operation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 h-10 px-4 text-xs font-bold gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </>
            )}

            {!isAdmin && onWorkerUpdateStatus && (
              <div className="w-full flex items-center gap-3">
                {schedule.status === "UPCOMING" && (
                  <Button
                    onClick={() => handleWorkerUpdate("ONGOING")}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 w-full"
                  >
                    Start Cleanup Operation
                  </Button>
                )}
                {schedule.status === "ONGOING" && (
                  <Button
                    onClick={() => handleWorkerUpdate("COMPLETED")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 w-full gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Completed
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Modal: Verify & Complete */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Verify & Complete Operation
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-1">
                Confirm that this coastal cleanup operation has been successfully
                executed and verified.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Completion Notes (Optional)
              </label>
              <Textarea
                rows={3}
                placeholder="e.g., Successfully cleared 15 bags of plastic waste along the shoreline. Area verified by LGU inspector."
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="rounded-xl border-gray-200 text-xs resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVerifyModal(false)}
                disabled={isVerifying}
                className="rounded-xl text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmVerify}
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 px-5 font-bold"
              >
                {isVerifying ? "Verifying..." : "Confirm Completion"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Modal: Delete Schedule */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Delete Cleanup Schedule?
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-800">
                  &quot;{schedule.title}&quot;
                </span>
                ? This action cannot be undone and will unassign workers and
                linked reports.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-xl text-xs h-9 px-4"
              >
                Keep Schedule
              </Button>
              <Button
                size="sm"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-5 font-bold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
