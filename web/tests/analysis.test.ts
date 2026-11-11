import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  gemini: vi.fn(),
  upload: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ default: { $queryRaw: mocks.query } }));
vi.mock("@/lib/cloudinary", () => ({ uploadToCloudinary: mocks.upload }));
vi.mock("@/lib/ai/gemini", () => ({
  analyzeImageWithGemini: mocks.gemini,
  GeminiError: class GeminiError extends Error { code = ""; },
}));

import { POST } from "../src/app/api/ai/analyze-report/route";
import { POST as legacyPOST } from "../src/app/api/analyze-waste/route";
import { normalizeYoloResult } from "../src/lib/ai/yolo";
import { validateGeminiResult } from "../src/lib/ai/validator";
import { citizenComment } from "../src/lib/utils";

const yoloPayload = {
  has_waste: true,
  severity: "HIGH",
  waste_count: 4,
  labels: [{ label: "plastic", count: 3 }, { label: "glass", count: 1 }],
  message: "Waste detected.",
};

function request() {
  const form = new FormData();
  form.append("image", new File(["test"], "test.png", { type: "image/png" }));
  form.append("latitude", "1");
  form.append("longitude", "2");
  return new NextRequest("http://localhost/api/ai/analyze-report", { method: "POST", body: form });
}

function legacyRequest(saveIfDirty = false) {
  const form = new FormData();
  form.append("image", new File(["test"], "test.png", { type: "image/png" }));
  if (saveIfDirty) form.append("saveIfDirty", "true");
  return new NextRequest("http://localhost/api/analyze-waste", {
    method: "POST", body: form, headers: { Authorization: "Bearer test" },
  });
}

