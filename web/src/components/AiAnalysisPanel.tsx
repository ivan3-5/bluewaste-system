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
  CRITICAL: { label: "Critical", classes: "bg-red-100 text-red-800 border-red-300" },
  HIGH: { label: "High", classes: "bg-orange-100 text-orange-800 border-orange-300" },
  MODERATE: { label: "Moderate", classes: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  SPAM: { label: "None / Spam", classes: "bg-slate-100 text-slate-600 border-slate-300" },
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
  plastic_bottle: "bg-blue-100 text-blue-800 border-blue-200",
  plastic_bag: "bg-cyan-100 text-cyan-800 border-cyan-200",
  fishing_net: "bg-teal-100 text-teal-800 border-teal-200",
  rope: "bg-amber-100 text-amber-800 border-amber-200",
  styrofoam: "bg-purple-100 text-purple-800 border-purple-200",
  can: "bg-gray-100 text-gray-800 border-gray-200",
  glass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  battery: "bg-red-100 text-red-800 border-red-200",
  diaper: "bg-pink-100 text-pink-800 border-pink-200",
  cigarette_butt: "bg-orange-100 text-orange-800 border-orange-200",
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="mt-1 flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-slate-800">{pct}%</span>
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900">Waste Analysis</h2>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          This report was not auto-analyzed (submitted manually).
        </p>
      </section>
    );
  }

  const severityConfig = severity ? SEVERITY_CONFIG[severity] : null;
  const categories = Array.isArray(aiCategories) ? aiCategories : [];
  const conf = typeof confidence === "number" ? confidence : null;

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Brain className="h-5 w-5 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Waste Analysis</h2>
          <span className="rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
            ✦ Auto-analyzed
          </span>
        </div>

        {/* Waste detected indicator */}
        {hasWaste !== null && hasWaste !== undefined && (
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
              hasWaste
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {hasWaste ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Waste Detected
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                No Waste / Spam
              </>
            )}
          </div>
        )}
      </div>

      <dl className="space-y-4">
        {/* Categories */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Detected Categories
          </dt>
          <dd>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      CATEGORY_COLORS[cat] ?? "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400">No categories detected</span>
            )}
          </dd>
        </div>

        {/* Severity + Confidence */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Severity */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Severity
            </dt>
            <dd>
              {severityConfig ? (
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${severityConfig.classes}`}
                >
                  {severityConfig.label}
                </span>
              ) : (
                <span className="text-sm text-slate-400">—</span>
              )}
            </dd>
          </div>

          {/* Confidence */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Confidence Score
            </dt>
            <dd>
              {conf !== null ? (
                <ConfidenceBar value={conf} />
              ) : (
                <span className="text-sm text-slate-400">—</span>
              )}
            </dd>
          </div>
        </div>

        {/* AI Reason */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Analysis Details
          </dt>
          <dd className="text-sm leading-relaxed text-slate-700">
            {formatAnalysisDetails(categories, aiReason)}
          </dd>
        </div>

        {/* Meta: timing */}
        {((aiGeminiMs !== null && aiGeminiMs !== undefined) || (aiProcessingMs !== null && aiProcessingMs !== undefined)) && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {aiGeminiMs !== null && aiGeminiMs !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Inference {aiGeminiMs}ms
              </span>
            )}
            {aiProcessingMs !== null && aiProcessingMs !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Total {aiProcessingMs}ms
              </span>
            )}
          </div>
        )}
      </dl>
    </section>
  );
}
