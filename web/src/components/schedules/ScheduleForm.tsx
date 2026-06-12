import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { CleanupScheduleStatus, User, Report } from "@/types";
import { Users, FileText, Wrench } from "lucide-react";

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  workers: User[];
  isEditing?: boolean;
}

export function ScheduleForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  workers,
  isEditing = false,
}: ScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    barangay: "",
    latitude: 7.3032,
    longitude: 125.6811,
    scheduledAt: "",
    workerIds: [] as string[],
    reportIds: [] as string[],
    status: "UPCOMING" as CleanupScheduleStatus,
    equipment: [] as string[],
  });

  const { data: eligibleReports = [] } = useQuery({
    queryKey: ["reports", "verified"],
    queryFn: async () => {
      const res = await api.get("/reports?status=VERIFIED&limit=100");
      return res.data.data as Report[];
    },
    enabled: isOpen,
  });

  const displayedReports =
    isEditing && initialData?.reports
      ? [
          ...initialData.reports,
          ...eligibleReports.filter(
            (er) => !initialData.reports.find((ir: any) => ir.id === er.id),
          ),
        ]
      : eligibleReports;

  useEffect(() => {
    if (initialData && isOpen) {
      const getLocalDatetimeStr = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "";
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      };

      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        barangay: initialData.barangay || "",
        latitude: initialData.latitude || 7.3032,
        longitude: initialData.longitude || 125.6811,
        scheduledAt: getLocalDatetimeStr(initialData.scheduledAt),
        workerIds: initialData.workers
          ? initialData.workers.map((w: any) => w.workerId)
          : [],
        reportIds: initialData.reports
          ? initialData.reports.map((r: any) => r.id)
          : [],
        status: initialData.status || "UPCOMING",
        equipment: initialData.equipment || [],
      });
    } else if (isOpen && !isEditing) {
      setFormData({
        title: "",
        description: "",
        barangay: "",
        latitude: 7.3032,
        longitude: 125.6811,
        scheduledAt: "",
        workerIds: [],
        reportIds: [],
        status: "UPCOMING",
        equipment: [],
      });
    }
  }, [initialData, isOpen, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      if (payload.scheduledAt) {
        payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
      }

      if (payload.reportIds && payload.reportIds.length > 0) {
        const selectedReports = displayedReports.filter((r: any) =>
          payload.reportIds.includes(r.id),
        );
        if (selectedReports.length > 0) {
          const sumLat = selectedReports.reduce(
            (sum: number, r: any) => sum + r.latitude,
            0,
          );
          const sumLng = selectedReports.reduce(
            (sum: number, r: any) => sum + r.longitude,
            0,
          );
          payload.latitude = sumLat / selectedReports.length;
          payload.longitude = sumLng / selectedReports.length;

          if (!payload.barangay && selectedReports[0].address) {
            payload.barangay = selectedReports[0].address;
          }
        }
      }

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerToggle = (workerId: string) => {
    setFormData((prev) => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter((id) => id !== workerId)
        : [...prev.workerIds, workerId],
    }));
  };

  const handleReportToggle = (reportId: string) => {
    setFormData((prev) => ({
      ...prev,
      reportIds: prev.reportIds.includes(reportId)
        ? prev.reportIds.filter((id) => id !== reportId)
        : [...prev.reportIds, reportId],
    }));
  };

  const handleEquipmentToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const EQUIPMENT_OPTIONS = [
    "Garbage Bags",
    "Gloves",
    "Face Masks",
    "Safety Vests",
    "Brooms",
    "Rakes",
    "Shovels",
    "Trash Pickers",
    "Wheelbarrows",
    "First Aid Kit",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="bg-transparent backdrop-blur-none"
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8"
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Schedule" : "Create New Schedule"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="title" className="text-gray-700 font-semibold">
                Title
              </Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 transition-all h-11"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="barangay" className="text-gray-700 font-semibold">
                Barangay / Location
              </Label>
              <Input
                id="barangay"
                required
                value={formData.barangay}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, barangay: e.target.value }))
                }
                className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 transition-all h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-gray-700 font-semibold"
            >
              Description
            </Label>
            <Textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="scheduledAt"
              className="text-gray-700 font-semibold"
            >
              Date & Time
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              required
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 transition-all h-11"
            />
          </div>

          <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 rounded-2xl border border-indigo-100/40">
            <div className="flex items-center justify-between">
              <Label className="text-gray-900 font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                Required Cleanup Equipment
              </Label>
              {formData.equipment.length > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {formData.equipment.length} selected
                </span>
              )}
            </div>
            {formData.equipment.length === 0 && (
              <p className="text-xs text-gray-600 mb-2">
                Select all equipment needed for this cleanup operation
              </p>
            )}
            <div className="grid grid-cols-5 gap-2">
              {EQUIPMENT_OPTIONS.map((item) => {
                const isSelected = formData.equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleEquipmentToggle(item)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-300 bg-white hover:border-indigo-400"
                    }`}
                    title={item}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? "text-indigo-900" : "text-gray-700"
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 font-semibold">
                Status
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as CleanupScheduleStatus,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700 font-semibold">
              <FileText className="w-4 h-4 text-indigo-500" /> Link Waste
              Reports
            </Label>
            <div className="border border-gray-100 rounded-2xl divide-y max-h-48 overflow-y-auto bg-gray-50/30">
              {displayedReports.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No eligible waste reports available.
                </div>
              ) : (
                displayedReports.map((report: any) => (
                  <label
                    key={report.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.reportIds.includes(report.id)}
                      onChange={() => handleReportToggle(report.id)}
                      className="rounded text-primary focus:ring-primary h-4 w-4 flex-shrink-0"
                    />
                    {report.images && report.images.length > 0 ? (
                      <img
                        src={report.images[0].imageUrl}
                        alt="report"
                        className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {report.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {report.address || "No address"} • {report.status}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="text-xs text-gray-500 italic">
              * Selecting reports will automatically set the map coordinates for
              this schedule.
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700 font-semibold">
              <Users className="w-4 h-4 text-indigo-500" /> Assign Workers
            </Label>
            <div className="border border-gray-100 rounded-2xl divide-y max-h-48 overflow-y-auto bg-gray-50/30">
              {workers.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No workers available.
                </div>
              ) : (
                workers.map((worker) => (
                  <label
                    key={worker.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.workerIds.includes(worker.id)}
                      onChange={() => handleWorkerToggle(worker.id)}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <div className="text-sm font-medium">
                        {worker.firstName} {worker.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {worker.email}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100/60 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-11 px-6 border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.workerIds.length === 0}
              className="rounded-xl h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 text-white font-semibold transition-all"
            >
              {loading ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