describe("web image analysis", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
    vi.stubEnv("YOLO_API_URL", "https://example.hf.space/analyze");
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("USE_GEMINI", "");
    mocks.query.mockResolvedValue([]);
    mocks.upload.mockResolvedValue({ secureUrl: "https://example.com/image" });
    mocks.gemini.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses YOLO by default and normalizes its structured result", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([yoloPayload])}\n\n`));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      hasWaste: true, categories: ["plastic", "glass"], severity: "Low",
      wasteCount: 4, reason: "Waste detected. Severity: Low.", model: "yolo",
    });
    expect(mocks.gemini).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.hf.space/gradio_api/call/analyze");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).data[0]).toMatchObject({
      mime_type: "image/png", meta: { _type: "gradio.FileData" },
    });
    expect(fetchMock.mock.calls[1][0]).toBe("https://example.hf.space/gradio_api/call/analyze/event-1");
  });

  it("uses only Gemini when enabled", async () => {
    vi.stubEnv("USE_GEMINI", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.gemini.mockResolvedValue({
      result: { hasWaste: true, categories: ["plastic_bottle"], wasteCount: 3, severity: "High", reason: "A bottle is visible." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      hasWaste: true, categories: ["plastic_bottle"], severity: "Low",
      wasteCount: 3, reason: "Waste detected. Severity: Low.", model: "gemini-test",
    });
    expect(mocks.gemini).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails explicitly on incomplete YOLO output", async () => {
    expect(() => normalizeYoloResult({ has_waste: false })).toThrow();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response("event: error\ndata: inference failed\n\n")));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(mocks.gemini).not.toHaveBeenCalled();
  });

  it("rejects an invalid provider setting", async () => {
    vi.stubEnv("USE_GEMINI", "yes");
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect((await response.json()).message).toContain("USE_GEMINI");
    expect(mocks.gemini).not.toHaveBeenCalled();
  });

  it("only requests cached results for the selected provider", async () => {
    mocks.query.mockResolvedValue([{
      id: "report-1", hasWaste: true, categories: ["plastic"],
      severity: "MODERATE", wasteCount: 1, aiReason: "Detected plastic.",
      aiModel: "yolo", status: "PENDING",
    }]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(await response.json()).toMatchObject({
      severity: "Low", reason: "Waste detected. Severity: Low.", model: "yolo", cached: true,
    });
    expect(mocks.query.mock.calls.at(-1)?.at(-1)).toBe("yolo");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normalizes clean detections and supports a multipart YOLO endpoint", async () => {
    vi.stubEnv("USE_GEMINI", "false");
    vi.stubEnv("YOLO_API_URL", "https://example.com/analyze");
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({
      has_waste: false, severity: "SPAM", waste_count: 0, labels: [], message: "No waste detected.",
    }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(await response.json()).toMatchObject({
      hasWaste: false, categories: [], severity: "None", wasteCount: 0,
      reason: "No waste detected. Severity: None.", model: "yolo",
    });
    expect(fetchMock.mock.calls[0][1].body).toBeInstanceOf(FormData);
  });

  it.each([
    [0, "None"], [1, "Low"], [8, "Low"], [9, "Medium"], [15, "Medium"],
    [16, "High"], [24, "High"], [25, "Critical"],
  ])("uses the same severity and summary for %i detected items in both providers", (count, label) => {
    const hasWaste = count > 0;
    const categories = hasWaste ? ["plastic_bottle"] : [];
    const yolo = normalizeYoloResult({
      has_waste: hasWaste, severity: "SPAM", waste_count: count, labels: categories,
      message: `Found ${count} bottles.`,
    });
    const gemini = validateGeminiResult({
      hasWaste, severity: "None", wasteCount: count, categories,
      reason: `There are ${count} bottles.`,
    });
    expect(yolo).toMatchObject({
      hasWaste, severity: label, wasteCount: count,
      reason: `${hasWaste ? "Waste detected" : "No waste detected"}. Severity: ${label}.`,
    });
    expect(gemini).toEqual({ valid: true, data: yolo });
  });

  it("shows None for missing comments and legacy analysis stored as a comment", () => {
    expect(citizenComment("  ")).toBe("None");
    expect(citizenComment("Found three items.", "Found three items.")).toBe("None");
    expect(citizenComment("Please check the shoreline.", "Found three items.")).toBe("Please check the shoreline.");
    expect(citizenComment("Waste detected. Severity: Low.", "Waste detected. Severity: Low.")).toBe("Waste detected. Severity: Low.");
  });

  it("treats a YOLO result with no detected items as spam in both endpoints", async () => {
    const emptyPayload = { has_waste: true, severity: "HIGH", waste_count: 0, labels: [] };
    const stubEmpty = () => vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([emptyPayload])}\n\n`)));

    stubEmpty();
    const response = await POST(request());
    expect(await response.json()).toMatchObject({
      hasWaste: false, severity: "None", wasteCount: 0, status: "REJECTED",
      message: "No waste detected. Severity: None.",
    });

    stubEmpty();
    const legacy = await legacyPOST(legacyRequest());
    expect(await legacy.json()).toMatchObject({ has_waste: false, status: "CLEAN", severity: "SPAM" });
  });

  it("derives Gemini severity from the counted items, not the model's own severity", async () => {
    vi.stubEnv("USE_GEMINI", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.gemini.mockResolvedValue({
      result: { hasWaste: true, categories: ["can"], wasteCount: 25, severity: "Low", reason: "Many cans." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const response = await POST(request());
    expect(await response.json()).toMatchObject({ severity: "Critical", wasteCount: 25, reason: "Waste detected. Severity: Critical." });
  });

  it("uses the Gradio protocol in the legacy endpoint", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([yoloPayload])}\n\n`));
    vi.stubGlobal("fetch", fetchMock);
    const response = await legacyPOST(legacyRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ provider: "yolo", aiModel: "yolo", has_waste: true });
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.hf.space/gradio_api/call/analyze");
  });

  it("uses Gemini in the legacy endpoint when selected", async () => {
    vi.stubEnv("USE_GEMINI", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.gemini.mockResolvedValue({
      result: { hasWaste: true, categories: ["plastic_bottle"], wasteCount: 3, severity: "High", reason: "A bottle." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const response = await legacyPOST(legacyRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      provider: "gemini", aiModel: "gemini-test", has_waste: true,
      labels: ["plastic_bottle"], waste_count: 3, severity: "LOW", reason: "Waste detected. Severity: Low.",
      detectedObject: "plastic_bottle", wasteCategory: "PLASTIC_WASTE",
    });
    expect(mocks.gemini).toHaveBeenCalledOnce();
  });

  it("preserves Gemini labels and severity when saving a legacy report", async () => {
    vi.stubEnv("USE_GEMINI", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.gemini.mockResolvedValue({
      result: { hasWaste: true, categories: ["plastic_bottle"], wasteCount: 3, severity: "High", reason: "A bottle." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ url: "https://example.com/image.png" }))
      .mockResolvedValueOnce(Response.json({ id: "report-1" }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await legacyPOST(legacyRequest(true));
    expect(response.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      detectedObject: "plastic_bottle", labels: ["plastic_bottle"], severity: "LOW",
    });
  });
});
