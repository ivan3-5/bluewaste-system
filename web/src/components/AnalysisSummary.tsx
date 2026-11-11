import { SeverityBadge, type SeverityLevel } from "@/components/SeverityBadge";

export function AnalysisSummary({ hasWaste, severity }: {
  hasWaste: boolean;
  severity: SeverityLevel;
}) {
  return (
    <div className="space-y-2 rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-xs font-bold">Analysis Summary</h3>
      <p className="font-semibold">{hasWaste ? "Waste detected" : "No waste detected"}</p>
      <div className="flex items-center justify-between gap-2">
        <span>Severity</span>
        {hasWaste
          ? <SeverityBadge severity={severity} showEmoji={false} showFallback />
          : <span>None</span>}
      </div>
    </div>
  );
}
