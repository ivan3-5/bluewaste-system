import { describe, expect, it, vi } from "vitest";
import {
  cleanRemarks,
  formatLongDate,
  generateConsolidatedCleanupReportPdf,
  getSignaturesHeight,
  hasValidCombinedReport,
  type CleanupReportData,
} from "@/lib/cleanup-report-pdf";
import type { ConsolidatedCleanupReport } from "@/types";

const pdfMocks = vi.hoisted(() => ({
  save: vi.fn(),
  text: vi.fn(),
  line: vi.fn(),
  rect: vi.fn(),
  addPage: vi.fn(),
  setPage: vi.fn(),
}));

vi.mock("jspdf", () => {
  class MockJsPDF {
    setProperties = vi.fn();
    setTextColor = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    text = pdfMocks.text;
    setDrawColor = vi.fn();
    setLineWidth = vi.fn();
    line = pdfMocks.line;
    rect = pdfMocks.rect;
    getTextWidth = vi.fn().mockReturnValue(20);
    splitTextToSize = vi.fn((text: string) => [text]);
    addPage = pdfMocks.addPage;
    getNumberOfPages = vi.fn().mockReturnValue(2);
    setPage = pdfMocks.setPage;
    addImage = vi.fn();
    save = pdfMocks.save;
  }
  return { jsPDF: MockJsPDF };
});

