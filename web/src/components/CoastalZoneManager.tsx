"use client";

import { useState } from "react";
import {
  useReportingZones,
  useCreateReportingZone,
  useUpdateReportingZone,
  useDeleteReportingZone,
} from "@/hooks/useReportingZones";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ReportingZone, ZonePoint } from "@/types";

type FormState = {
  name: string;
};

export default function CoastalZoneManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ReportingZone | null>(null);
  const [formState, setFormState] = useState<FormState>({ name: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zonesQuery = useReportingZones(false);
  const zones = zonesQuery.data || [];
  const createMutation = useCreateReportingZone();
  const updateMutation = useUpdateReportingZone();
  const deleteMutation = useDeleteReportingZone();

  const handleCreateNew = () => {
    setEditingZone(null);
    setFormState({ name: "" });
    setError(null);
    setIsOpen(true);
  };

  const handleEditZone = (zone: ReportingZone) => {
    setEditingZone(zone);
    setFormState({ name: zone.name });
    setError(null);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingZone(null);
    setFormState({ name: "" });
    setError(null);
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setError("Zone name is required");
      return;
    }

    try {
      if (editingZone) {
        // Update existing zone
        await updateMutation.mutateAsync({
          id: editingZone.id,
          name: formState.name.trim(),
        });
      } else {
        // Create new zone with default coordinates (triangle for validity)
        const defaultCoordinates: ZonePoint[] = [
          { lat: 7.3132, lng: 125.6844 },
          { lat: 7.314, lng: 125.685 },
          { lat: 7.3135, lng: 125.686 },
        ];
        await createMutation.mutateAsync({
          name: formState.name.trim(),
          coordinates: defaultCoordinates,
        });
      }
      handleCloseModal();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to save zone. Please try again.",
      );
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await deleteMutation.mutateAsync(zoneId);
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete zone. Please try again.",
      );
    }
  };

  const isLoading =
    zonesQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Coastal Zones
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage coastal zone boundaries for report management.
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={isLoading}>
          Create Zone
        </Button>
      </div>

      {/* Zones Grid */}
      {zones.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <p className="text-sm text-slate-600">
            No coastal zones created yet. Click &quot;Create Zone&quot; to add
            one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Zone Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                  <p className="text-xs text-slate-500">
                    {zone.coordinates.length} coordinate
                    {zone.coordinates.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    zone.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {zone.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Coordinates Preview */}
              {zone.coordinates.length > 0 && (
                <div className="mb-3 rounded bg-slate-50 p-2 text-xs text-slate-600">
                  <p className="font-medium text-slate-700 mb-1">
                    Coordinates:
                  </p>
                  {zone.coordinates.slice(0, 3).map((coord, i) => (
                    <div key={i} className="text-slate-600">
                      {i + 1}. ({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})
                    </div>
                  ))}
                  {zone.coordinates.length > 3 && (
                    <div className="text-slate-500">
                      +{zone.coordinates.length - 3} more...
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="mb-4 space-y-1 text-xs text-slate-600">
                {zone.createdAt && (
                  <p>
                    Created:{" "}
                    {new Date(zone.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {zone.createdBy && (
                  <p>
                    By: {zone.createdBy.firstName} {zone.createdBy.lastName}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditZone(zone)}
                  disabled={isLoading}
                  className="flex-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(zone.id)}
                  disabled={isLoading}
                  className="flex-1 rounded bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Edit Coastal Zone" : "Create New Coastal Zone"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                Zone Name *
              </label>
              <Input
                placeholder="e.g., Northern Coastal Zone"
                value={formState.name}
                onChange={(e) => setFormState({ name: e.target.value })}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {!editingZone && (
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                <p className="font-medium">Note:</p>
                <p>
                  A zone will be created with default coordinates. You can edit
                  the boundary directly on the map afterward.
                </p>
              </div>
            )}

            {editingZone && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-medium">Note:</p>
                <p>
                  To modify the zone boundary, use the map editor on the
                  dashboard.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={handleCloseModal}
              disabled={isLoading}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : editingZone
                  ? "Update Zone"
                  : "Create Zone"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coastal Zone</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete this zone? This action cannot be
              undone.
            </p>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDeleteConfirm(null)}
              disabled={isLoading}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleDeleteZone(deleteConfirm)}
              disabled={isLoading}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
