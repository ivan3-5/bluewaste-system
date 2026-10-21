"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { CleanupScheduleStatus, User, Report } from "@/types";
import { getReverseGeocodedLocation } from "@/lib/utils";
import {
  Users,
  FileText,
  Wrench,
  Calendar,
  MapPin,
  Check,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X,
  Info,
  Compass,
  ShieldCheck,
} from "lucide-react";

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  workers: User[];
  isEditing?: boolean;
}

const SCHEDULE_STATUS_SELECT_STYLES: Record<CleanupScheduleStatus, string> = {
  UPCOMING: "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500",
  ONGOING: "border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-500",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-500",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700 focus:ring-rose-500",
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

const STANDARD_PRESET = [
  "Garbage Bags",
  "Gloves",
  "Face Masks",
  "Safety Vests",
  "Trash Pickers",
];

// Helper to automatically extract and format the Target Barangay based on Location Name
export function detectBarangayFromLocation(locationStr: string): string {
  if (!locationStr || !locationStr.trim()) return "";
  const lower = locationStr.toLowerCase().trim();

  // 1. Direct or partial match with official Panabo coastal barangays
  if (lower.includes("san francisco")) return "Barangay San Francisco";
  if (lower.includes("san pedro")) return "Barangay San Pedro";
  if (lower.includes("cagangohan")) return "Barangay Cagangohan";
  if (lower.includes("san vicente")) return "Barangay San Vicente";
  if (lower.includes("j.p. laurel") || lower.includes("jp laurel"))
    return "Barangay J.P. Laurel";
  if (lower.includes("new visayas")) return "Barangay New Visayas";
  if (lower.includes("tagpore")) return "Barangay Tagpore";
  if (lower.includes("datu abdul")) return "Barangay Datu Abdul Dadia";
  if (lower.includes("maduao")) return "Barangay Maduao";
  if (lower.includes("kasilak")) return "Barangay Kasilak";
  if (lower.includes("malativas")) return "Barangay Malativas";
  if (lower.includes("san nicolas")) return "Barangay San Nicolas";
  if (lower.includes("san roque")) return "Barangay San Roque";
  if (lower.includes("salvacion")) return "Barangay Salvacion";

  // 2. Regex match for "Barangay [Name]" or "Brgy. [Name]"
  const match = locationStr.match(/(?:Barangay|Brgy\.?)\s+([A-Za-z\s]+)/i);
  if (match && match[1]) {
    const raw = match[1].split(",")[0].trim();
    if (raw) return `Barangay ${raw}`;
  }

  // 3. If it already starts with Barangay, return it
  if (lower.startsWith("barangay ") || lower.startsWith("brgy.")) {
    return locationStr.trim();
  }

  // 4. Default for Panabo coastal general area
  if (lower.includes("panabo")) {
    return "Barangay Cagangohan"; // Main Panabo coastal sector
  }

  return locationStr.trim();
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "equipment" | "crew">(
    "details",
  );

  const [formData, setFormData] = useState({
    title: "",
    locationName: "",
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
    queryKey: ["reports", "eligible-for-schedule"],
    queryFn: async () => {
      // Query verified reports with hasCleanupSchedule=false so reports already assigned to other schedules are not fetched
      const res = await api.get(
        "/reports?status=VERIFIED&hasCleanupSchedule=false&limit=100",
      );
      const list = (res.data.data as Report[]) || [];
      return list.filter((r) => !r.cleanupScheduleId);
    },
    enabled: isOpen,
  });

  const displayedReports = useMemo(() => {
    if (isEditing && initialData?.reports) {
      const currentReports = (initialData.reports as Report[]) || [];
      const unassigned = eligibleReports.filter(
        (er) =>
          !er.cleanupScheduleId &&
          !currentReports.some((cr: any) => cr.id === er.id),
      );
      return [...currentReports, ...unassigned];
    }
    return eligibleReports.filter((r) => !r.cleanupScheduleId);
  }, [isEditing, initialData?.reports, eligibleReports]);

  const [geocodedAddresses, setGeocodedAddresses] = useState<Record<string, string>>({});

  const resolveLocationForReport = useCallback(
    (report: any): string => {
      if (
        report.address &&
        report.address.trim() &&
        !report.address.toLowerCase().startsWith("waste report")
      ) {
        return report.address.trim();
      }
      if (geocodedAddresses[report.id]) {
        return geocodedAddresses[report.id];
      }
      if (
        report.title &&
        report.title.trim() &&
        !report.title.toLowerCase().startsWith("waste report")
      ) {
        return report.title.trim();
      }
      return "";
    },
    [geocodedAddresses],
  );

  // Reverse-geocode any reports whose address is missing or generic
  useEffect(() => {
    if (!isOpen || displayedReports.length === 0) return;

    displayedReports.forEach(async (report: any) => {
      const existing = report.address?.trim();
      if (
        (!existing || existing.toLowerCase().startsWith("waste report")) &&
        report.latitude &&
        report.longitude &&
        !geocodedAddresses[report.id]
      ) {
        try {
          const geocoded = await getReverseGeocodedLocation(report.latitude, report.longitude);
          if (geocoded) {
            setGeocodedAddresses((prev) => ({
              ...prev,
              [report.id]: geocoded,
            }));
          }
        } catch {
          // ignore network failure
        }
      }
    });
  }, [isOpen, displayedReports, geocodedAddresses]);


  useEffect(() => {
    setErrorMessage(null);
    if (initialData && isOpen) {
      const getLocalDatetimeStr = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "";
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      };

      const initialBarangay = initialData.barangay || "";
      const rawInitialLoc =
        initialData.reports?.[0]?.address ||
        initialData.barangay ||
        "";
      const initialLocation = rawInitialLoc.toLowerCase().startsWith("waste report")
        ? ""
        : rawInitialLoc;

      setFormData({
        title: initialData.title || "",
        locationName: initialLocation,
        description: initialData.description || "",
        barangay: initialBarangay,
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
        locationName: "",
        description: "",
        barangay: "",
        latitude: 7.3032,
        longitude: 125.6811,
        scheduledAt: "",
        workerIds: [],
        reportIds: [],
        status: "UPCOMING",
        equipment: STANDARD_PRESET,
      });
    }
  }, [initialData, isOpen, isEditing]);

  // Handle Location Name changes: Automatically fills in Target Barangay / Coastal Area
  const handleLocationNameChange = (newLocationName: string) => {
    const autoBarangay = detectBarangayFromLocation(newLocationName);

    // Also check if any eligible unassigned report matches this location name
    const search = newLocationName.toLowerCase().trim();
    const matchingReports = displayedReports.filter((r: any) => {
      if (r.cleanupScheduleId && (!isEditing || r.cleanupScheduleId !== initialData?.id)) {
        return false;
      }
      const addr = (r.address || "").toLowerCase();
      const resolved = resolveLocationForReport(r).toLowerCase();
      const title = !r.title?.toLowerCase().startsWith("waste report") ? r.title.toLowerCase() : "";
      return (addr && addr.includes(search)) || (resolved && resolved.includes(search)) || (title && title.includes(search));
    });

    setFormData((prev) => {
      const updated: any = {
        ...prev,
        locationName: newLocationName,
        barangay: autoBarangay || prev.barangay,
      };

      // If user hasn't typed an operation title, generate one automatically
      if (!prev.title.trim() || prev.title.startsWith("Coastal Cleanup - ")) {
        const shortLoc = newLocationName.split(",").slice(0, 2).join(",").trim();
        updated.title = `Coastal Cleanup - ${shortLoc || newLocationName}`;
      }

      // Auto-link matching reports if not already selected
      if (matchingReports.length > 0 && prev.reportIds.length === 0) {
        updated.reportIds = matchingReports.map((r: any) => r.id);
        updated.latitude = matchingReports[0].latitude;
        updated.longitude = matchingReports[0].longitude;
      }

      return updated;
    });
  };

  // When a waste report is toggled in Tab 1 (Operation Details):
  // Automatically fill in Location Name, Target Barangay, and GPS Coordinates!
  const handleReportToggle = (reportId: string) => {
    const targetReport = displayedReports.find((r: any) => r.id === reportId);
    if (
      targetReport?.cleanupScheduleId &&
      (!isEditing || targetReport.cleanupScheduleId !== initialData?.id)
    ) {
      setErrorMessage(
        `Waste report "${targetReport.title}" is already assigned to another cleanup schedule and cannot be selected.`,
      );
      return;
    }

    setFormData((prev) => {
      const nextReportIds = prev.reportIds.includes(reportId)
        ? prev.reportIds.filter((id) => id !== reportId)
        : [...prev.reportIds, reportId];

      const selected = displayedReports.filter((r: any) =>
        nextReportIds.includes(r.id),
      );

      let newLocationName = prev.locationName;
      let newBarangay = prev.barangay;
      let newLat = prev.latitude;
      let newLng = prev.longitude;

      if (selected.length > 0) {
        const latest = selected[selected.length - 1];
        const resolved = resolveLocationForReport(latest);
        if (resolved) {
          newLocationName = resolved;
        } else if (newLocationName.toLowerCase().startsWith("waste report")) {
          newLocationName = "";
        }

        // Automatically fill in Target Barangay based on this Location Name!
        newBarangay = detectBarangayFromLocation(newLocationName);

        // Average coordinates
        const sumLat = selected.reduce((sum: number, r: any) => sum + r.latitude, 0);
        const sumLng = selected.reduce((sum: number, r: any) => sum + r.longitude, 0);
        newLat = sumLat / selected.length;
        newLng = sumLng / selected.length;
      }

      let updatedTitle = prev.title;
      if (
        !prev.title.trim() ||
        prev.title === "Coastal Cleanup - Waste report" ||
        prev.title.startsWith("Coastal Cleanup - ")
      ) {
        if (newLocationName) {
          const shortLoc = newLocationName.split(",").slice(0, 2).join(",").trim();
          updatedTitle = `Coastal Cleanup - ${shortLoc || newLocationName}`;
        }
      }

      return {
        ...prev,
        reportIds: nextReportIds,
        locationName: newLocationName,
        barangay: newBarangay,
        latitude: newLat,
        longitude: newLng,
        title: updatedTitle,
      };
    });
  };

  const handleWorkerToggle = (workerId: string) => {
    setFormData((prev) => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter((id) => id !== workerId)
        : [...prev.workerIds, workerId],
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

  const applyPreset = (preset: "standard" | "all" | "clear") => {
    if (preset === "standard") {
      setFormData((prev) => ({ ...prev, equipment: STANDARD_PRESET }));
    } else if (preset === "all") {
      setFormData((prev) => ({ ...prev, equipment: EQUIPMENT_OPTIONS }));
    } else {
      setFormData((prev) => ({ ...prev, equipment: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.title.trim()) {
      setErrorMessage("Please provide a title for the cleanup schedule.");
      setActiveTab("details");
      return;
    }
    if (!formData.locationName?.trim() && !formData.barangay?.trim()) {
      setErrorMessage("Please specify the coastal location.");
      setActiveTab("details");
      return;
    }
    if (!formData.scheduledAt) {
      setErrorMessage("Please set a valid date and time for the schedule.");
      setActiveTab("details");
      return;
    }
    if (formData.workerIds.length === 0) {
      setErrorMessage("Please assign at least one field worker.");
      setActiveTab("crew");
      return;
    }
    if (formData.reportIds.length === 0) {
      setErrorMessage(
        "Please link at least one waste report to this cleanup operation.",
      );
      setActiveTab("details");
      return;
    }

    try {
      setLoading(true);
      const payload: any = { ...formData };
      payload.barangay =
        formData.barangay?.trim() ||
        formData.locationName?.trim() ||
        detectBarangayFromLocation(formData.locationName) ||
        "Panabo Coastal Area";
      if (payload.scheduledAt) {
        payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
      }

      delete payload.locationName; // Clean extra helper field before sending to API

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
            payload.barangay = detectBarangayFromLocation(
              selectedReports[0].address,
            );
          }
        }
      }

      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      console.error("Form submission error", error);
      if (error.response?.data?.details) {
        const messages = error.response.data.details
          .map((d: any) => `${d.field}: ${d.message}`)
          .join(" • ");
        setErrorMessage(`Validation error: ${messages}`);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "An error occurred while saving the schedule. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="bg-black/40 backdrop-blur-sm"
        className="max-w-3xl max-h-[92vh] flex flex-col p-0 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/60">
                LGU Operational Dispatch
              </span>
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                {isEditing ? "Edit Cleanup Schedule" : "Create Cleanup Schedule"}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Coordinate personnel, allocate protective equipment, and assign
                verified coastal waste sites.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-gray-100/80 p-1 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "details"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              1. Operation Details
              {formData.reportIds.length > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                  {formData.reportIds.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("equipment")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "equipment"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              2. Equipment
              {formData.equipment.length > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                  {formData.equipment.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("crew")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "crew"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              3. Assign
              {formData.workerIds.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full text-[10px]">
                  {formData.workerIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <div className="flex-1">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Operation Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label
                      htmlFor="title"
                      className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Operation Title *
                    </Label>
                    <Input
                      id="title"
                      required
                      minLength={3}
                      maxLength={200}
                      placeholder="e.g., Coastal Sweep - Barangay Cagangohan Zone 1"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 h-11 text-sm font-medium"
                    />
                  </div>

                  {/* Location Name / Coastal Site */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label
                      htmlFor="locationName"
                      className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      Location Name / Reported Coastal Site *
                    </Label>

                    <div className="relative">
                      <Input
                        id="locationName"
                        placeholder="Type a location name (e.g., Lilia Homes, San Francisco) or select a waste report below..."
                        value={formData.locationName}
                        onChange={(e) => handleLocationNameChange(e.target.value)}
                        className="rounded-xl border-gray-200 bg-blue-50/20 focus-visible:ring-indigo-500 h-11 text-sm font-medium pl-9"
                      />
                      <MapPin className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Waste Reports Linking */}
                  <div className="space-y-2.5 md:col-span-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Waste Reports *
                      </Label>
                      {formData.reportIds.length > 0 && (
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {formData.reportIds.length} selected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Protected: Reports already assigned to another cleanup schedule cannot be re-selected.
                      </span>
                    </div>

                    <div className="border border-gray-200 rounded-2xl divide-y max-h-60 overflow-y-auto bg-gray-50/30">
                      {displayedReports.length === 0 ? (
                        <div className="p-4 text-xs text-gray-500 text-center">
                          No eligible unassigned waste reports (VERIFIED) available.
                        </div>
                      ) : (
                        displayedReports.map((report: any) => {
                          const isLinked = formData.reportIds.includes(
                            report.id,
                          );
                          const isAssignedToOther = Boolean(
                            report.cleanupScheduleId &&
                              (!isEditing || report.cleanupScheduleId !== initialData?.id),
                          );
                          const reportLoc =
                            resolveLocationForReport(report) || "Location unavailable";
                          return (
                            <label
                              key={report.id}
                              className={`flex items-center gap-3 p-3 transition-colors ${
                                isAssignedToOther
                                  ? "opacity-50 cursor-not-allowed bg-gray-100/60"
                                  : isLinked
                                    ? "bg-blue-50/40 cursor-pointer hover:bg-white"
                                    : "hover:bg-white cursor-pointer"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isLinked}
                                disabled={isAssignedToOther}
                                onChange={() => {
                                  if (!isAssignedToOther) {
                                    handleReportToggle(report.id);
                                  }
                                }}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 shrink-0 disabled:opacity-40"
                              />
                              {report.images && report.images.length > 0 ? (
                                <Image
                                  src={report.images[0].imageUrl}
                                  alt="waste photo"
                                  width={40}
                                  height={40}
                                  unoptimized
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {report.title}
                                  </p>
                                  {isAssignedToOther ? (
                                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                      Already Scheduled
                                    </span>
                                  ) : isLinked ? (
                                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      Selected
                                    </span>
                                  ) : (
                                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Available
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span>{reportLoc}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-indigo-600">
                                    {report.status}
                                  </span>
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Deployment Date & Time */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label
                      htmlFor="scheduledAt"
                      className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Deployment Date & Time *
                    </Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      required
                      min={new Date(
                        new Date().getTime() -
                          new Date().getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)}
                      value={formData.scheduledAt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduledAt: e.target.value,
                        }))
                      }
                      className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 h-11 text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Operational Directives & Briefing *
                  </Label>
                  <Textarea
                    id="description"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Provide detailed instructions for the field team (e.g. rendezvous point, target debris type, high tide warnings, disposal truck coordination)..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 resize-none text-sm leading-relaxed"
                  />
                </div>

                {/* Status (when editing) */}
                {isEditing && (
                  <div className="space-y-1.5 pt-2">
                    <Label
                      htmlFor="status"
                      className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Operation Status
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
                      className={`flex h-11 w-full rounded-xl border px-3 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        SCHEDULE_STATUS_SELECT_STYLES[formData.status]
                      }`}
                    >
                      <option value="UPCOMING">Upcoming (Scheduled)</option>
                      <option value="ONGOING">Ongoing (In Progress)</option>
                      <option value="COMPLETED">Completed (Verified)</option>
                      <option value="CANCELLED">Cancelled (Deferred)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EQUIPMENT */}
            {activeTab === "equipment" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-blue-50/30 border border-indigo-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          Protective & Cleanup Equipment Allocation
                        </h4>
                        <p className="text-xs text-gray-500">
                          Equip assigned personnel with necessary safety gear and tools
                        </p>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => applyPreset("standard")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 font-semibold text-indigo-700 hover:bg-indigo-50 shadow-sm"
                      >
                        Standard Coastal Kit
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("all")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("clear")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Flexible Responsive Gear Grid - NO TRUNCATION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {EQUIPMENT_OPTIONS.map((item) => {
                      const isSelected = formData.equipment.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleEquipmentToggle(item)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-white shadow-sm ring-1 ring-indigo-500/20"
                              : "border-gray-200 bg-white/70 hover:bg-white hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs font-semibold ${
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

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    Allocated equipment will appear on the field worker&apos;s mobile
                    dispatch sheet, enabling them to verify and prepare supplies
                    prior to departing city hall.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: ASSIGN FIELD WORKERS */}
            {activeTab === "crew" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Assign Field Workers *
                    </Label>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {formData.workerIds.length} assigned
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-2xl max-h-96 overflow-y-auto bg-gray-50/30 p-2">
                    {workers.length === 0 ? (
                      <div className="p-8 text-xs text-gray-500 text-center">
                        No field workers registered.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {workers.map((worker) => {
                          const isAssigned = formData.workerIds.includes(
                            worker.id,
                          );
                          return (
                            <label
                              key={worker.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isAssigned
                                  ? "bg-indigo-50/60 border-indigo-300 shadow-sm ring-1 ring-indigo-500/20"
                                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleWorkerToggle(worker.id)}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 shrink-0"
                              />
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {worker.firstName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {worker.firstName} {worker.lastName}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {worker.email}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    Assigned personnel will receive an operational dispatch notice on their mobile devices with location coordinates, cleanup briefings, and allocated equipment.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-3">
          {/* Readiness Indicators */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span
              className={`inline-flex items-center gap-1 ${
                formData.workerIds.length > 0
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {formData.workerIds.length} assigned
            </span>
            <span>•</span>
            <span
              className={`inline-flex items-center gap-1 ${
                formData.reportIds.length > 0
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {formData.reportIds.length} reports
            </span>
            <span>•</span>
            <span className="text-indigo-600">
              {formData.equipment.length} gear items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl h-10 px-5 border-gray-200 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              form="schedule-form"
              type="submit"
              disabled={loading}
              className="rounded-xl h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Operation"
              ) : (
                "Create Cleanup Schedule"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
