"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers } from "@/hooks/useUsers";
import { useAssignWorker } from "@/hooks/useReports";
import { X, Check, UserPlus } from "lucide-react";

export default function AssignWorker({
  reportId,
  initialAssignedToId,
  initialWorkerIds = [],
  status,
}: {
  reportId: string;
  initialAssignedToId?: string | null;
  initialWorkerIds?: string[];
  status?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const { data } = useUsers({ role: "FIELD_WORKER", limit: 100 });
  const workers = data?.data || [];

  const defaultSelected = initialWorkerIds.length > 0
    ? initialWorkerIds
    : initialAssignedToId
      ? [initialAssignedToId]
      : [];

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialWorkerIds.length > 0) {
      setSelectedIds(initialWorkerIds);
    } else if (initialAssignedToId) {
      setSelectedIds([initialAssignedToId]);
    }
  }, [initialAssignedToId, initialWorkerIds]);

  const assign = useAssignWorker();

  // Only LGU admins can assign
  if (user?.role !== "LGU_ADMIN") return null;

  // Allow assignment until report is actively in-progress or in a terminal state
  const isDisabled = status
    ? ["IN_PROGRESS", "CLEANED", "REJECTED"].includes(status) && selectedIds.length > 0
    : false;

  const toggleWorker = (workerId: string) => {
    setSelectedIds((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : Array.from(new Set([...prev, workerId]))
    );
  };

  const removeWorker = (workerId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== workerId));
  };

  const onAssign = async () => {
    setMessage("");
    if (selectedIds.length === 0) {
      setMessage("Please select at least one worker to assign.");
      return;
    }
    const uniqueIds = Array.from(new Set(selectedIds));
    try {
      await assign.mutateAsync({ reportId, workerIds: uniqueIds });
      setMessage("Assignments updated successfully.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update assignments.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-600" /> Assign Field Workers
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select one or more field workers to assign to this cleanup report.
        </p>
      </div>

      {/* Badges / Chips list */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No workers assigned</span>
        ) : (
          selectedIds.map((id) => {
            const worker = workers.find((w) => w.id === id);
            const name = worker ? `${worker.firstName} ${worker.lastName}` : "Field Worker";
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                  {name.charAt(0)}
                </span>
                {name}
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={() => removeWorker(id)}
                    className="ml-0.5 rounded-full p-0.5 text-blue-600 hover:bg-blue-200/60 hover:text-blue-900 transition"
                    title={`Remove ${name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })
        )}
      </div>

      {/* Checkbox List */}
      <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-slate-200 p-2 bg-white divide-y divide-slate-100">
        {workers.length === 0 ? (
          <p className="text-xs text-slate-400 p-2">Loading field workers...</p>
        ) : (
          workers.map((w) => {
            const isChecked = selectedIds.includes(w.id);
            return (
              <label
                key={w.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition select-none text-xs font-medium ${
                  isChecked ? "bg-blue-50/70 text-blue-900" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleWorker(w.id)}
                    disabled={isDisabled}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span>
                    {w.firstName} {w.lastName}
                  </span>
                </div>
                {isChecked && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </label>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onAssign}
          disabled={assign.isPending || isDisabled}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assign.isPending ? "Saving..." : "Save Assignments"}
        </button>
        {message && <p className="text-xs font-medium text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
