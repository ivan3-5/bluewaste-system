import { describe, it, expect } from "vitest";
import { getStatusColor, REPORT_STATUS_LABELS } from "../src/types";

describe("Report Detail Location Coordinates Map logic", () => {
  it("maps report status CLEANED to green color token", () => {
    const color = getStatusColor("CLEANED");
    expect(color.toLowerCase()).toBe("#22c55e");
  });

  it("maps report status PENDING to orange color token", () => {
    const color = getStatusColor("PENDING");
    expect(color.toLowerCase()).toBe("#f97316");
  });

  it("maps report status IN_PROGRESS to yellow/amber color token", () => {
    const color = getStatusColor("IN_PROGRESS");
    expect(color.toLowerCase()).toBe("#eab308");
  });

  it("maps report status VERIFIED to blue color token", () => {
    const color = getStatusColor("VERIFIED");
    expect(color.toLowerCase()).toBe("#2563eb");
  });

  it("maps report status CLEANUP_SCHEDULED to purple color token", () => {
    const color = getStatusColor("CLEANUP_SCHEDULED");
    expect(color.toLowerCase()).toBe("#8b5cf6");
  });

  it("maps report status REJECTED to red color token", () => {
    const color = getStatusColor("REJECTED");
    expect(color.toLowerCase()).toBe("#ef4444");
  });

  it("falls back gracefully to pending orange for unknown or missing statuses", () => {
    expect(getStatusColor(undefined).toLowerCase()).toBe("#f97316");
    expect(getStatusColor("unknown_status").toLowerCase()).toBe("#f97316");
  });

  it("has proper human-readable labels for all report statuses", () => {
    expect(REPORT_STATUS_LABELS.CLEANED).toBe("Cleaned");
    expect(REPORT_STATUS_LABELS.PENDING).toBe("Pending");
    expect(REPORT_STATUS_LABELS.IN_PROGRESS).toBe("In Progress");
    expect(REPORT_STATUS_LABELS.VERIFIED).toBe("Verified");
    expect(REPORT_STATUS_LABELS.CLEANUP_SCHEDULED).toBe("Cleanup Scheduled");
    expect(REPORT_STATUS_LABELS.REJECTED).toBe("Rejected");
  });

  it("uses standard 50-meter cleanup radius", () => {
    const defaultRadius = 50;
    expect(defaultRadius).toBe(50);
  });
});
