import { describe, expect, it } from "vitest";
import {
  validateScheduleDetails,
  validateScheduleEquipment,
  validateScheduleWorkers,
  detectBarangayFromLocation,
} from "@/lib/schedule-validation";

describe("Schedule Wizard Step Validations", () => {
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const validStep1Form = {
    title: "Panabo Coastal Sweep Operation",
    locationName: "Panabo City Coastal Road, Purok 2, Cagangohan",
    barangay: "Barangay Cagangohan",
    scheduledAt: futureDate,
    description: "Full coastal sweep operation briefing covering zone 1 and zone 2 debris removal.",
    reportIds: ["report-1"],
  };

  const validDisplayedReports = [{ id: "report-1" }, { id: "report-2" }];

  describe("Step 1: Operation Details Validation", () => {
    it("fails when title is empty or less than 3 characters", () => {
      const emptyTitle = validateScheduleDetails({ ...validStep1Form, title: "" }, validDisplayedReports);
      expect(emptyTitle.valid).toBe(false);
      expect(emptyTitle.error).toBe("Please enter an operation title.");
      expect(emptyTitle.field).toBe("title");

      const shortTitle = validateScheduleDetails({ ...validStep1Form, title: "ab" }, validDisplayedReports);
      expect(shortTitle.valid).toBe(false);
      expect(shortTitle.error).toBe("Enter an operation title between 3 and 200 characters.");
      expect(shortTitle.field).toBe("title");
    });

    it("fails when location and barangay are both missing", () => {
      const noLocation = validateScheduleDetails(
        { ...validStep1Form, locationName: "", barangay: "" },
        validDisplayedReports,
      );
      expect(noLocation.valid).toBe(false);
      expect(noLocation.error).toBe("Please enter a location name or select a coastal waste report.");
      expect(noLocation.field).toBe("locationName");
    });

    it("fails when scheduled date/time is missing or invalid", () => {
      const missingDate = validateScheduleDetails(
        { ...validStep1Form, scheduledAt: "" },
        validDisplayedReports,
      );
      expect(missingDate.valid).toBe(false);
      expect(missingDate.error).toBe("Please choose a deployment date and time.");
      expect(missingDate.field).toBe("scheduledAt");

      const invalidDate = validateScheduleDetails(
        { ...validStep1Form, scheduledAt: "not-a-date" },
        validDisplayedReports,
      );
      expect(invalidDate.valid).toBe(false);
      expect(invalidDate.error).toBe("Choose a valid deployment date and time in Panabo.");
      expect(invalidDate.field).toBe("scheduledAt");
    });

    it("fails when scheduled date is in the past for new operations, but allows in edit mode", () => {
      const pastSchedule = validateScheduleDetails(
        { ...validStep1Form, scheduledAt: pastDate },
        validDisplayedReports,
        false,
      );
      expect(pastSchedule.valid).toBe(false);
      expect(pastSchedule.error).toBe("Choose a valid deployment date and time in Panabo.");
      expect(pastSchedule.field).toBe("scheduledAt");

      const pastScheduleEdit = validateScheduleDetails(
        { ...validStep1Form, scheduledAt: pastDate },
        validDisplayedReports,
        true,
      );
      expect(pastScheduleEdit.valid).toBe(true);
    });

    it("fails when no waste reports are selected", () => {
      const noReports = validateScheduleDetails(
        { ...validStep1Form, reportIds: [] },
        validDisplayedReports,
      );
      expect(noReports.valid).toBe(false);
      expect(noReports.error).toBe("Select at least one verified report for this cleanup operation.");
      expect(noReports.field).toBe("reportIds");
    });

    it("fails when a selected report is not in displayed reports", () => {
      const unavailableReport = validateScheduleDetails(
        { ...validStep1Form, reportIds: ["non-existent-report"] },
        validDisplayedReports,
      );
      expect(unavailableReport.valid).toBe(false);
      expect(unavailableReport.error).toBe("A selected report is no longer available. Review your report selection.");
      expect(unavailableReport.field).toBe("reportIds");
    });

    it("fails when description is less than 10 characters", () => {
      const shortDesc = validateScheduleDetails(
        { ...validStep1Form, description: "Too short" },
        validDisplayedReports,
      );
      expect(shortDesc.valid).toBe(false);
      expect(shortDesc.error).toBe("Enter an operational briefing between 10 and 2,000 characters.");
      expect(shortDesc.field).toBe("description");
    });

    it("passes when all Operation Details fields are valid", () => {
      const result = validateScheduleDetails(validStep1Form, validDisplayedReports);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Step 2: Equipment Allocation Validation", () => {
    it("fails when equipment list is empty", () => {
      const result = validateScheduleEquipment([]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Please select at least one equipment item or apply a preset.");
      expect(result.field).toBe("equipment");
    });

    it("passes when at least one equipment item is selected", () => {
      const singleItem = validateScheduleEquipment(["Gloves"]);
      expect(singleItem.valid).toBe(true);
      expect(singleItem.error).toBeUndefined();

      const standardPreset = validateScheduleEquipment([
        "Garbage Bags",
        "Gloves",
        "Face Masks",
        "Safety Vests",
      ]);
      expect(standardPreset.valid).toBe(true);
    });
  });

  describe("Step 3: Field Workers Assignment Validation", () => {
    it("fails when no field workers are assigned", () => {
      const result = validateScheduleWorkers([]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Please assign at least one field worker.");
      expect(result.field).toBe("workerIds");
    });

    it("passes when at least one field worker is assigned", () => {
      const result = validateScheduleWorkers(["worker-uuid-1"]);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Barangay Detection from Location", () => {
    it("detects Barangay San Francisco from address", () => {
      expect(detectBarangayFromLocation("San Francisco Coastal Area, Panabo")).toBe("Barangay San Francisco");
    });

    it("detects Barangay Cagangohan from address", () => {
      expect(detectBarangayFromLocation("Purok 3, Cagangohan shoreline")).toBe("Barangay Cagangohan");
    });

    it("detects Barangay J.P. Laurel from address", () => {
      expect(detectBarangayFromLocation("Agriya, J.P. Laurel, Panabo")).toBe("Barangay J.P. Laurel");
    });

    it("preserves explicit Barangay prefix", () => {
      expect(detectBarangayFromLocation("Barangay San Pedro")).toBe("Barangay San Pedro");
    });

    it("falls back to default Panabo coastal sector for generic Panabo location", () => {
      expect(detectBarangayFromLocation("Panabo City Boulevard")).toBe("Barangay Cagangohan");
    });
  });
});