describe("Combined Clean-up Drive Report PDF generation", () => {
  it("cleans remarks by removing 'Automatically completed:' prefix", () => {
    expect(
      cleanRemarks("Automatically completed: all associated waste reports have been cleaned."),
    ).toBe("All associated waste reports have been cleaned.");
    expect(
      cleanRemarks("AUTOMATICALLY COMPLETED: site cleared"),
    ).toBe("Site cleared");
    expect(cleanRemarks("Manual note from officer")).toBe("Manual note from officer");
    expect(cleanRemarks("")).toBe("");
    expect(cleanRemarks(null)).toBe("");
  });

  it("calculates signatures section height allowing sufficient vertical clearance for handwritten signatures", () => {
    const height = getSignaturesHeight({
      preparedBy: [
        { name: "RODULFO SARDA", position: "Labor General Foreman" },
        { name: "JOEMARIS D. BUGUIS", position: "Environmental Management Specialist I" },
        { name: "RECSON B. ENGALGADO, RPF, MSDA", position: "Environmental Management Specialist II" },
      ],
      notedBy: [
        { name: "MARIO R. PAÑA", position: "Sr. Environmental Management Specialist" },
        { name: "Engr. OLIVER Q. ORIOL", position: "CGADH, City ENRO" },
      ],
      approvedBy: [
        { name: "Engr. FELIX JONASES P. SENAJON, EnP., MEP-Envi.", position: "CGDH, City ENRO" },
      ],
    });
    // Height should be ample for 18mm signature clearances and section gaps
    expect(height).toBeGreaterThanOrEqual(100);
    expect(height).toBeLessThan(150);
  });

  it("formats dates into readable human strings", () => {
    expect(formatLongDate("2026-11-13")).toBe("November 13, 2026");
    expect(formatLongDate(null)).toBe("");
    expect(formatLongDate(undefined)).toBe("");
  });

  it("generates a consolidated clean-up drive report PDF using submitted form data", async () => {
    const mockReport: ConsolidatedCleanupReport = {
      scheduleId: "18b13f4c-1234-5678-abcd-000000000000",
      scheduleTitle: "Coastal Cleanup - Panabo City Coastal Road",
      description: "Mission description",
      barangay: "Barangay San Pedro",
      scheduledAt: "2026-11-13T08:00:00.000Z",
      overallStatus: "COMPLETED",
      summary: {
        totalReports: 2,
        totalCitizens: 2,
        cleanedReportsCount: 2,
        inProgressReportsCount: 0,
        scheduledReportsCount: 0,
        isFullyCleaned: true,
      },
      assignedWorkers: [
        {
          id: "w1",
          firstName: "Field",
          lastName: "Worker 1",
          email: "w1@example.com",
        },
      ],
      groupedReports: [
        {
          id: "r1",
          title: "Plastic near coastal road",
          description: "Pile of debris",
          status: "CLEANED",
          category: "PLASTIC",
          severity: "High",
          wasteQuantity: 10,
          latitude: 7.3,
          longitude: 125.6,
          address: "Panabo Coastal Road, Bariles",
          reporterId: "u1",
          reporter: { id: "u1", name: "Citizen 1", email: "c1@example.com" },
          isAnonymous: false,
          photoUrls: [],
          cleanupPhotoUrls: [],
          createdAt: "2026-11-10T00:00:00.000Z",
          updatedAt: "2026-11-11T00:00:00.000Z",
        },
      ],
      equipment: ["Rakes", "Gloves"],
      generatedAt: "2026-11-11T00:00:00.000Z",
    };

    const mockFormData: CleanupReportData = {
      cudNumber: "042",
      reportDate: "2026-11-11",
      forName: "ENGR. FELIX JONASES P. SENAJON, EnP., MEP-Envi.",
      forPosition: "CGDH, CENRO",
      dateConducted: "2026-11-13",
      activityType: "Coastal Clean-up",
      location: "Panabo City Coastal Road, Bariles",
      male: 5,
      female: 5,
      wasteType: "Plastic, Styrofoam",
      wasteKg: "120",
      areaCovered: "500 meters",
      organization: "City ENRO Panabo",
      focalName: "Field Worker 1",
      focalPosition: "Field Responder",
      remarks: "Mission completed successfully.",
      preparedBy: [{ name: "RODULFO SARDA", position: "Foreman" }],
      notedBy: [{ name: "MARIO R. PAÑA", position: "Specialist" }],
      approvedBy: [{ name: "ENGR. FELIX JONASES P. SENAJON", position: "CGDH" }],
      reportedPhotoUrls: [],
      cleanupPhotoUrls: [],
    };

    await generateConsolidatedCleanupReportPdf(
      mockReport,
      mockFormData,
      "test-combined-report.pdf",
    );

    expect(pdfMocks.save).toHaveBeenCalledWith("test-combined-report.pdf");
    expect(pdfMocks.text).toHaveBeenCalled();

    // Verify submitted form fields were included
    const textCalls = pdfMocks.text.mock.calls.map((call) => call[0]);
    expect(textCalls.some((t) => typeof t === "string" && t.includes("042"))).toBe(true);
    expect(textCalls).toContain("Coastal Clean-up");
    expect(textCalls).toContain("ENGR. FELIX JONASES P. SENAJON, EnP., MEP-Envi.");
  });

  describe("Combined report conditional visibility logic", () => {
    it("returns false when combined report data is null or undefined", () => {
      expect(hasValidCombinedReport(null)).toBe(false);
      expect(hasValidCombinedReport(undefined)).toBe(false);
    });

    it("returns false when schedule has no associated waste reports", () => {
      const emptyReportData = {
        scheduleId: "sched-1",
        groupedReports: [],
        summary: { totalReports: 0 },
      } as unknown as ConsolidatedCleanupReport;

      expect(hasValidCombinedReport(emptyReportData)).toBe(false);
    });

    it("returns false when schedule has only 1 individual waste report, even if COMPLETED", () => {
      const singleReportCompleted = {
        scheduleId: "sched-2",
        overallStatus: "COMPLETED",
        groupedReports: [
          { id: "rep-1", title: "Single waste report" },
        ],
        summary: { totalReports: 1 },
      } as unknown as ConsolidatedCleanupReport;

      // Single report should not show combined report button
      expect(hasValidCombinedReport(singleReportCompleted)).toBe(false);
    });

    it("returns true when schedule has multiple combined waste reports available", () => {
      const combinedReportData = {
        scheduleId: "sched-3",
        overallStatus: "COMPLETED",
        groupedReports: [
          { id: "rep-1", title: "Waste report 1" },
          { id: "rep-2", title: "Waste report 2" },
        ],
        summary: { totalReports: 2 },
      } as unknown as ConsolidatedCleanupReport;

      expect(hasValidCombinedReport(combinedReportData)).toBe(true);
    });

    it("checks actual combined report data summary when groupedReports array is absent", () => {
      const summaryOnlyData = {
        scheduleId: "sched-4",
        summary: { totalReports: 3 },
      } as unknown as ConsolidatedCleanupReport;

      expect(hasValidCombinedReport(summaryOnlyData)).toBe(true);
    });
  });
});
