export type WasteSeverityLevel = "HIGH" | "MODERATE" | "LOW" | "SPAM";

export function severityFromWasteCount(wasteCount: number): WasteSeverityLevel | null {
  if (wasteCount >= 26) return "HIGH";
  if (wasteCount >= 14) return "MODERATE";
  if (wasteCount >= 4) return "LOW";
  return wasteCount <= 0 ? "SPAM" : null;
}

const severityLabels: Record<WasteSeverityLevel, string> = {
  HIGH: "High",
  MODERATE: "Medium",
  LOW: "Low",
  SPAM: "None",
};

export function formatWasteAnalysis(severity: WasteSeverityLevel | null): string {
  const detection = severity === "SPAM" ? "No waste detected" : "Waste detected";
  const label = severity ? severityLabels[severity] : "None";
  return `${detection}. Severity: ${label}.`;
}
