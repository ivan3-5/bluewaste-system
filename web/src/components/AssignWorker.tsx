"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers } from "@/hooks/useUsers";
import { useAssignWorker } from "@/hooks/useReports";

export default function AssignWorker({
  reportId,
  initialAssignedToId,
  initialAssignedToName,
  status,
}: {
  reportId: string;
  initialAssignedToId?: string | null;
  initialAssignedToName?: string | null;
  status?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [assignedTo, setAssignedTo] = useState<string | undefined>(
    initialAssignedToId ?? undefined,
  );
  const [message, setMessage] = useState("");

  const { data } = useUsers({ role: "FIELD_WORKER", limit: 100 });
  const workers = data?.data || [];

  const assign = useAssignWorker();

  // Only LGU admins can assign
  if (user?.role !== "LGU_ADMIN") return null;

  // Allow assignment until report is actively in-progress or in a terminal state
  const isDisabled = status
    ? ["IN_PROGRESS", "CLEANED", "REJECTED"].includes(status) && !!initialAssignedToId
    : false;

  const onAssign = async () => {
    setMessage("");
    try {
      await assign.mutateAsync({ reportId, assignedToId: assignedTo ?? "" });
      setMessage("Assigned successfully.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to assign.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="assign-field-worker"
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        Assign Field Worker
      </label>
      <div className="flex items-center gap-3">
        <select
          id="assign-field-worker"
          title="Assign Field Worker"
          value={assignedTo ?? ""}
          onChange={(e) => setAssignedTo(e.target.value || undefined)}
          disabled={isDisabled}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.firstName} {w.lastName}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onAssign}
          disabled={!assignedTo || assign.isPending || isDisabled}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assign.isPending ? "Assigning..." : "Assign"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
