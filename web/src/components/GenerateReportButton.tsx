"use client";

import { useMemo, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import type { AdminReport } from "@/lib/admin-report";
import {
  formatLongDate,
  generateCleanupReportPdf,
  type CleanupReportData,
  type Signatory,
} from "@/lib/cleanup-report-pdf";
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

type Props = {
  report: AdminReport;
  variant?: "table" | "detail";
};

const toDateInput = (value: string | Date | null | undefined) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const DEFAULT_PREPARED: Signatory[] = [
  { name: "RODULFO SARDA", position: "Labor General Foreman" },
  { name: "JOEMARIS D. BUGUIS", position: "Environmental Management Specialist I" },
  { name: "RECSON B. ENGALGADO, RPF, MSDA", position: "Environmental Management Specialist II" },
];
const DEFAULT_NOTED: Signatory[] = [
  { name: "MARIO R. PAÑA", position: "Sr. Environmental Management Specialist" },
  { name: "Engr. OLIVER Q. ORIOL", position: "CGADH, City ENRO" },
];
const DEFAULT_APPROVED: Signatory[] = [
  { name: "Engr. FELIX JONASES P. SENAJON, EnP., MEP-Envi.", position: "CGDH, City ENRO" },
];

function SignatoryFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: Signatory[];
  onChange: (next: Signatory[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{title}</p>
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
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

export function GenerateReportButton({ report, variant = "detail" }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportedImages = useMemo(
    () => report.images.filter((img) => img.type === "REPORT"),
    [report.images],
  );

  const cleanupImages = useMemo(
    () => report.images.filter((img) => img.type === "CLEANUP"),
    [report.images],
  );

  const [form, setForm] = useState(() => ({
    cudNumber: "",
    reportDate: toDateInput(new Date()),
    forName: "ENGR. FELIX JONASES P. SENAJON, EnP., MEP-Envi.",
    forPosition: "CGDH, CENRO",
    dateConducted: toDateInput(report.cleanupScheduledAt ?? report.updatedAt),
    activityType: "Coastal Clean-up",
    location: report.locationName,
    male: "",
    female: "",
    wasteType: report.aiCategories?.length
      ? report.aiCategories.join(", ")
      : "Mixed waste",
    wasteKg: "",
    areaCovered: "",
    organization: "",
    focalName: "",
    focalPosition: "",
    remarks: "",
  }));
  const [preparedBy, setPreparedBy] = useState(DEFAULT_PREPARED);
  const [notedBy, setNotedBy] = useState(DEFAULT_NOTED);
  const [approvedBy, setApprovedBy] = useState(DEFAULT_APPROVED);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const male = Math.max(0, parseInt(form.male, 10) || 0);
  const female = Math.max(0, parseInt(form.female, 10) || 0);

  const handleGenerate = async () => {
    setBusy(true);
    setError(null);
    try {
      const data: CleanupReportData = {
        ...form,
        male,
        female,
        preparedBy,
        notedBy,
        approvedBy,
        reportedPhotoUrls: reportedImages.map((img) => img.imageUrl),
        cleanupPhotoUrls: cleanupImages.map((img) => img.imageUrl),
      };
      await generateCleanupReportPdf(
        data,
        `cleanup-report-${report.id.slice(0, 8)}.pdf`,
      );
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate the report.");
    } finally {
      setBusy(false);
    }
  };

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

      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Clean-up Drive Report</DialogTitle>
            <DialogDescription>
              Review or fill in the details below, then export as PDF. Details not stored in
              BlueWaste (participants, weight, area, etc.) are entered here and are not saved.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CUD No. (after “CUD-year-”)">
              <Input value={form.cudNumber} onChange={set("cudNumber")} />
            </Field>
            <Field label="Report date">
              <Input type="date" value={form.reportDate} onChange={set("reportDate")} />
            </Field>
            <Field label="For (name)">
              <Input value={form.forName} onChange={set("forName")} />
            </Field>
            <Field label="For (position)">
              <Input value={form.forPosition} onChange={set("forPosition")} />
            </Field>
            <Field label="Date conducted">
              <Input type="date" value={form.dateConducted} onChange={set("dateConducted")} />
            </Field>
            <Field label="Type of activity">
              <Input value={form.activityType} onChange={set("activityType")} />
            </Field>
            <Field label="Location of the activity" className="sm:col-span-2">
              <Input value={form.location} onChange={set("location")} />
            </Field>
            <Field label="Male participants">
              <Input type="number" min={0} value={form.male} onChange={set("male")} />
            </Field>
            <Field label="Female participants">
              <Input type="number" min={0} value={form.female} onChange={set("female")} />
            </Field>
            <p className="text-xs text-slate-500 sm:col-span-2">
              Total participants: <span className="font-semibold">{male + female}</span>
            </p>
            <Field label="Type of waste">
              <Input value={form.wasteType} onChange={set("wasteType")} />
            </Field>
            <Field label="Total waste collected (kg)">
              <Input type="number" min={0} step="any" value={form.wasteKg} onChange={set("wasteKg")} />
            </Field>
            <Field label="Total area covered" className="sm:col-span-2">
              <Input placeholder="e.g. 1000 meters" value={form.areaCovered} onChange={set("areaCovered")} />
            </Field>
            <Field label="Name of organization">
              <Input value={form.organization} onChange={set("organization")} />
            </Field>
            <Field label="Focal person / organizer">
              <Input value={form.focalName} onChange={set("focalName")} />
            </Field>
            <Field label="Focal person position" className="sm:col-span-2">
              <Input value={form.focalPosition} onChange={set("focalPosition")} />
            </Field>
            <Field label="Remarks" className="sm:col-span-2">
              <Textarea rows={3} value={form.remarks} onChange={set("remarks")} />
            </Field>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
            <SignatoryFields title="Prepared and Submitted by" value={preparedBy} onChange={setPreparedBy} />
            <SignatoryFields title="Noted by" value={notedBy} onChange={setNotedBy} />
            <SignatoryFields title="Approved by" value={approvedBy} onChange={setApprovedBy} />
          </div>

          <p className="text-xs text-slate-500">
            Photo documentation: {Math.min(cleanupImages.length, 4)} of {cleanupImages.length} cleanup
            photo(s) will be included (max 4)
            {form.dateConducted ? ` · Conducted ${formatLongDate(form.dateConducted)}` : ""}.
          </p>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <DialogFooter>
            <button
              type="button"
              disabled={busy}
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {busy ? "Generating…" : "Export PDF"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
