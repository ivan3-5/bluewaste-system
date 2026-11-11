export type DbSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "SPAM";
export type AiSeverityLabel = "Low" | "Medium" | "High" | "Critical" | "None";

export const SEVERITY_CRITICAL_COUNT = 7;
export const SEVERITY_HIGH_COUNT = 3;

/** 0 → SPAM (no waste), 1-2 → MODERATE, 3-6 → HIGH, 7+ → CRITICAL. */
export function severityFromWasteCount(wasteCount: number): DbSeverity {
  if (wasteCount >= SEVERITY_CRITICAL_COUNT) return "CRITICAL";
  if (wasteCount >= SEVERITY_HIGH_COUNT) return "HIGH";
  if (wasteCount >= 1) return "MODERATE";
  return "SPAM";
}

export function dbSeverityToAiLabel(severity: DbSeverity): AiSeverityLabel {
  switch (severity) {
    case "CRITICAL": return "Critical";
    case "HIGH": return "High";
    case "MODERATE": return "Medium";
    default: return "None";
  }
}

export function aiSeverityFromWasteCount(wasteCount: number): AiSeverityLabel {
  return dbSeverityToAiLabel(severityFromWasteCount(wasteCount));
}
