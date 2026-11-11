import { Brain } from "lucide-react";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import type { DbSeverity } from "@/lib/severity";

export function AiAnalysisPanel({ hasWaste, severity }: {
  hasWaste: boolean | null;
  severity?: DbSeverity | null;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-bold">Waste Analysis</h2>
      </div>
      {hasWaste === null
        ? <p className="text-xs text-slate-500 dark:text-slate-400">No analysis available.</p>
        : <AnalysisSummary hasWaste={hasWaste} severity={severity} />}
    </section>
  );
}
