export type WasteSeverityLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SPAM";

export const SEVERITY_CRITICAL_COUNT = 25;
export const SEVERITY_HIGH_COUNT = 16;

/** Zero indicates no waste. MODERATE is the stored value for Medium. */
export function severityFromWasteCount(wasteCount: number): WasteSeverityLevel {
  if (wasteCount >= SEVERITY_CRITICAL_COUNT) return "CRITICAL";
  if (wasteCount >= SEVERITY_HIGH_COUNT) return "HIGH";
  if (wasteCount >= 9) return "MODERATE";
  if (wasteCount >= 1) return "LOW";
  return "SPAM";
}

const severityLabels: Record<WasteSeverityLevel, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MODERATE: "Medium",
  LOW: "Low",
  SPAM: "None",
};

export function formatWasteAnalysis(severity: WasteSeverityLevel): string {
  const detection = severity === "SPAM" ? "No waste detected" : "Waste detected";
  return `${detection}. Severity: ${severityLabels[severity]}.`;
}
