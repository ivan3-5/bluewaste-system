"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { canScheduleReport } from "@/lib/schedule-reports";
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
import { getApiErrorMessage } from "@/lib/apiError";
import { formatScheduleDateTime, parseScheduleDateTime } from "@/lib/schedule-date";
import { CleanupScheduleStatus, User, Report, CleanupRadiusGroup } from "@/types";
import { getReverseGeocodedLocation } from "@/lib/utils";
import {
  groupReportsByRadius,
  haversineDistance,
  formatDistance,
  DEFAULT_RADIUS_METERS,
} from "@/lib/geo-grouping";
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
  Layers,
  Circle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import {
  WizardStep,
  WIZARD_STEPS,
  ValidationResult,
  detectBarangayFromLocation,
  validateScheduleDetails,
  validateScheduleEquipment,
  validateScheduleWorkers,
} from "@/lib/schedule-validation";

export {
  type WizardStep,
  detectBarangayFromLocation,
  validateScheduleDetails,
  validateScheduleEquipment,
  validateScheduleWorkers,
};

export type ScheduleWorkerOption = Pick<User, "id" | "firstName" | "lastName" | "email">;

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  initialReportId?: string;
  workers: ScheduleWorkerOption[];
  isEditing?: boolean;
}

const SCHEDULE_STATUS_SELECT_STYLES: Record<CleanupScheduleStatus, string> = {
  UPCOMING: "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 focus:ring-blue-500",
  ONGOING: "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 focus:ring-amber-500",
  COMPLETED: "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 focus:ring-emerald-500",
  CANCELLED: "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 focus:ring-rose-500",
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

export function ScheduleForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialReportId,
  workers,
  isEditing = false,
}: ScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "equipment" | "workers"
  >("details");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setHighlightedField((prev) => (prev === field ? null : prev));
  }, []);

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
      return list.filter(canScheduleReport);
    },
    enabled: isOpen,
  });

  const reportInList = eligibleReports.find((report) => report.id === initialReportId);
  const initialReportQuery = useQuery({
    queryKey: ["report", initialReportId, "schedule-selection"],
    queryFn: async () => {
      const { data } = await api.get<Report & { locationName?: string }>(
        `/reports/${encodeURIComponent(initialReportId!)}`,
      );
      return {
        ...data,
        title: data.title ?? "Waste report",
        address: data.address ?? data.locationName,
      };
    },
    enabled: isOpen && !isEditing && Boolean(initialReportId) && !reportInList,
  });
  const reportFromLink = reportInList ?? initialReportQuery.data;
  const initialReport = reportFromLink && canScheduleReport(reportFromLink)
    ? reportFromLink : undefined;

  const { data: allSchedules = [] } = useQuery({
    queryKey: ["schedules", "conflict-check"],
    queryFn: async () => {
      const res = await api.get("/schedules?limit=200");
      return (res.data.data as any[]) || [];
    },
    enabled: isOpen && !isEditing,
  });

  const existingScheduleOnDate = useMemo(() => {
    if (!formData.scheduledAt || isEditing) return null;
    const targetDateStr = formData.scheduledAt.slice(0, 10);
    return allSchedules.find((s: any) => {
      if (s.status === "CANCELLED" || s.status === "COMPLETED") return false;
      return s.scheduledAt && formatScheduleDateTime(s.scheduledAt).slice(0, 10) === targetDateStr;
    });
  }, [formData.scheduledAt, allSchedules, isEditing]);

  const preselectedIds: string[] | undefined = initialData?.reportIds;
  const groupSelection = useQuery({
    queryKey: ["reports", "schedule-selection", preselectedIds],
    enabled: isOpen && !isEditing && Boolean(preselectedIds?.length),
    queryFn: async ({ signal }) => {
      const results = await Promise.allSettled(preselectedIds!.map(async (id) => {
        const { data } = await api.get<Report & { locationName?: string }>(
          `/reports/${encodeURIComponent(id)}`, { signal },
        );
        return { ...data, title: data.title ?? "Waste report", address: data.address ?? data.locationName };
      }));
      return results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    },
  });
  const groupApplied = useRef<string | null>(null);
  const groupKey = preselectedIds?.join(",") ?? "";

  const displayedReports = useMemo(() => {
    const current = isEditing ? (initialData?.reports as Report[] | undefined) ?? [] : [];
    const lookedUpReports = groupSelection.data ?? [];
    const found = new Map<string, Report>();
    for (const report of [...current, ...eligibleReports, ...lookedUpReports, ...(reportFromLink ? [reportFromLink] : [])]) {
      found.set(report.id, report);
    }
    const retainedIds = new Set(current.map(({ id }) => id));
    return [...found.values()].filter((report) => retainedIds.has(report.id) || canScheduleReport(report));
  }, [isEditing, initialData?.reports, eligibleReports, groupSelection.data, reportFromLink]);

  const unavailableSelection = (groupSelection.data ?? []).filter((report) => !canScheduleReport(report));
  const missingSelectionCount = groupSelection.data
    ? (preselectedIds?.length ?? 0) - groupSelection.data.length : 0;

  const selectedCitizenCount = useMemo(() => {
    const selected = displayedReports.filter((r: any) =>
      formData.reportIds.includes(r.id),
    );
    const set = new Set<string>();
    let anon = 0;
    selected.forEach((r: any) => {
      if (r.reporterId) set.add(r.reporterId);
      else anon++;
    });
    return set.size + anon;
  }, [formData.reportIds, displayedReports]);

  // ── GPS 50-Meter Radius Grouping States ────────────────────────────────────
  const [reportGroupingMode, setReportGroupingMode] = useState<"radius" | "flat">("radius");
  const groupingRadius = DEFAULT_RADIUS_METERS;

  const radiusGroups = useMemo(() => {
    return groupReportsByRadius(displayedReports, groupingRadius);
  }, [displayedReports, groupingRadius]);

  const groupedAreas = useMemo(
    () => radiusGroups.filter((g) => g.isGrouped),
    [radiusGroups],
  );

  const isolatedGroups = useMemo(
    () => radiusGroups.filter((g) => !g.isGrouped),
    [radiusGroups],
  );

  const selectedReportsDistanceInfo = useMemo(() => {
    const selected = displayedReports.filter((r: any) =>
      formData.reportIds.includes(r.id),
    );
    if (selected.length <= 1) {
      return { count: selected.length, maxDistanceMeters: 0, isWithinRadius: true };
    }
    let maxDist = 0;
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const d = haversineDistance(
          selected[i].latitude,
          selected[i].longitude,
          selected[j].latitude,
          selected[j].longitude,
        );
        if (d > maxDist) maxDist = d;
      }
    }
    return {
      count: selected.length,
      maxDistanceMeters: Math.round(maxDist * 10) / 10,
      isWithinRadius: maxDist <= groupingRadius,
    };
  }, [formData.reportIds, displayedReports, groupingRadius]);

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
    setFieldErrors({});
    setHighlightedField(null);
    if (isOpen) {
      setActiveTab("details");
    }
    if (initialData && isOpen) {
      const rawInitialLoc =
        initialData.locationName ||
        initialData.reports?.[0]?.address ||
        initialData.barangay ||
        "";
      const initialLocation = rawInitialLoc.toLowerCase().startsWith("waste report")
        ? ""
        : rawInitialLoc;
      const initialBarangay =
        initialData.barangay ||
        detectBarangayFromLocation(initialLocation) ||
        "";

      const initialReportIds: string[] = isEditing
        ? (initialData.reports as Report[] | undefined)?.map(({ id }) => id) ?? []
        : [];

      const initialEquipment: string[] =
        Array.isArray(initialData.equipment) && initialData.equipment.length > 0
          ? initialData.equipment
          : STANDARD_PRESET;

      setFormData({
        title:
          initialData.title ||
          (initialLocation
            ? `Coastal Cleanup - ${initialLocation.split(",").slice(0, 2).join(",").trim()}`
            : "Coastal Cleanup Operation"),
        locationName: initialLocation,
        description: initialData.description || "",
        barangay: initialBarangay,
        latitude: initialData.latitude || 7.3032,
        longitude: initialData.longitude || 125.6811,
        scheduledAt: formatScheduleDateTime(initialData.scheduledAt),
        workerIds: initialData.workers
          ? initialData.workers.map((w: any) => w.workerId)
          : [],
        reportIds: initialReportIds,
        status: initialData.status || "UPCOMING",
        equipment: initialEquipment,
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

  useEffect(() => {
    if (!isOpen || isEditing || !initialReport) return;
    const address = initialReport.address?.trim();
    const location = address && !address.toLowerCase().startsWith("waste report") ? address : "";
    setFormData((previous) => {
      if (previous.reportIds.length > 0) return previous;
      return {
        ...previous,
        reportIds: [initialReport.id],
        latitude: initialReport.latitude,
        longitude: initialReport.longitude,
        locationName: previous.locationName || location,
        barangay: previous.barangay || detectBarangayFromLocation(location),
        title: previous.title || (location ? `Coastal Cleanup - ${location.split(",")[0]}`.slice(0, 200) : "Coastal Cleanup"),
      };
    });
  }, [isOpen, isEditing, initialReport]);

  useEffect(() => {
    if (!isOpen) {
      groupApplied.current = null;
      return;
    }
    if (isEditing || !groupKey || !groupSelection.data || groupApplied.current === groupKey) return;
    groupApplied.current = groupKey;
    const reports = groupSelection.data.filter(canScheduleReport);
    setFormData((previous) => ({
      ...previous,
      reportIds: [...new Set([...previous.reportIds, ...reports.map(({ id }) => id)])],
    }));
  }, [groupKey, groupSelection.data, isEditing, isOpen]);

  // Synchronize location info if reports were preselected but location was empty or default
  useEffect(() => {
    if (!isOpen) return;
    if (formData.reportIds.length > 0 && displayedReports.length > 0) {
      const selectedReports = displayedReports.filter((r: any) =>
        formData.reportIds.includes(r.id),
      );
      if (selectedReports.length > 0) {
        setFormData((prev) => {
          let updatedLoc = prev.locationName;
          let updatedBarangay = prev.barangay;
          let updatedLat = prev.latitude;
          let updatedLng = prev.longitude;
          let updatedTitle = prev.title;

          if (!updatedLoc || updatedLoc.toLowerCase().startsWith("waste report")) {
            const firstWithLoc = selectedReports.find((r: any) => resolveLocationForReport(r));
            if (firstWithLoc) {
              const res = resolveLocationForReport(firstWithLoc);
              updatedLoc = res;
              updatedBarangay = updatedBarangay || detectBarangayFromLocation(res);
              if (!updatedTitle || updatedTitle === "Coastal Cleanup Operation") {
                const shortLoc = res.split(",").slice(0, 2).join(",").trim();
                updatedTitle = `Coastal Cleanup - ${shortLoc || res}`;
              }
            }
          }

          if (updatedLat === 7.3032 && updatedLng === 125.6811) {
            const sumLat = selectedReports.reduce((s: number, r: any) => s + r.latitude, 0);
            const sumLng = selectedReports.reduce((s: number, r: any) => s + r.longitude, 0);
            updatedLat = sumLat / selectedReports.length;
            updatedLng = sumLng / selectedReports.length;
          }

          if (
            updatedLoc === prev.locationName &&
            updatedBarangay === prev.barangay &&
            updatedLat === prev.latitude &&
            updatedLng === prev.longitude &&
            updatedTitle === prev.title
          ) {
            return prev;
          }

          return {
            ...prev,
            locationName: updatedLoc,
            barangay: updatedBarangay,
            latitude: updatedLat,
            longitude: updatedLng,
            title: updatedTitle,
          };
        });
      }
    }
  }, [isOpen, formData.reportIds, displayedReports, resolveLocationForReport]);

  // Handle Location Name changes: Automatically fills in Target Barangay / Coastal Area
  const handleLocationNameChange = (newLocationName: string) => {
    clearFieldError("locationName");
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
      return Boolean(search) && [addr, resolved, title].some((value) => value === search);
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

      // Auto-link matching reports ONLY if no reports were already selected or passed via initialData
      const hasInitialReportIds = Array.isArray(initialData?.reportIds) && initialData.reportIds.length > 0;
      if (matchingReports.length > 0 && prev.reportIds.length === 0 && !hasInitialReportIds) {
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
    clearFieldError("reportIds");
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

  // Select or Deselect an entire 50-meter radius group of reports with 1 click
  const handleGroupToggle = (group: CleanupRadiusGroup) => {
    clearFieldError("reportIds");
    const groupReportIds = group.reports
      .filter(
        (r: any) =>
          !r.cleanupScheduleId ||
          (isEditing && r.cleanupScheduleId === initialData?.id),
      )
      .map((r: any) => r.id);

    if (groupReportIds.length === 0) return;

    const allSelected = groupReportIds.every((id: string) =>
      formData.reportIds.includes(id),
    );

    let nextReportIds: string[];
    if (allSelected) {
      nextReportIds = formData.reportIds.filter(
        (id) => !groupReportIds.includes(id),
      );
    } else {
      nextReportIds = Array.from(new Set([...formData.reportIds, ...groupReportIds]));
    }

    const selected = displayedReports.filter((r: any) =>
      nextReportIds.includes(r.id),
    );

    let newLocationName = formData.locationName;
    let newBarangay = formData.barangay;
    let newLat = formData.latitude;
    let newLng = formData.longitude;

    if (selected.length > 0) {
      newLat = group.center.latitude;
      newLng = group.center.longitude;
      const resolved =
        group.barangay || resolveLocationForReport(group.reports[0]);
      if (resolved) {
        newLocationName = resolved;
        newBarangay = detectBarangayFromLocation(resolved);
      }
    }

    let updatedTitle = formData.title;
    if (
      !formData.title.trim() ||
      formData.title.startsWith("Coastal Cleanup - ")
    ) {
      if (newLocationName) {
        const shortLoc = newLocationName.split(",").slice(0, 2).join(",").trim();
        updatedTitle = `Coastal Cleanup - ${shortLoc || newLocationName}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      reportIds: nextReportIds,
      locationName: newLocationName,
      barangay: newBarangay,
      latitude: newLat,
      longitude: newLng,
      title: updatedTitle,
    }));
  };

  const handleWorkerToggle = (workerId: string) => {
    clearFieldError("workerIds");
    setFormData((prev) => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter((id) => id !== workerId)
        : [...prev.workerIds, workerId],
    }));
  };

  const handleEquipmentToggle = (item: string) => {
    clearFieldError("equipment");
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const applyPreset = (preset: "standard" | "all" | "clear") => {
    clearFieldError("equipment");
    if (preset === "standard") {
      setFormData((prev) => ({ ...prev, equipment: STANDARD_PRESET }));
    } else if (preset === "all") {
      setFormData((prev) => ({ ...prev, equipment: EQUIPMENT_OPTIONS }));
    } else {
      setFormData((prev) => ({ ...prev, equipment: [] }));
    }
  };

  // Step 1 Validation
  const validateDetailsStep = useCallback((): ValidationResult => {
    return validateScheduleDetails(formData, displayedReports, isEditing);
  }, [formData, displayedReports, isEditing]);

  // Step 2 Validation
  const validateEquipmentStep = useCallback((): ValidationResult => {
    return validateScheduleEquipment(formData.equipment);
  }, [formData.equipment]);

  // Step 3 Validation
  const validateWorkersStep = useCallback((): ValidationResult => {
    return validateScheduleWorkers(formData.workerIds);
  }, [formData.workerIds]);

  // Step Completion States for Stepper Badges & Navigation Guards
  const isDetailsComplete = useMemo(() => validateDetailsStep().valid, [validateDetailsStep]);
  const isEquipmentComplete = useMemo(() => validateEquipmentStep().valid, [validateEquipmentStep]);
  const isWorkersComplete = useMemo(() => validateWorkersStep().valid, [validateWorkersStep]);

  // Intelligent Navigation and Scrolling to Missing / Invalid Fields
  const navigateAndScrollToField = useCallback(
    (field: string, message?: string) => {
      let targetStep: WizardStep = "details";
      if (field === "equipment") {
        targetStep = "equipment";
      } else if (field === "workerIds") {
        targetStep = "workers";
      }

      setFieldErrors((prev) => ({
        ...prev,
        [field]: message || "This field requires your attention.",
      }));
      setHighlightedField(field);

      if (activeTab !== targetStep) {
        setActiveTab(targetStep);
      }

      const focusAndScroll = () => {
        const container = scrollContainerRef.current;
        const targetElement =
          document.getElementById(`field-${field}`) ||
          document.getElementById(field);

        if (!targetElement) return;

        // Perform smooth scroll inside modal's scrollable container
        if (container && container.contains(targetElement)) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const relativeTargetTop = targetRect.top - containerRect.top + container.scrollTop;
          const targetOffsetTop =
            relativeTargetTop - container.clientHeight / 2 + targetRect.height / 2;

          container.scrollTo({
            top: Math.max(0, targetOffsetTop),
            behavior: "smooth",
          });
        } else {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Focus input or first focusable control inside field
        if (
          targetElement instanceof HTMLInputElement ||
          targetElement instanceof HTMLTextAreaElement ||
          targetElement instanceof HTMLSelectElement
        ) {
          targetElement.focus({ preventScroll: true });
        } else {
          const focusable = targetElement.querySelector<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement
          >("input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])");
          if (focusable) {
            focusable.focus({ preventScroll: true });
          }
        }
      };

      setTimeout(focusAndScroll, 80);
    },
    [activeTab],
  );

  // Step Navigation Handlers
  const handleNextToEquipment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const result = validateDetailsStep();
    if (!result.valid) {
      if (result.field) {
        navigateAndScrollToField(result.field, result.error);
      } else {
        setErrorMessage(result.error || "Please complete all required fields in Operation Details.");
      }
      return;
    }
    setFieldErrors({});
    setHighlightedField(null);
    setActiveTab("equipment");
  };

  const handleNextToWorkers = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const result = validateEquipmentStep();
    if (!result.valid) {
      if (result.field) {
        navigateAndScrollToField(result.field, result.error);
      } else {
        setErrorMessage(result.error || "Please select at least one equipment item.");
      }
      return;
    }
    setFieldErrors({});
    setHighlightedField(null);
    setActiveTab("workers");
  };

  const handleStepClick = (targetTab: WizardStep) => {
    setErrorMessage(null);
    if (targetTab === "details") {
      setActiveTab("details");
      return;
    }
    if (targetTab === "equipment") {
      const detailsResult = validateDetailsStep();
      if (!detailsResult.valid) {
        if (detailsResult.field) {
          navigateAndScrollToField(detailsResult.field, detailsResult.error);
        } else {
          setErrorMessage(detailsResult.error || "Please complete Operation Details first.");
        }
        return;
      }
      setActiveTab("equipment");
      return;
    }
    if (targetTab === "workers") {
      const detailsResult = validateDetailsStep();
      if (!detailsResult.valid) {
        if (detailsResult.field) {
          navigateAndScrollToField(detailsResult.field, detailsResult.error);
        } else {
          setErrorMessage(detailsResult.error || "Please complete Operation Details first.");
        }
        return;
      }
      const equipResult = validateEquipmentStep();
      if (!equipResult.valid) {
        if (equipResult.field) {
          navigateAndScrollToField(equipResult.field, equipResult.error);
        } else {
          setErrorMessage(equipResult.error || "Please select equipment before proceeding to Assign.");
        }
        return;
      }
      setActiveTab("workers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If submitted via keyboard Enter while on Step 1 or Step 2, advance smoothly
    if (activeTab === "details") {
      handleNextToEquipment(e);
      return;
    }
    if (activeTab === "equipment") {
      handleNextToWorkers(e);
      return;
    }

    if (loading) return;

    // Check Step 1 (earliest step with unresolved error)
    const detailsVal = validateDetailsStep();
    if (!detailsVal.valid) {
      if (detailsVal.field) {
        navigateAndScrollToField(detailsVal.field, detailsVal.error);
      } else {
        setErrorMessage(detailsVal.error || "Please check Operation Details.");
        setActiveTab("details");
      }
      return;
    }

    // Check Step 2
    const equipVal = validateEquipmentStep();
    if (!equipVal.valid) {
      if (equipVal.field) {
        navigateAndScrollToField(equipVal.field, equipVal.error);
      } else {
        setErrorMessage(equipVal.error || "Please select at least one equipment item.");
        setActiveTab("equipment");
      }
      return;
    }

    // Check Step 3
    const workersVal = validateWorkersStep();
    if (!workersVal.valid) {
      if (workersVal.field) {
        navigateAndScrollToField(workersVal.field, workersVal.error);
      } else {
        setErrorMessage(workersVal.error || "Please assign at least one field worker.");
        setActiveTab("workers");
      }
      return;
    }

    const title = formData.title.trim();
    const description = formData.description.trim();
    const barangay = formData.barangay.trim() || formData.locationName.trim();
    const scheduledAt = parseScheduleDateTime(formData.scheduledAt);

    try {
      setLoading(true);
      const payload = {
        title,
        description,
        barangay,
        latitude: formData.latitude,
        longitude: formData.longitude,
        scheduledAt: scheduledAt.toISOString(),
        workerIds: formData.workerIds,
        reportIds: formData.reportIds,
        status: formData.status,
        equipment: formData.equipment,
      };

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
        }
      }

      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      console.error("Form submission error", error);
      if (Array.isArray(error.response?.data?.details) && error.response.data.details.length) {
        const messages = error.response.data.details
          .map((d: any) => `${d.field}: ${d.message}`)
          .join(" • ");
        setErrorMessage(`Validation error: ${messages}`);
      } else {
        setErrorMessage(getApiErrorMessage(error, "Could not save the schedule. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="bg-black/40 backdrop-blur-sm"
        className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-100/60 dark:border-indigo-900/50">
                LGU Operational Dispatch
              </span>
              <DialogTitle className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                {isEditing ? "Edit Cleanup Schedule" : "Create Cleanup Schedule"}
              </DialogTitle>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Coordinate personnel, allocate protective equipment, and assign
                verified coastal waste sites.
              </p>
            </div>
          </div>

          {/* Enhanced Multi-Step Stepper Progress Bar */}
          <div className="mt-5" role="tablist" aria-label="Cleanup Schedule Wizard">
            <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60">
              {WIZARD_STEPS.map((step, idx) => {
                const isCurrent = activeTab === step.id;
                const isComplete =
                  step.id === "details"
                    ? isDetailsComplete
                    : step.id === "equipment"
                      ? isDetailsComplete && isEquipmentComplete
                      : isDetailsComplete && isEquipmentComplete && isWorkersComplete;
                const isAccessible =
                  step.id === "details"
                    ? true
                    : step.id === "equipment"
                      ? isDetailsComplete
                      : isDetailsComplete && isEquipmentComplete;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => handleStepClick(step.id)}
                      className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${isCurrent
                        ? isComplete
                          ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30"
                          : "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20"
                        : isComplete
                          ? "text-emerald-700 dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-slate-800/60"
                          : isAccessible
                            ? "text-gray-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40"
                            : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 opacity-70"
                        }`}
                    >
                      {/* Step Circle / Checkmark */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all ${isComplete
                          ? isCurrent
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                          : isCurrent
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                          }`}
                      >
                        {isComplete ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          step.stepNumber
                        )}
                      </div>

                      {/* Step Name */}
                      <span className="hidden sm:inline truncate">{step.label}</span>
                      <span className="inline sm:hidden truncate">{step.shortLabel}</span>

                      {/* Count Badge */}
                      {step.id === "details" && formData.reportIds.length > 0 && (
                        <span
                          className={`hidden md:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isComplete
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : isCurrent
                              ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                              : "bg-gray-200/80 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                            }`}
                        >
                          {formData.reportIds.length}
                        </span>
                      )}
                      {step.id === "equipment" && formData.equipment.length > 0 && (
                        <span
                          className={`hidden md:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isComplete
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : isCurrent
                              ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                              : "bg-gray-200/80 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                            }`}
                        >
                          {formData.equipment.length}
                        </span>
                      )}
                      {step.id === "workers" && formData.workerIds.length > 0 && (
                        <span
                          className={`hidden md:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isComplete
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : isCurrent
                              ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                              : "bg-gray-200/80 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                            }`}
                        >
                          {formData.workerIds.length}
                        </span>
                      )}
                    </button>

                    {idx < WIZARD_STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0 hidden sm:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 min-h-0 scroll-smooth">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 dark:text-rose-400" />
              <div className="flex-1">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form id="schedule-form" noValidate onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Operation Title */}
                  <div id="field-title" className="space-y-1.5 md:col-span-2 scroll-mt-6">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor="title"
                        className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        Operation Title *
                      </Label>
                      {fieldErrors.title && (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {fieldErrors.title}
                        </span>
                      )}
                    </div>
                    <Input
                      id="title"
                      required
                      minLength={3}
                      maxLength={200}
                      placeholder="e.g., Coastal Sweep - Barangay Cagangohan Zone 1"
                      value={formData.title}
                      onChange={(e) => {
                        clearFieldError("title");
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }));
                      }}
                      className={`rounded-xl h-11 text-sm font-medium transition-all ${fieldErrors.title
                        ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100"
                        : "border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 dark:text-slate-100 focus-visible:ring-indigo-500"
                        }`}
                    />
                    {existingScheduleOnDate && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 mt-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Auto-Consolidation Active</p>
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                            A cleanup schedule (<strong>&quot;{existingScheduleOnDate.title}&quot;</strong>) already exists on this date. Newly scheduled reports will automatically be consolidated into this schedule without duplicating activities.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location Name / Coastal Site */}
                  <div id="field-locationName" className="space-y-1.5 md:col-span-2 scroll-mt-6">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor="locationName"
                        className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Location Name / Reported Coastal Site *
                      </Label>
                      {fieldErrors.locationName && (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {fieldErrors.locationName}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        id="locationName"
                        placeholder="Type a location name (e.g., Lilia Homes, San Francisco) or select a waste report below..."
                        value={formData.locationName}
                        onChange={(e) => handleLocationNameChange(e.target.value)}
                        className={`rounded-xl h-11 text-sm font-medium pl-9 transition-all ${fieldErrors.locationName
                          ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100"
                          : "border-gray-200 dark:border-slate-700 bg-blue-50/20 dark:bg-slate-800/50 dark:text-slate-100 focus-visible:ring-indigo-500"
                          }`}
                      />
                      <MapPin className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.locationName ? "text-rose-500" : "text-blue-500"
                        }`} />
                    </div>
                  </div>

                  {/* Waste Reports Linking */}
                  <div
                    id="field-reportIds"
                    className={`space-y-3 md:col-span-2 pt-1 scroll-mt-6 rounded-2xl transition-all ${fieldErrors.reportIds
                      ? "p-3 border-2 border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/10"
                      : ""
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          Waste Reports *
                        </Label>
                        {fieldErrors.reportIds && (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-200">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {fieldErrors.reportIds}
                          </span>
                        )}
                      </div>

                      {/* Grouping Mode Pill Switcher */}
                      <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs">
                        <button
                          type="button"
                          onClick={() => setReportGroupingMode("radius")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${reportGroupingMode === "radius"
                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                            }`}
                        >
                          <Circle className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
                          <span>50m Radius Groups ({groupedAreas.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportGroupingMode("flat")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${reportGroupingMode === "flat"
                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                            }`}
                        >
                          <span>All Reports ({displayedReports.length})</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Protected: Reports already assigned to another cleanup schedule cannot be re-selected.
                      </span>
                    </div>

                    {groupKey && groupSelection.isPending && (
                      <p role="status" className="text-xs text-slate-600 dark:text-slate-300">Checking which reports are ready to schedule…</p>
                    )}
                    {(unavailableSelection.length > 0 || missingSelectionCount > 0) && (
                      <div role="status" className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                        <p>Only verified, unassigned reports were selected.</p>
                        {unavailableSelection.map((report) => (
                          <p key={report.id}>
                            <Link href={report.cleanupScheduleId
                              ? `/dashboard/schedules?scheduleId=${encodeURIComponent(report.cleanupScheduleId)}`
                              : `/dashboard/reports/${encodeURIComponent(report.id)}`} className="font-semibold underline underline-offset-2">
                              {report.cleanupScheduleId ? "View Schedule" : "Review Report"}
                            </Link>
                            {" · "}{report.title}
                          </p>
                        ))}
                        {missingSelectionCount > 0 && <p>{missingSelectionCount} report(s) could not be loaded.</p>}
                      </div>
                    )}
                    {initialReportId && !initialReport && (
                      <p role="status" className="text-xs text-slate-600 dark:text-slate-300">
                        {initialReportQuery.isLoading
                          ? "Loading the selected report…"
                          : reportFromLink?.status === "PENDING"
                            ? "This report needs verification before it can be scheduled."
                            : "The selected report could not be loaded or is no longer available for scheduling."}
                        {reportFromLink?.status === "PENDING" && (
                          <>{" "}<Link href={`/dashboard/reports/${encodeURIComponent(reportFromLink.id)}`} className="font-semibold underline underline-offset-2">Review Report</Link></>
                        )}
                        {reportFromLink?.cleanupScheduleId && (
                          <>{" "}<Link href={`/dashboard/schedules?scheduleId=${encodeURIComponent(reportFromLink.cleanupScheduleId)}`} className="font-semibold underline underline-offset-2">View Schedule</Link></>
                        )}
                      </p>
                    )}

                    {formData.reportIds.length > 1 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">
                        <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>
                          Consolidating <strong>{formData.reportIds.length}</strong> reports from <strong>{selectedCitizenCount}</strong> citizen{selectedCitizenCount === 1 ? "" : "s"} into one unified cleanup activity.
                        </span>
                      </div>
                    )}

                    {/* Proximity / Distance Verification Banner */}
                    {selectedReportsDistanceInfo.count > 1 && (
                      <div
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${selectedReportsDistanceInfo.isWithinRadius
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200"
                          : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200"
                          }`}
                      >
                        {selectedReportsDistanceInfo.isWithinRadius ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">
                            {selectedReportsDistanceInfo.isWithinRadius
                              ? `GPS Proximity Verified (${selectedReportsDistanceInfo.maxDistanceMeters}m spread)`
                              : `Geographical Spread (${selectedReportsDistanceInfo.maxDistanceMeters}m spread)`}
                          </p>
                          <p className="text-[11px] mt-0.5 opacity-90">
                            {selectedReportsDistanceInfo.isWithinRadius
                              ? `All selected waste reports are within ${selectedReportsDistanceInfo.maxDistanceMeters}m of each other (within the ${groupingRadius}m cleanup perimeter). Optimal for a single cleanup crew deployment!`
                              : `Selected waste reports span ${selectedReportsDistanceInfo.maxDistanceMeters} meters (exceeds ${groupingRadius}m radius). They can still be scheduled together as a broad operation, or organized into separate localized cleanup deployments.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* RADIUS GROUPED MODE */}
                    {reportGroupingMode === "radius" ? (
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                        {/* Grouped 50m Areas */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                              Recommended {groupingRadius}m Cleanup Areas ({groupedAreas.length})
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">
                              Nearby reports clustered by GPS distance
                            </span>
                          </div>

                          {groupedAreas.length === 0 ? (
                            <div className="p-3 text-center text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                              No clusters found within {groupingRadius}m radius. Reports are spaced farther apart.
                            </div>
                          ) : (
                            groupedAreas.map((group) => {
                              const groupUnassignedReports = group.reports.filter(
                                (r: any) =>
                                  !r.cleanupScheduleId ||
                                  (isEditing && r.cleanupScheduleId === initialData?.id),
                              );
                              const allGroupSelected =
                                groupUnassignedReports.length > 0 &&
                                groupUnassignedReports.every((r: any) =>
                                  formData.reportIds.includes(r.id),
                                );
                              const someGroupSelected =
                                groupUnassignedReports.some((r: any) =>
                                  formData.reportIds.includes(r.id),
                                );
                              const groupLoc =
                                group.barangay ||
                                resolveLocationForReport(group.reports[0]) ||
                                "Grouped Cleanup Zone";

                              return (
                                <div
                                  key={group.id}
                                  className={`rounded-2xl border transition-all overflow-hidden ${allGroupSelected
                                    ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm"
                                    : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-700"
                                    }`}
                                >
                                  {/* Area Card Header */}
                                  <div className="p-3 bg-gray-50/70 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                          {groupLoc}
                                        </h4>
                                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                                          ⭕ {group.reports.length} Reports
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                                        <span>👥 {group.citizenCount} Contributor{group.citizenCount > 1 ? "s" : ""}</span>
                                        <span>•</span>
                                        <span>Spread: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{group.maxSpreadMeters}m</strong></span>
                                        <span>•</span>
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500">Radius: {group.radiusMeters}m</span>
                                      </div>
                                    </div>

                                    {/* Select All in Area Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleGroupToggle(group)}
                                      disabled={groupUnassignedReports.length === 0}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${groupUnassignedReports.length === 0
                                        ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-slate-800 text-gray-400"
                                        : allGroupSelected
                                          ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                                          : someGroupSelected
                                            ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200"
                                            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                      {allGroupSelected ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Area Selected</span>
                                        </>
                                      ) : (
                                        <>
                                          <span>Select 50m Area</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Pairwise Distance Chips */}
                                  {group.pairwiseDistances.length > 0 && (
                                    <div className="px-3 py-1.5 bg-indigo-50/20 dark:bg-indigo-950/10 border-b border-gray-100 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[10px]">
                                      <span className="text-gray-400 dark:text-slate-500 font-medium shrink-0">Distances:</span>
                                      {group.pairwiseDistances.slice(0, 3).map((p, pIdx) => (
                                        <span
                                          key={pIdx}
                                          className="shrink-0 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                                        >
                                          {(p.reportATitle || "Report").slice(0, 12)}... ↔ {(p.reportBTitle || "Report").slice(0, 12)}...: <strong>{p.distanceMeters}m</strong>
                                        </span>
                                      ))}
                                      {group.pairwiseDistances.length > 3 && (
                                        <span className="text-gray-400 dark:text-slate-500 shrink-0">
                                          +{group.pairwiseDistances.length - 3} more pairs
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Member Reports */}
                                  <div className="divide-y dark:divide-slate-800/80">
                                    {group.reports.map((report: any) => {
                                      const isLinked = formData.reportIds.includes(report.id);
                                      const isAssignedToOther = Boolean(
                                        report.cleanupScheduleId &&
                                        (!isEditing || report.cleanupScheduleId !== initialData?.id),
                                      );
                                      const reportLoc = resolveLocationForReport(report) || "Location unavailable";
                                      const distInfo = group.distancesFromCenter.find(
                                        (d) => d.reportId === report.id,
                                      );

                                      return (
                                        <label
                                          key={report.id}
                                          className={`flex items-center gap-3 p-2.5 transition-colors ${isAssignedToOther
                                            ? "opacity-50 cursor-not-allowed bg-gray-100/60 dark:bg-slate-800/50"
                                            : isLinked
                                              ? "bg-indigo-50/50 dark:bg-slate-800/80 cursor-pointer hover:bg-white dark:hover:bg-slate-800/60"
                                              : "hover:bg-gray-50/60 dark:hover:bg-slate-800/40 cursor-pointer"
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
                                            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800 shrink-0 disabled:opacity-40"
                                          />
                                          {report.images && report.images.length > 0 ? (
                                            <Image
                                              src={report.images[0].imageUrl}
                                              alt="waste photo"
                                              width={36}
                                              height={36}
                                              unoptimized
                                              className="w-9 h-9 object-cover rounded-lg border border-gray-200 dark:border-slate-700 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                              <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                              <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                                {report.title}
                                              </p>
                                              {isAssignedToOther ? (
                                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                                  Already Scheduled
                                                </span>
                                              ) : isLinked ? (
                                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                                                  Selected
                                                </span>
                                              ) : (
                                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                                                  Available
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                              <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                              <span>{reportLoc}</span>
                                              {distInfo && (
                                                <>
                                                  <span>•</span>
                                                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                    {distInfo.distanceFromCenterMeters}m from center
                                                  </span>
                                                </>
                                              )}
                                            </p>
                                          </div>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Standalone Reports Outside Radius */}
                        {isolatedGroups.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                              <span>📍 Standalone Reports Outside {groupingRadius}m Radius ({isolatedGroups.length})</span>
                              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">
                                Single reports with no nearby waste within {groupingRadius}m
                              </span>
                            </div>

                            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl divide-y dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                              {isolatedGroups.map((group) => {
                                const report = group.reports[0];
                                const isLinked = formData.reportIds.includes(report.id);
                                const isAssignedToOther = Boolean(
                                  report.cleanupScheduleId &&
                                  (!isEditing || report.cleanupScheduleId !== initialData?.id),
                                );
                                const reportLoc = resolveLocationForReport(report) || "Location unavailable";

                                return (
                                  <label
                                    key={report.id}
                                    className={`flex items-center gap-3 p-3 transition-colors ${isAssignedToOther
                                      ? "opacity-50 cursor-not-allowed bg-gray-100/60 dark:bg-slate-800/50"
                                      : isLinked
                                        ? "bg-blue-50/40 dark:bg-slate-800/70 cursor-pointer hover:bg-white dark:hover:bg-slate-800/50"
                                        : "hover:bg-gray-50/50 dark:hover:bg-slate-800/50 cursor-pointer"
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
                                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800 shrink-0 disabled:opacity-40"
                                    />
                                    {report.images && report.images.length > 0 ? (
                                      <Image
                                        src={report.images[0].imageUrl}
                                        alt="waste photo"
                                        width={38}
                                        height={38}
                                        unoptimized
                                        className="w-9 h-9 object-cover rounded-lg border border-gray-200 dark:border-slate-700 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                          {report.title}
                                        </p>
                                        {isAssignedToOther ? (
                                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                            Already Scheduled
                                          </span>
                                        ) : isLinked ? (
                                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                                            Selected
                                          </span>
                                        ) : (
                                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                                            Available
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                        <span>{reportLoc}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                          {report.status}
                                        </span>
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* FLAT MODE */
                      <div className="border border-gray-200 dark:border-slate-800 rounded-2xl divide-y dark:divide-slate-800 max-h-60 overflow-y-auto bg-gray-50/30 dark:bg-slate-900/50">
                        {displayedReports.length === 0 ? (
                          <div className="p-4 text-xs text-gray-500 dark:text-slate-400 text-center">
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
                                className={`flex items-center gap-3 p-3 transition-colors ${isAssignedToOther
                                  ? "opacity-50 cursor-not-allowed bg-gray-100/60 dark:bg-slate-800/50"
                                  : isLinked
                                    ? "bg-blue-50/40 dark:bg-slate-800/70 cursor-pointer hover:bg-white dark:hover:bg-slate-800/50"
                                    : "hover:bg-white dark:hover:bg-slate-800/50 cursor-pointer"
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
                                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800 shrink-0 disabled:opacity-40"
                                />
                                {report.images && report.images.length > 0 ? (
                                  <Image
                                    src={report.images[0].imageUrl}
                                    alt="waste photo"
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                      {report.title}
                                    </p>
                                    {isAssignedToOther ? (
                                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                        Already Scheduled
                                      </span>
                                    ) : isLinked ? (
                                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                                        Selected
                                      </span>
                                    ) : (
                                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                                        Available
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                    <span>{reportLoc}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                      {report.status}
                                    </span>
                                  </p>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Deployment Date & Time (Panabo) */}
                  <div id="field-scheduledAt" className="space-y-1.5 md:col-span-2 scroll-mt-6">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor="scheduledAt"
                        className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        Deployment Date & Time (Panabo) *
                      </Label>
                      {fieldErrors.scheduledAt && (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {fieldErrors.scheduledAt}
                        </span>
                      )}
                    </div>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      required
                      min={isEditing ? undefined : formatScheduleDateTime(new Date())}
                      value={formData.scheduledAt}
                      onChange={(e) => {
                        clearFieldError("scheduledAt");
                        setFormData((prev) => ({
                          ...prev,
                          scheduledAt: e.target.value,
                        }));
                      }}
                      className={`rounded-xl h-11 text-sm font-medium transition-all ${fieldErrors.scheduledAt
                        ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100"
                        : "border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 dark:text-slate-100 focus-visible:ring-indigo-500"
                        }`}
                    />
                    {existingScheduleOnDate && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 mt-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Auto-Consolidation Active</p>
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                            A cleanup schedule (<strong>&quot;{existingScheduleOnDate.title}&quot;</strong>) already exists on this date. Newly scheduled reports will automatically be consolidated into this schedule without duplicating activities.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div id="field-description" className="space-y-1.5 scroll-mt-6">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="description"
                      className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Operational Directives & Briefing *
                    </Label>
                    {fieldErrors.description && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-200">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors.description}
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="description"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Provide detailed instructions for the field team (e.g. rendezvous point, target debris type, high tide warnings, disposal truck coordination)..."
                    value={formData.description}
                    onChange={(e) => {
                      clearFieldError("description");
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                    }}
                    className={`rounded-xl resize-none text-sm leading-relaxed transition-all ${fieldErrors.description
                      ? "border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100"
                      : "border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 dark:text-slate-100 focus-visible:ring-indigo-500"
                      }`}
                  />
                </div>

                {/* Status (when editing) */}
                {isEditing && (
                  <div className="space-y-1.5 pt-2">
                    <Label
                      htmlFor="status"
                      className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
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
                      className={`flex h-11 w-full rounded-xl border px-3 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${SCHEDULE_STATUS_SELECT_STYLES[formData.status]
                        }`}
                    >
                      <option value="UPCOMING" className="dark:bg-slate-900 dark:text-slate-100">Upcoming (Scheduled)</option>
                      <option value="ONGOING" className="dark:bg-slate-900 dark:text-slate-100">Ongoing (In Progress)</option>
                      <option value="COMPLETED" className="dark:bg-slate-900 dark:text-slate-100">Completed (Verified)</option>
                      <option value="CANCELLED" className="dark:bg-slate-900 dark:text-slate-100">Cancelled (Deferred)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EQUIPMENT */}
            {activeTab === "equipment" && (
              <div id="field-equipment" className="space-y-6 animate-in fade-in duration-200 scroll-mt-6">
                <div
                  className={`p-5 rounded-2xl transition-all ${fieldErrors.equipment
                    ? "bg-gradient-to-br from-rose-50/60 to-red-50/30 dark:from-slate-800/80 dark:to-rose-950/30 border-2 border-rose-400 dark:border-rose-600 shadow-sm ring-2 ring-rose-500/20"
                    : "bg-gradient-to-br from-indigo-50/60 to-blue-50/30 dark:from-slate-800/60 dark:to-indigo-950/20 border border-indigo-100 dark:border-slate-700"
                    }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${fieldErrors.equipment
                          ? "bg-rose-600 text-white"
                          : "bg-indigo-600 dark:bg-indigo-500 text-white"
                          }`}
                      >
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">
                          Protective & Cleanup Equipment Allocation
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          Equip assigned personnel with necessary safety gear and tools
                        </p>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => applyPreset("standard")}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-sm"
                      >
                        Standard Coastal Kit
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("all")}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("clear")}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {fieldErrors.equipment && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>{fieldErrors.equipment}</span>
                    </div>
                  )}

                  {/* Flexible Responsive Gear Grid - NO TRUNCATION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {EQUIPMENT_OPTIONS.map((item) => {
                      const isSelected = formData.equipment.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleEquipmentToggle(item)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected
                            ? "border-indigo-500 dark:border-indigo-500 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-indigo-500/20"
                            : "border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                            }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800"
                              }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs font-semibold ${isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-gray-700 dark:text-slate-300"
                              }`}
                          >
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex items-start gap-3">
                  <Info className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    Allocated equipment will appear on the field worker&apos;s mobile
                    dispatch sheet, enabling them to verify and prepare supplies
                    prior to departing city hall.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: ASSIGN FIELD WORKERS */}
            {activeTab === "workers" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div id="field-workerIds" tabIndex={-1} className="space-y-3 scroll-mt-6 focus:outline-none">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        Assign Field Workers *
                      </Label>
                      {fieldErrors.workerIds && (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {fieldErrors.workerIds}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${fieldErrors.workerIds
                        ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50"
                        : formData.workerIds.length > 0
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50"
                          : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50"
                        }`}
                    >
                      {formData.workerIds.length} assigned
                    </span>
                  </div>

                  <div
                    className={`border rounded-2xl max-h-96 overflow-y-auto bg-gray-50/30 dark:bg-slate-900/50 p-2 transition-all ${fieldErrors.workerIds
                      ? "border-2 border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 shadow-sm"
                      : "border-gray-200 dark:border-slate-800"
                      }`}
                  >
                    {workers.length === 0 ? (
                      <div className="p-8 text-xs text-gray-500 dark:text-slate-400 text-center">
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
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isAssigned
                                ? "bg-indigo-50/60 dark:bg-slate-800 border-indigo-300 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-500/20"
                                : "bg-white dark:bg-slate-800/40 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/60 dark:hover:bg-slate-800"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleWorkerToggle(worker.id)}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800 shrink-0"
                              />
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-950 dark:to-blue-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {worker.firstName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                  {worker.firstName} {worker.lastName}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
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

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex items-start gap-3">
                  <Info className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    Assigned personnel will receive an operational dispatch notice on their mobile devices with location coordinates, cleanup briefings, and allocated equipment.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Dynamic Wizard Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-end gap-2.5 shrink-0">
          {/* STEP 1: Details */}
          {activeTab === "details" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl h-10 px-5 border-gray-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleNextToEquipment()}
                  disabled={loading}
                  className="rounded-xl h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 text-white font-bold text-xs transition-all flex items-center gap-2"
                >
                  <span>Next: Equipment</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* STEP 2: Equipment */}
            {activeTab === "equipment" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab("details");
                  }}
                  disabled={loading}
                  className="rounded-xl h-10 px-5 border-gray-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleNextToWorkers()}
                  disabled={loading}
                  className="rounded-xl h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 text-white font-bold text-xs transition-all flex items-center gap-2"
                >
                  <span>Next: Assign Workers</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* STEP 3: Assign */}
            {activeTab === "workers" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab("equipment");
                  }}
                  disabled={loading}
                  className="rounded-xl h-10 px-5 border-gray-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  form="schedule-form"
                  type="submit"
                  disabled={loading || formData.workerIds.length === 0}
                  className="rounded-xl h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 text-white font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEditing ? "Update Operation" : "Create Cleanup Schedule"}</span>
                    </>
                  )}
                </Button>
              </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
