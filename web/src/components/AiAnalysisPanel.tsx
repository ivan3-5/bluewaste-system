/**
 * AiAnalysisPanel — displays Gemini AI analysis results for a report.
 * Used in the admin report detail page.
 */

import { Brain, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatAnalysisDetails } from "@/lib/utils";

type AiSeverity = "Low" | "Medium" | "High" | "Critical" | "None";
type DbSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null;

export interface AiAnalysisPanelProps {
  reportId: string;
  hasWaste?: boolean | null;
  aiCategories?: string[] | null;
  severity?: DbSeverity;
  confidence?: number | null;
  aiReason?: string | null;
  aiModel?: string | null;
  aiProcessingMs?: number | null;
  aiGeminiMs?: number | null;
  analyzedAt?: string | Date | null;
}

const SEVERITY_CONFIG: Record<string, { label: string; classes: string }> = {
  CRITICAL: { label: "Critical", classes: "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30" },
  HIGH: { label: "High", classes: "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30" },
  MODERATE: { label: "Moderate", classes: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30" },
  SPAM: { label: "None / Spam", classes: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700" },
};

const CATEGORY_LABELS: Record<string, string> = {
  plastic_bottle: "Plastic Bottle",
  plastic_bag: "Plastic Bag",
  fishing_net: "Fishing Net",
  rope: "Rope",
  styrofoam: "Styrofoam",
  can: "Can",
  glass: "Glass",
  battery: "Battery",
  diaper: "Diaper",
  cigarette_butt: "Cigarette Butt",
};

const CATEGORY_COLORS: Record<string, string> = {
  plastic_bottle: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  plastic_bag: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
  fishing_net: "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/30",
  rope: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  styrofoam: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
  can: "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border-gray-200 dark:border-slate-700",
  glass: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  battery: "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30",
  diaper: "bg-pink-100 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-500/30",
  cigarette_butt: "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-500/30",
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="mt-1 flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">{pct}%</span>
    </div>
  );
}

export function AiAnalysisPanel({
  reportId,
  hasWaste,
  aiCategories,
  severity,
  confidence,
  aiReason,
  aiModel,
  aiProcessingMs,
  aiGeminiMs,
  analyzedAt,
}: AiAnalysisPanelProps) {
  const isAnalyzed = Boolean(
    (aiModel && aiModel.trim() !== "") ||
    (analyzedAt !== null && analyzedAt !== undefined) ||
    (aiCategories && aiCategories.length > 0) ||
    (severity !== null && severity !== undefined && severity !== "SPAM")
  );

  if (!isAnalyzed) {
    return (
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Brain className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Waste Analysis</h2>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          This report was not auto-analyzed (submitted manually).
        </p>
      </section>
    );
  }

  const severityConfig = severity ? SEVERITY_CONFIG[severity] : null;
  const categories = Array.isArray(aiCategories) ? aiCategories : [];
  const conf = typeof confidence === "number" ? confidence : null;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-primary">
            <Brain className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Waste Analysis</h2>
        </div>

        {/* Waste detected indicator */}
        {hasWaste !== null && hasWaste !== undefined && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              hasWaste
                ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {hasWaste ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Waste Detected
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                No Waste / Clean
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {/* Severity + Confidence + Latency Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Severity */}
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Severity Level
            </span>
            <div className="mt-1">
              {severityConfig ? (
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${severityConfig.classes}`}
                >
                  {severityConfig.label}
                </span>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </div>
          </div>

          {/* Confidence */}
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Confidence
            </span>
            <div className="mt-1">
              {conf !== null ? (
                <ConfidenceBar value={conf} />
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </div>
          </div>

          {/* Latency */}
          <div className="col-span-2 sm:col-span-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Processing Speed
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{aiGeminiMs ? `${aiGeminiMs}ms` : aiProcessingMs ? `${aiProcessingMs}ms` : "Fast"}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detected Waste Types
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {categories.length} item{categories.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                      CATEGORY_COLORS[cat] ?? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">No specific categories flagged</span>
            )}
          </div>
        </div>

        {/* Analysis Details */}
        <div className="rounded-lg border-l-2 border-violet-400 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-950/30 p-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-900 dark:text-violet-300 mb-0.5">
            Analysis Summary
          </span>
          {formatAnalysisDetails(categories, aiReason)}
        </div>
      </div>
    </section>
  );
}
