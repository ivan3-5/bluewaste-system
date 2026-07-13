import type { ReactElement } from "react";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null | undefined;

const SEVERITY_CONFIG: Record<
  NonNullable<SeverityLevel>,
  { label: string; emoji: string; className: string }
> = {
  CRITICAL: {
    label: "Critical",
    emoji: "🔴",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  HIGH: {
    label: "High",
    emoji: "🟠",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  MODERATE: {
    label: "Moderate",
    emoji: "🟡",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  SPAM: {
    label: "Spam",
    emoji: "⚪",
    className: "border-slate-200 bg-slate-100 text-slate-500",
  },
};

interface SeverityBadgeProps {
  severity: SeverityLevel;
  /** If true, also shows the emoji */
  showEmoji?: boolean;
  /** If true, show a "Not Analyzed" placeholder when severity is null/undefined */
  showFallback?: boolean;
}

export function SeverityBadge({
  severity,
  showEmoji = true,
  showFallback = false,
}: SeverityBadgeProps): ReactElement | null {
  if (!severity) {
    if (!showFallback) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400">
        {showEmoji && <span>⏳</span>}
        Not Analyzed
      </span>
    );
  }

  const config = SEVERITY_CONFIG[severity];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {config.label}
    </span>
  );
}
