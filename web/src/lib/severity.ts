export type DbSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SPAM";
export type AiSeverityLabel = "Low" | "Medium" | "High" | "Critical" | "None";

export const SEVERITY_CRITICAL_COUNT = 25;
export const SEVERITY_HIGH_COUNT = 16;

/** Zero indicates no waste. MODERATE is the stored value for Medium. */
export function severityFromWasteCount(wasteCount: number): DbSeverity {
  if (wasteCount >= SEVERITY_CRITICAL_COUNT) return "CRITICAL";
  if (wasteCount >= SEVERITY_HIGH_COUNT) return "HIGH";
  if (wasteCount >= 9) return "MODERATE";
  if (wasteCount >= 1) return "LOW";
  return "SPAM";
}

export function dbSeverityToAiLabel(severity: DbSeverity): AiSeverityLabel {
  switch (severity) {
    case "CRITICAL": return "Critical";
    case "HIGH": return "High";
    case "MODERATE": return "Medium";
    case "LOW": return "Low";
    default: return "None";
  }
}

export function aiSeverityFromWasteCount(wasteCount: number): AiSeverityLabel {
  return dbSeverityToAiLabel(severityFromWasteCount(wasteCount));
}

export function formatWasteAnalysis(hasWaste: boolean, severity: AiSeverityLabel): string {
  return `${hasWaste ? "Waste detected" : "No waste detected"}. Severity: ${hasWaste ? severity : "None"}.`;
}
