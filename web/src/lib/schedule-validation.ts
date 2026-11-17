import { formatScheduleDateTime, parseScheduleDateTime } from "@/lib/schedule-date";

export type WizardStep = "details" | "equipment" | "workers";

export interface StepConfig {
  id: WizardStep;
  label: string;
  shortLabel: string;
  stepNumber: number;
}

export const WIZARD_STEPS: StepConfig[] = [
  { id: "details", label: "1. Operation Details", shortLabel: "1. Details", stepNumber: 1 },
  { id: "equipment", label: "2. Equipment", shortLabel: "2. Equipment", stepNumber: 2 },
  { id: "workers", label: "3. Assign", shortLabel: "3. Assign", stepNumber: 3 },
];

export interface ScheduleFormData {
  title: string;
  locationName: string;
  barangay: string;
  scheduledAt: string;
  description: string;
  reportIds: string[];
  equipment: string[];
  workerIds: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}

// Helper to automatically extract and format the Target Barangay based on Location Name
export function detectBarangayFromLocation(locationStr: string): string {
  if (!locationStr || !locationStr.trim()) return "";
  const lower = locationStr.toLowerCase().trim();

  // 1. Direct or partial match with official Panabo coastal barangays
  if (lower.includes("san francisco")) return "Barangay San Francisco";
  if (lower.includes("san pedro")) return "Barangay San Pedro";
  if (lower.includes("cagangohan")) return "Barangay Cagangohan";
  if (lower.includes("san vicente")) return "Barangay San Vicente";
  if (lower.includes("j.p. laurel") || lower.includes("jp laurel"))
    return "Barangay J.P. Laurel";
  if (lower.includes("new visayas")) return "Barangay New Visayas";
  if (lower.includes("tagpore")) return "Barangay Tagpore";
  if (lower.includes("datu abdul")) return "Barangay Datu Abdul Dadia";
  if (lower.includes("maduao")) return "Barangay Maduao";
  if (lower.includes("kasilak")) return "Barangay Kasilak";
  if (lower.includes("malativas")) return "Barangay Malativas";
  if (lower.includes("san nicolas")) return "Barangay San Nicolas";
  if (lower.includes("san roque")) return "Barangay San Roque";
  if (lower.includes("salvacion")) return "Barangay Salvacion";

  // 2. Regex match for "Barangay [Name]" or "Brgy. [Name]"
  const match = locationStr.match(/(?:Barangay|Brgy\.?)\s+([A-Za-z\s]+)/i);
  if (match && match[1]) {
    const raw = match[1].split(",")[0].trim();
    if (raw) return `Barangay ${raw}`;
  }

  // 3. If it already starts with Barangay, return it
  if (lower.startsWith("barangay ") || lower.startsWith("brgy.")) {
    return locationStr.trim();
  }

  // 4. Default for Panabo coastal general area
  if (lower.includes("panabo")) {
    return "Barangay Cagangohan"; // Main Panabo coastal sector
  }

  return locationStr.trim();
}

export function validateScheduleDetails(
  formData: {
    title: string;
    locationName: string;
    barangay: string;
    scheduledAt: string;
    description: string;
    reportIds: string[];
  },
  displayedReports: { id: string }[] = [],
  isEditing = false,
): ValidationResult {
  const title = formData.title.trim();
  const location = formData.locationName.trim() || formData.barangay.trim();
  const description = formData.description.trim();

  if (!title) {
    return { valid: false, error: "Please enter an operation title.", field: "title" };
  }
  if (title.length < 3 || title.length > 200) {
    return {
      valid: false,
      error: "Enter an operation title between 3 and 200 characters.",
      field: "title",
    };
  }
  if (!location) {
    return {
      valid: false,
      error: "Please enter a location name or select a coastal waste report.",
      field: "locationName",
    };
  }
  if (location.length > 300) {
    return {
      valid: false,
      error: "Enter a coastal location of up to 300 characters.",
      field: "locationName",
    };
  }
  if (!formData.scheduledAt) {
    return {
      valid: false,
      error: "Please choose a deployment date and time.",
      field: "scheduledAt",
    };
  }
  const scheduledAt = parseScheduleDateTime(formData.scheduledAt);
  if (
    !Number.isFinite(scheduledAt.getTime()) ||
    (!isEditing && formData.scheduledAt < formatScheduleDateTime(new Date()))
  ) {
    return {
      valid: false,
      error: "Choose a valid deployment date and time in Panabo.",
      field: "scheduledAt",
    };
  }
  if (formData.reportIds.length === 0) {
    return {
      valid: false,
      error: "Select at least one verified report for this cleanup operation.",
      field: "reportIds",
    };
  }
  if (
    displayedReports.length > 0 &&
    formData.reportIds.some(
      (id) => !displayedReports.some((report) => report.id === id),
    )
  ) {
    return {
      valid: false,
      error: "A selected report is no longer available. Review your report selection.",
      field: "reportIds",
    };
  }
  if (description.length < 10 || description.length > 2000) {
    return {
      valid: false,
      error: "Enter an operational briefing between 10 and 2,000 characters.",
      field: "description",
    };
  }
  return { valid: true };
}

export function validateScheduleEquipment(equipment: string[]): ValidationResult {
  if (equipment.length === 0) {
    return {
      valid: false,
      error: "Please select at least one equipment item or apply a preset.",
      field: "equipment",
    };
  }
  return { valid: true };
}

export function validateScheduleWorkers(workerIds: string[]): ValidationResult {
  if (workerIds.length === 0) {
    return {
      valid: false,
      error: "Please assign at least one field worker.",
      field: "workerIds",
    };
  }
  return { valid: true };
}
