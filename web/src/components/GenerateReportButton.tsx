"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  FileDown,
  Loader2,
  CheckCircle2,
  Check,
  AlertCircle,
  FileText,
  MapPin,
  CalendarDays,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AdminReport } from "@/lib/admin-report";
import {
  cleanRemarks,
  formatLongDate,
  generateCleanupReportPdf,
  generateConsolidatedCleanupReportPdf,
  type CleanupReportData,
  type Signatory,
} from "@/lib/cleanup-report-pdf";
import {
  ConsolidatedCleanupReport,
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
  WASTE_CATEGORY_LABELS,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const toDateInput = (value: string | Date | null | undefined) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const DEFAULT_PREPARED: Signatory[] = [
  { name: "RODULFO SARDA", position: "Labor General Foreman" },
  { name: "JOEMARIS D. BUGUIS", position: "Environmental Management Specialist I" },
  { name: "RECSON B. ENGALGADO, RPF, MSDA", position: "Environmental Management Specialist II" },
];

export const DEFAULT_NOTED: Signatory[] = [
  { name: "MARIO R. PAÑA", position: "Sr. Environmental Management Specialist" },
  { name: "Engr. OLIVER Q. ORIOL", position: "CGADH, City ENRO" },
];

export const DEFAULT_APPROVED: Signatory[] = [
  { name: "Engr. FELIX JONASES P. SENAJON, EnP., MEP-Envi.", position: "CGDH, City ENRO" },
];

function SignatoryFields({
  title,
  value,
  error,
  onChange,
}: {
  title: string;
  value: Signatory[];
  error?: string;
  onChange: (next: Signatory[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        {error && <span className="text-[11px] text-rose-500 font-medium">{error}</span>}
      </div>
      {value.map((s, i) => (
        <div key={i} className="grid grid-cols-2 gap-2">
          <Input
            className="h-8 text-xs"
            placeholder="Name"
            value={s.name}
            onChange={(e) =>
              onChange(value.map((v, j) => (j === i ? { ...v, name: e.target.value } : v)))
            }
          />
          <Input
            className="h-8 text-xs"
            placeholder="Position"
            value={s.position}
            onChange={(e) =>
              onChange(value.map((v, j) => (j === i ? { ...v, position: e.target.value } : v)))
            }
          />
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </Label>
        {error && <span className="text-[11px] text-rose-500 font-medium">{error}</span>}
      </div>
      {children}
    </div>
  );
}

export interface GenerateCleanupReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: AdminReport | null;
  scheduleId?: string | null;
}

export function GenerateCleanupReportModal({
  open,
  onOpenChange,
  report,
  scheduleId,
}: GenerateCleanupReportModalProps) {
  const isCombined = Boolean(scheduleId);

  // Fetch consolidated data if opening in schedule / combined mode
  const {
    data: consolidatedReport,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useQuery<ConsolidatedCleanupReport>({
    queryKey: ["schedule-report", scheduleId],
    queryFn: async () => {
      if (!scheduleId) throw new Error("No schedule ID provided");
      const res = await api.get(`/schedules/${scheduleId}/report`);
      return res.data as ConsolidatedCleanupReport;
    },
    enabled: open && Boolean(scheduleId),
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState({
    cudNumber: "",
    reportDate: toDateInput(new Date()),
    forName: "ENGR. FELIX JONASES P. SENAJON, EnP., MEP-Envi.",
    forPosition: "CGDH, CENRO",
    dateConducted: "",
    activityType: "Coastal Clean-up",
    location: "",
    male: "",
    female: "",
    wasteType: "Mixed waste",
    wasteKg: "",
    areaCovered: "",
    organization: "City ENRO Panabo",
    focalName: "",
    focalPosition: "",
    remarks: "",
  });

  const [preparedBy, setPreparedBy] = useState(DEFAULT_PREPARED);
  const [notedBy, setNotedBy] = useState(DEFAULT_NOTED);
  const [approvedBy, setApprovedBy] = useState(DEFAULT_APPROVED);

  // Tracks whether the form has already been initialized for the current open modal session
  // This prevents background React Query refetches or parent re-renders from wiping out user input.
  const initializedKeyRef = useRef<string | null>(null);

  // Workflow state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Populate from single report (only once per modal opening session)
  const reportId = report?.id;
  useEffect(() => {
    if (!open || isCombined || !report || !reportId) return;

    const currentKey = `report-${reportId}`;
    if (initializedKeyRef.current === currentKey) return;
    initializedKeyRef.current = currentKey;

    setForm({
      cudNumber: "",
      reportDate: toDateInput(new Date()),
      forName: "ENGR. FELIX JONASES P. SENAJON, EnP., MEP-Envi.",
      forPosition: "CGDH, CENRO",
      dateConducted: toDateInput(report.cleanupScheduledAt ?? report.updatedAt),
      activityType: "Coastal Clean-up",
      location: report.locationName || "",
      male: "",
      female: "",
      wasteType: report.aiCategories?.length
        ? report.aiCategories.join(", ")
        : "Mixed waste",
      wasteKg: "",
      areaCovered: "",
      organization: "City ENRO Panabo",
      focalName: report.cleanedByName || report.assignedToName || "",
      focalPosition: report.cleanedByName ? "Field Responder" : "",
      remarks: "",
    });
    setPreparedBy(DEFAULT_PREPARED);
    setNotedBy(DEFAULT_NOTED);
    setApprovedBy(DEFAULT_APPROVED);
    setIsSubmitted(false);
    setValidationErrors({});
    setSubmitSuccess(null);
    setGeneralError(null);
    setExportSuccess(null);
  }, [open, isCombined, report, reportId]);

  // Populate from consolidated report (only once per modal opening session)
  useEffect(() => {
    if (!open || !isCombined || !consolidatedReport || !scheduleId) return;

    const currentKey = `schedule-${scheduleId}`;
    if (initializedKeyRef.current === currentKey) return;
    initializedKeyRef.current = currentKey;

    const groupedCategories = Array.from(
      new Set(
        consolidatedReport.groupedReports
          .map((r) => WASTE_CATEGORY_LABELS[r.category] || r.category)
          .filter(Boolean),
      ),
    );

    const firstAddress =
      consolidatedReport.groupedReports.find((r) => Boolean(r.address))?.address ||
      consolidatedReport.barangay ||
      "Panabo City";

    const leadWorker = consolidatedReport.assignedWorkers[0];
    const leadWorkerName = leadWorker ? `${leadWorker.firstName} ${leadWorker.lastName}` : "";

    setForm({
      cudNumber: "",
      reportDate: toDateInput(new Date()),
      forName: "ENGR. FELIX JONASES P. SENAJON, EnP., MEP-Envi.",
      forPosition: "CGDH, CENRO",
      dateConducted: toDateInput(
        consolidatedReport.completionInfo?.verifiedAt || consolidatedReport.scheduledAt,
      ),
      activityType: "Coastal Clean-up",
      location: firstAddress,
      male: "",
      female: "",
      wasteType: groupedCategories.length ? groupedCategories.join(", ") : "Mixed waste",
      wasteKg: "",
      areaCovered: "",
      organization: "City ENRO Panabo",
      focalName:
        consolidatedReport.completionInfo?.verifiedBy?.name || leadWorkerName || "",
      focalPosition: consolidatedReport.completionInfo?.verifiedBy
        ? "Verifying Officer"
        : leadWorker
          ? "Field Responder"
          : "",
      remarks: cleanRemarks(
        consolidatedReport.completionInfo?.notes ||
        consolidatedReport.notes ||
        `Combined clean-up drive covering ${consolidatedReport.summary.totalReports} waste reports across ${consolidatedReport.barangay || "Panabo City"}.`,
      ),
    });
    setPreparedBy(DEFAULT_PREPARED);
    setNotedBy(DEFAULT_NOTED);
    setApprovedBy(DEFAULT_APPROVED);
    setIsSubmitted(false);
    setValidationErrors({});
    setSubmitSuccess(null);
    setGeneralError(null);
    setExportSuccess(null);
  }, [open, isCombined, consolidatedReport, scheduleId]);

  // Reset state on modal close
  useEffect(() => {
    if (!open) {
      initializedKeyRef.current = null;
      setIsSubmitted(false);
      setValidationErrors({});
      setSubmitSuccess(null);
      setGeneralError(null);
      setExportSuccess(null);
    }
  }, [open]);

  const setField = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
    // Invalidate submitted state on any form edit
    setIsSubmitted(false);
    setSubmitSuccess(null);
    setExportSuccess(null);
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSignatoryChange =
    (setter: React.Dispatch<React.SetStateAction<Signatory[]>>, fieldName: string) =>
    (next: Signatory[]) => {
      setter(next);
      setIsSubmitted(false);
      setSubmitSuccess(null);
      setExportSuccess(null);
      if (validationErrors[fieldName]) {
        setValidationErrors((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    };

  const maleNum = Math.max(0, parseInt(form.male, 10) || 0);
  const femaleNum = Math.max(0, parseInt(form.female, 10) || 0);

  const reportedPhotoUrls = useMemo(() => {
    if (isCombined && consolidatedReport) {
      return consolidatedReport.groupedReports.flatMap((r) => r.photoUrls);
    }
    if (report) {
      return report.images.filter((img) => img.type === "REPORT").map((img) => img.imageUrl);
    }
    return [];
  }, [isCombined, consolidatedReport, report]);

  const cleanupPhotoUrls = useMemo(() => {
    if (isCombined && consolidatedReport) {
      return consolidatedReport.groupedReports.flatMap((r) => r.cleanupPhotoUrls);
    }
    if (report) {
      return report.images.filter((img) => img.type === "CLEANUP").map((img) => img.imageUrl);
    }
    return [];
  }, [isCombined, consolidatedReport, report]);

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.cudNumber.trim()) {
      errors.cudNumber = "CUD No. is required.";
    }
    if (!form.reportDate.trim()) {
      errors.reportDate = "Report date is required.";
    }
    if (!form.forName.trim()) {
      errors.forName = "Recipient name ('For') is required.";
    }
    if (!form.forPosition.trim()) {
      errors.forPosition = "Recipient position is required.";
    }
    if (!form.dateConducted.trim()) {
      errors.dateConducted = "Date conducted is required.";
    }
    if (!form.activityType.trim()) {
      errors.activityType = "Type of activity is required.";
    }
    if (!form.location.trim()) {
      errors.location = "Location of the activity is required.";
    }
    if (form.male.trim() === "" || isNaN(Number(form.male)) || Number(form.male) < 0) {
      errors.male = "Valid male count (0 or greater) is required.";
    }
    if (form.female.trim() === "" || isNaN(Number(form.female)) || Number(form.female) < 0) {
      errors.female = "Valid female count (0 or greater) is required.";
    }
    if (!form.wasteType.trim()) {
      errors.wasteType = "Type of waste is required.";
    }
    if (
      form.wasteKg.trim() === "" ||
      isNaN(Number(form.wasteKg)) ||
      Number(form.wasteKg) <= 0
    ) {
      errors.wasteKg = "Total waste collected (kg) must be greater than 0.";
    }
    if (!form.areaCovered.trim()) {
      errors.areaCovered = "Total area covered is required.";
    }
    if (!preparedBy.some((s) => s.name.trim() && s.position.trim())) {
      errors.preparedBy = "At least one complete 'Prepared and Submitted by' signatory is required.";
    }
    if (!notedBy.some((s) => s.name.trim() && s.position.trim())) {
      errors.notedBy = "At least one complete 'Noted by' signatory is required.";
    }
    if (!approvedBy.some((s) => s.name.trim() && s.position.trim())) {
      errors.approvedBy = "At least one complete 'Approved by' signatory is required.";
    }

    return errors;
  };

  // Step 4: Validate & Submit
  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setExportSuccess(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setGeneralError("Please complete all required fields marked below before exporting.");
      setIsSubmitted(false);
      setSubmitSuccess(null);
      return;
    }

    setValidationErrors({});
    setIsSubmitted(true);
    setSubmitSuccess(
      isCombined
        ? "Combined Report details successfully validated and submitted! You may now export the PDF."
        : "Clean-up Drive Report details successfully validated and submitted! You may now export the PDF.",
    );
  };

  // Step 5: Export Combined Report / Single Report
  const handleExportPdf = async () => {
    if (!isSubmitted) return;
    setIsExporting(true);
    setGeneralError(null);
    setExportSuccess(null);

    try {
      const reportData: CleanupReportData = {
        ...form,
        male: maleNum,
        female: femaleNum,
        preparedBy,
        notedBy,
        approvedBy,
        reportedPhotoUrls,
        cleanupPhotoUrls,
      };

      if (isCombined && consolidatedReport) {
        await generateConsolidatedCleanupReportPdf(
          consolidatedReport,
          reportData,
          `combined-cleanup-report-${consolidatedReport.scheduleId.slice(0, 8)}.pdf`,
        );
      } else if (report) {
        await generateCleanupReportPdf(
          reportData,
          `cleanup-report-${report.id.slice(0, 8)}.pdf`,
        );
      }
      setExportSuccess("Report PDF successfully generated and downloaded.");
    } catch (err) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to generate the PDF report.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (isExporting) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isExporting && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Generate Clean-up Drive Report
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {isCombined
                  ? "Review or complete the clean-up drive details for this Combined Report, validate & submit, then export as PDF."
                  : "Review or fill in the details below, then export as PDF. Details not stored in BlueWaste are entered here."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isScheduleLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-semibold">Loading combined report details...</p>
          </div>
        )}

        {isScheduleError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
              Failed to load combined cleanup data
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-300">
              Could not retrieve aggregated information for this schedule.
            </p>
            <button
              type="button"
              onClick={() => void refetchSchedule()}
              className="mt-2 text-xs font-semibold text-indigo-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {(!isCombined || consolidatedReport) && !isScheduleLoading && (
          <div className="space-y-4">
            {/* Combined Mission Context Banner */}
            {isCombined && consolidatedReport && (
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-100">
                        {consolidatedReport.scheduleTitle}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        ID: {consolidatedReport.scheduleId.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-indigo-500" />
                        {consolidatedReport.summary.totalReports} waste locations
                      </span>
                      <span>•</span>
                      <span>{consolidatedReport.summary.totalCitizens} reporting citizens</span>
                      <span>•</span>
                      <span>{consolidatedReport.barangay || "Panabo City"}</span>
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs"
                    style={{
                      backgroundColor: `${SCHEDULE_STATUS_COLORS[consolidatedReport.overallStatus]}15`,
                      color: SCHEDULE_STATUS_COLORS[consolidatedReport.overallStatus],
                      border: `1px solid ${SCHEDULE_STATUS_COLORS[consolidatedReport.overallStatus]}35`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: SCHEDULE_STATUS_COLORS[consolidatedReport.overallStatus],
                      }}
                    />
                    {SCHEDULE_STATUS_LABELS[consolidatedReport.overallStatus] || consolidatedReport.overallStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Validation & Feedback Banners */}
            {generalError && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{generalError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">{submitSuccess}</span>
              </div>
            )}

            {exportSuccess && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-2.5 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>{exportSuccess}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="CUD No. (after “CUD-year-”)"
                required
                error={validationErrors.cudNumber}
              >
                <Input
                  placeholder="e.g. 001"
                  value={form.cudNumber}
                  onChange={setField("cudNumber")}
                  className={cn(validationErrors.cudNumber && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="Report date" required error={validationErrors.reportDate}>
                <Input
                  type="date"
                  value={form.reportDate}
                  onChange={setField("reportDate")}
                  className={cn(validationErrors.reportDate && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="For (name)" required error={validationErrors.forName}>
                <Input
                  value={form.forName}
                  onChange={setField("forName")}
                  className={cn(validationErrors.forName && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="For (position)" required error={validationErrors.forPosition}>
                <Input
                  value={form.forPosition}
                  onChange={setField("forPosition")}
                  className={cn(validationErrors.forPosition && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="Date conducted" required error={validationErrors.dateConducted}>
                <Input
                  type="date"
                  value={form.dateConducted}
                  onChange={setField("dateConducted")}
                  className={cn(validationErrors.dateConducted && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="Type of activity" required error={validationErrors.activityType}>
                <Input
                  value={form.activityType}
                  onChange={setField("activityType")}
                  className={cn(validationErrors.activityType && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field
                label="Location of the activity"
                required
                className="sm:col-span-2"
                error={validationErrors.location}
              >
                <Input
                  value={form.location}
                  onChange={setField("location")}
                  className={cn(validationErrors.location && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="Male participants" required error={validationErrors.male}>
                <Input
                  type="number"
                  min={0}
                  value={form.male}
                  placeholder="0"
                  onChange={setField("male")}
                  className={cn(validationErrors.male && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="Female participants" required error={validationErrors.female}>
                <Input
                  type="number"
                  min={0}
                  value={form.female}
                  placeholder="0"
                  onChange={setField("female")}
                  className={cn(validationErrors.female && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <p className="text-xs text-slate-500 sm:col-span-2">
                Total participants: <span className="font-semibold">{maleNum + femaleNum}</span>
              </p>

              <Field label="Type of waste" required error={validationErrors.wasteType}>
                <Input
                  value={form.wasteType}
                  onChange={setField("wasteType")}
                  className={cn(validationErrors.wasteType && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field
                label="Total waste collected (kg)"
                required
                error={validationErrors.wasteKg}
              >
                <Input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="e.g. 150"
                  value={form.wasteKg}
                  onChange={setField("wasteKg")}
                  className={cn(validationErrors.wasteKg && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field
                label="Total area covered"
                required
                className="sm:col-span-2"
                error={validationErrors.areaCovered}
              >
                <Input
                  placeholder="e.g. 1000 meters"
                  value={form.areaCovered}
                  onChange={setField("areaCovered")}
                  className={cn(validationErrors.areaCovered && "border-rose-400 focus:ring-rose-400")}
                />
              </Field>

              <Field label="Name of organization">
                <Input value={form.organization} onChange={setField("organization")} />
              </Field>

              <Field label="Focal person / organizer">
                <Input value={form.focalName} onChange={setField("focalName")} />
              </Field>

              <Field label="Focal person position" className="sm:col-span-2">
                <Input value={form.focalPosition} onChange={setField("focalPosition")} />
              </Field>

              <Field label="Remarks" className="sm:col-span-2">
                <Textarea rows={3} value={form.remarks} onChange={setField("remarks")} />
              </Field>
            </div>

            {/* Signatories */}
            <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              <SignatoryFields
                title="Prepared and Submitted by"
                value={preparedBy}
                error={validationErrors.preparedBy}
                onChange={handleSignatoryChange(setPreparedBy, "preparedBy")}
              />
              <SignatoryFields
                title="Noted by"
                value={notedBy}
                error={validationErrors.notedBy}
                onChange={handleSignatoryChange(setNotedBy, "notedBy")}
              />
              <SignatoryFields
                title="Approved by"
                value={approvedBy}
                error={validationErrors.approvedBy}
                onChange={handleSignatoryChange(setApprovedBy, "approvedBy")}
              />
            </div>

            {/* Photographic documentation notice */}
            <p className="text-xs text-slate-500">
              {isCombined && consolidatedReport ? (
                <>
                  Photo documentation: {cleanupPhotoUrls.length + reportedPhotoUrls.length} total photo(s) across{" "}
                  {consolidatedReport.groupedReports.length} linked report(s) will be included in the exported PDF
                  {form.dateConducted ? ` · Conducted ${formatLongDate(form.dateConducted)}` : ""}.
                </>
              ) : (
                <>
                  Photo documentation: {Math.min(cleanupPhotoUrls.length, 4)} of {cleanupPhotoUrls.length} cleanup photo(s) will be included (max 4)
                  {form.dateConducted ? ` · Conducted ${formatLongDate(form.dateConducted)}` : ""}.
                </>
              )}
            </p>
          </div>
        )}

        {/* Modal Action Footer */}
        <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isScheduleLoading || isExporting}
            onClick={handleValidateAndSubmit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all",
              isSubmitted
                ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs",
            )}
          >
            {isSubmitted ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Submitted & Validated
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Validate & Submit
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!isSubmitted || isExporting || isScheduleLoading}
            onClick={handleExportPdf}
            title={
              !isSubmitted
                ? "Please complete and validate all required fields before exporting"
                : "Export PDF"
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-all shadow-2xs",
              isSubmitted && !isExporting
                ? "bg-primary hover:bg-primary/90 cursor-pointer"
                : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-60",
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting PDF…
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Export PDF
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GenerateReportButton({
  report,
  variant = "detail",
}: {
  report: AdminReport;
  variant?: "table" | "detail";
}) {
  const [open, setOpen] = useState(false);

  if (report.status !== "CLEANED") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40",
          variant === "table" ? "px-3 py-1.5 text-sm" : "px-3 py-1.5 text-xs shadow-2xs",
        )}
      >
        <FileDown className={variant === "table" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        Generate Report
      </button>

      {open && (
        <GenerateCleanupReportModal
          open={open}
          onOpenChange={setOpen}
          report={report}
        />
      )}
    </>
  );
}

export function CombinedReportButton({
  scheduleId,
  variant = "detail",
  className,
}: {
  scheduleId: string;
  variant?: "table" | "detail";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950",
          variant === "table" ? "px-3 py-1.5 text-sm" : "px-3 py-1.5 text-xs shadow-2xs",
          className,
        )}
      >
        <FileText className="h-3.5 w-3.5" />
        Combined Report
      </button>

      {open && (
        <GenerateCleanupReportModal
          open={open}
          onOpenChange={setOpen}
          scheduleId={scheduleId}
        />
      )}
    </>
  );
}
