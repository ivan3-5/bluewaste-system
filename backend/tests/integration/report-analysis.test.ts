import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { ReportAnalysisService } from "../../src/services/report-analysis.service";

const config = vi.hoisted(() => ({
  YOLO_API_URL: "https://example.hf.space/analyze",
  USE_GEMINI: false,
  WEB_URL: "https://web.example.com",
}));
vi.mock("../../src/config/env", () => ({ env: config }));
vi.mock("../../src/utils/geo-cache", () => ({
  GeoCache: { invalidateAll: vi.fn() },
}));

afterEach(() => vi.unstubAllGlobals());
beforeEach(() => { config.USE_GEMINI = false; });

describe("background report analysis", () => {
  it("uses the Gradio protocol and stores the YOLO result", async () => {
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report-1", images: [{ imageUrl: "https://example.com/image.png" }],
      analyzedAt: null, severity: null, reporterId: null,
    } as never);
    prismaMock.$transaction.mockResolvedValue([{ id: "report-1" }] as never);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("image", { headers: { "content-type": "image/png" } }))
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([{
        has_waste: true, waste_count: 4, labels: [{ label: "plastic", count: 4 }],
      }])}\n\n`));
    vi.stubGlobal("fetch", fetchMock);

    await ReportAnalysisService.analyzeReport("report-1");

    expect(fetchMock.mock.calls[1][0]).toBe("https://example.hf.space/gradio_api/call/analyze");
    expect(fetchMock.mock.calls[2][0]).toBe("https://example.hf.space/gradio_api/call/analyze/event-1");
    expect(prismaMock.report.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        aiModel: "yolo", aiCategories: ["plastic"], analysisStatus: "DIRTY",
        analysisWasteCount: 4, severity: "HIGH", analysisConfidence: null,
        aiReason: "Detected categories: plastic.",
      }),
    }));
  });

  it.each([
    [1, "MODERATE"], [2, "MODERATE"], [3, "HIGH"], [6, "HIGH"], [7, "CRITICAL"], [12, "CRITICAL"],
  ])("derives YOLO severity from %i detected items", async (count, severity) => {
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report-1", images: [{ imageUrl: "https://example.com/image.png" }],
      analyzedAt: null, severity: null, reporterId: null,
    } as never);
    prismaMock.$transaction.mockResolvedValue([{ id: "report-1" }] as never);
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response("image", { headers: { "content-type": "image/png" } }))
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([{
        has_waste: true, severity: "SPAM", waste_count: count, labels: [{ label: "plastic", count }],
      }])}\n\n`)));

    await ReportAnalysisService.analyzeReport("report-1");

    expect(prismaMock.report.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ isSpam: false, severity, analysisWasteCount: count }),
    }));
  });

  it("marks a YOLO result with no detected items as spam", async () => {
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report-1", images: [{ imageUrl: "https://example.com/image.png" }],
      analyzedAt: null, severity: null, reporterId: null,
    } as never);
    prismaMock.$transaction.mockResolvedValue([{ id: "report-1" }] as never);
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response("image", { headers: { "content-type": "image/png" } }))
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([{
        has_waste: false, severity: "SPAM", waste_count: 0, labels: [],
      }])}\n\n`)));

    await ReportAnalysisService.analyzeReport("report-1");

    expect(prismaMock.report.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        isSpam: true, severity: "SPAM", analysisStatus: "CLEAN", category: "no_waste",
      }),
    }));
  });

  it("does not replace an existing web analysis", async () => {
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report-1", images: [], analyzedAt: new Date(), severity: "SPAM",
    } as never);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await ReportAnalysisService.analyzeReport("report-1");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prismaMock.report.update).not.toHaveBeenCalled();
  });

  it("uses the web Gemini provider when enabled", async () => {
    config.USE_GEMINI = true;
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report-1", images: [{ imageUrl: "https://example.com/image.png" }],
      latitude: 1, longitude: 2, analyzedAt: null, severity: null, reporterId: null,
    } as never);
    prismaMock.$transaction.mockResolvedValue([{ id: "report-1" }] as never);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("image", { headers: { "content-type": "image/png" } }))
      .mockResolvedValueOnce(Response.json({
        provider: "gemini", model: "gemini-test", hasWaste: true,
        categories: ["plastic_bottle"], wasteCount: 3, severity: "Low",
        reason: "Plastic bottles are visible.",
      }));
    vi.stubGlobal("fetch", fetchMock);
    await ReportAnalysisService.analyzeReport("report-1");
    expect(fetchMock.mock.calls[1][0].toString()).toBe("https://web.example.com/api/ai/analyze-report");
    expect(prismaMock.report.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        aiModel: "gemini-test", aiCategories: ["plastic_bottle"],
        aiReason: "Plastic bottles are visible.", analysisConfidence: null,
        analysisWasteCount: 3, severity: "HIGH",
      }),
    }));
  });

  it("does not persist results if the web provider does not match", async () => {
    config.USE_GEMINI = true;
    prismaMock.report.findUnique.mockResolvedValue({
      id: "report-1", images: [{ imageUrl: "https://example.com/image.png" }],
      latitude: 1, longitude: 2, analyzedAt: null, severity: null, reporterId: null,
    } as never);
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response("image"))
      .mockResolvedValueOnce(Response.json({ provider: "yolo" })));
    await ReportAnalysisService.analyzeReport("report-1");
    expect(prismaMock.report.update).not.toHaveBeenCalled();
  });
});
