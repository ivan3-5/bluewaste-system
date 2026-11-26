export { parseYoloSeverity } from "../../../backend/src/utils/severity";
export type { WasteSeverityLevel as YoloSeverity } from "../../../backend/src/utils/severity";

export type DbSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SPAM";
export type AiSeverityLabel = "Low" | "Medium" | "High" | "None";

export function severityFromWasteCount(wasteCount: number): Exclude<DbSeverity, "CRITICAL"> | null {
  if (wasteCount >= 26) return "HIGH";
  if (wasteCount >= 14) return "MODERATE";
  if (wasteCount >= 4) return "LOW";
  return wasteCount <= 0 ? "SPAM" : null;
}

export function dbSeverityToAiLabel(severity: DbSeverity | null | undefined): AiSeverityLabel {
  switch (severity) {
    case "CRITICAL":
    case "HIGH": return "High";
    case "MODERATE": return "Medium";
    case "LOW": return "Low";
    default: return "None";
  }
}

export function aiSeverityFromWasteCount(wasteCount: number): AiSeverityLabel {
  return dbSeverityToAiLabel(severityFromWasteCount(wasteCount));
}

const severityRank = { SPAM: 0, LOW: 2, MODERATE: 3, HIGH: 4, CRITICAL: 5 };

export function isStrongerPhoto(
  candidate: { model: string; severity: DbSeverity | null; wasteCount: number },
  current: { model: string; severity: DbSeverity | null; wasteCount: number },
): boolean {
  if (candidate.model === "yolo" || current.model === "yolo") {
    return (candidate.severity ? severityRank[candidate.severity] : 1) >
      (current.severity ? severityRank[current.severity] : 1);
  }
  return candidate.wasteCount > current.wasteCount;
}

export function formatWasteAnalysis(hasWaste: boolean, severity: AiSeverityLabel): string {
  return `${hasWaste ? "Waste detected" : "No waste detected"}. Severity: ${hasWaste ? severity : "None"}.`;
}
