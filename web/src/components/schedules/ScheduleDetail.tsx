import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  if (!schedule) return null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      setIsDeleting(true);
      await onDelete(schedule.id);
      setIsDeleting(false);
      onClose();
    }
  };

  const handleVerify = async () => {
    const notes = prompt("Enter completion notes (optional):");
    if (notes !== null) {
      setIsVerifying(true);
      await onVerify(schedule.id, notes);
      setIsVerifying(false);
      onClose();
    }
  };

  const handleWorkerUpdate = async (status: CleanupScheduleStatus) => {
    let notes = "";
    if (status === "COMPLETED") {
      const userNotes = prompt("Enter any notes about the cleanup (optional):");
      if (userNotes === null) return; // Cancelled
      notes = userNotes;
    }

    if (onWorkerUpdateStatus) {
      await onWorkerUpdateStatus(schedule.id, status, notes);
      onClose();
    }
  };

  // --- Link Reports inline ---
  const { data: eligibleReports = [], isFetching: fetchingReports } = useQuery({
    queryKey: ["reports", "eligible-for-schedule"],
    queryFn: async () => {
      const [verified, scheduled] = await Promise.all([
        api.get("/reports?status=VERIFIED&limit=100"),
        api.get("/reports?status=CLEANUP_SCHEDULED&limit=100"),
      ]);
      const combined = [
        ...(verified.data.data as Report[]),
        ...(scheduled.data.data as Report[]),
      ];
      return combined.filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);
    },
    enabled: isLinkingReports,
  });

  const linkReportsMutation = useMutation({
    mutationFn: async (reportIds: string[]) => {
      // Build the full merged list (existing + newly linked)
      const existingIds = (schedule.reports ?? []).map((r: any) => r.id);
      const mergedIds = Array.from(new Set([...existingIds, ...reportIds]));
      const res = await api.put(`/schedules/${schedule.id}`, {
        reportIds: mergedIds,
        // Keep existing workers and other fields intact
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
      queryClient.invalidateQueries({ queryKey: ["reports", "eligible-for-schedule"] });
      setIsLinkingReports(false);
      setLinkDraftIds([]);
      // Refresh the detail modal with the latest data via dedicated callback
      onRefresh?.(updated);
    },
  });

  const openLinkPanel = () => {
    setLinkDraftIds((schedule.reports ?? []).map((r: any) => r.id));
    setIsLinkingReports(true);
  };

  const toggleLinkDraft = (id: string) => {
    setLinkDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-2xl p-8">
        <DialogHeader className="mb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {schedule.title}
            </DialogTitle>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: `${SCHEDULE_STATUS_COLORS[schedule.status]}15`,
                color: SCHEDULE_STATUS_COLORS[schedule.status],
                border: `1px solid ${SCHEDULE_STATUS_COLORS[schedule.status]}40`,
              }}
            >
              {SCHEDULE_STATUS_LABELS[schedule.status]}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(schedule.scheduledAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(schedule.scheduledAt), "h:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 col-span-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-500">{schedule.barangay}</p>
                <p className="text-xs text-gray-400">
                  {schedule.latitude.toFixed(6)},{" "}
                  {schedule.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {schedule.description}
            </p>
          </div>

          {schedule.equipment && schedule.equipment.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50/60 to-blue-50/40 p-4 rounded-2xl border border-indigo-100/50">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <Wrench className="w-5 h-5 text-indigo-600" /> Required Cleanup
                Equipment
                <span className="ml-auto inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-600/10 text-indigo-700 text-xs font-bold">
                  {schedule.equipment.length} items
                </span>
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {schedule.equipment.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-indigo-600 bg-indigo-50"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-xs font-semibold text-indigo-900 truncate">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <Users className="w-5 h-5" /> Assigned Workers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedule.workers.length === 0 ? (
                <p className="text-sm text-gray-500">No workers assigned.</p>
              ) : (
                schedule.workers.map((w) => (
                  <div
                    key={w.workerId}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {w.worker.firstName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {w.worker.firstName} {w.worker.lastName}
                      </p>
                      {w.worker.phone && (
                        <p className="text-xs text-gray-500">
                          {w.worker.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <FileText className="w-5 h-5" /> Linked Waste Reports
              {isAdmin && !isLinkingReports && (
                <button
                  onClick={openLinkPanel}
                  className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-100"
                >
                  <Link2 className="w-3.5 h-3.5" /> Link Reports
                </button>
              )}
            </h4>

            {/* Inline link-reports panel */}
            {isLinkingReports && (
              <div className="mb-4 border border-indigo-100 rounded-2xl bg-indigo-50/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Select reports to link</p>
                {fetchingReports ? (
                  <p className="text-sm text-gray-400 animate-pulse">Loading reports…</p>
                ) : eligibleReports.length === 0 ? (
                  <p className="text-sm text-gray-500">No eligible reports found (VERIFIED or CLEANUP SCHEDULED).</p>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-1.5">
                    {eligibleReports.map((r) => (
                      <label key={r.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={linkDraftIds.includes(r.id)}
                          onChange={() => toggleLinkDraft(r.id)}
                          className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {r.images?.[0]?.imageUrl && (
                          <img
                            src={r.images[0].imageUrl}
                            alt={r.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                          <p className="text-xs text-gray-500 truncate">{r.address || schedule.barangay || "Location unavailable"} · {r.status}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => linkReportsMutation.mutate(linkDraftIds)}
                    disabled={linkReportsMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-9 px-4"
                  >
                    {linkReportsMutation.isPending ? "Saving…" : "Save Links"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setIsLinkingReports(false); setLinkDraftIds([]); }}
                    className="rounded-xl border-gray-200 text-xs h-9 px-4"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!schedule.reports || schedule.reports.length === 0 ? (
                <p className="text-sm text-gray-500">No linked reports.</p>
              ) : (
                schedule.reports.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex flex-col p-3 bg-white/60 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3 mb-2">
                      {r.images?.[0]?.imageUrl && (
                        <img
                          src={r.images[0].imageUrl}
                          alt={r.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                        />
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {r.address || schedule.barangay || "Location unavailable"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {schedule.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="font-semibold text-yellow-800 mb-1">
                Completion Notes
              </h4>
              <p className="text-sm text-yellow-700">{schedule.notes}</p>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              {schedule.status !== "COMPLETED" &&
                schedule.status !== "CANCELLED" && (
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isVerifying ? "Verifying..." : "Verify & Complete"}
                  </Button>
                )}

              <div className="flex-1" />

              <Button
                variant="outline"
                onClick={() => onEdit(schedule)}
                className="gap-2 rounded-xl border-gray-200 h-11 px-6 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 rounded-xl h-11 px-6 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          )}

          {!isAdmin && onWorkerUpdateStatus && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              {schedule.status === "UPCOMING" && (
                <Button
                  onClick={() => handleWorkerUpdate("ONGOING")}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  Start Cleanup
                </Button>
              )}
              {schedule.status === "ONGOING" && (
                <Button
                  onClick={() => handleWorkerUpdate("COMPLETED")}
                  className="bg-green-600 hover:bg-green-700 text-white w-full gap-2"
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
  );
}
