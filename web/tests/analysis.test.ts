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

const yoloPayload = {
  has_waste: true,
  severity: "HIGH",
  confidence: 0.8,
  labels: [{ label: "plastic", confidence: 0.8 }, { label: "glass", confidence: 0.7 }],
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
      hasWaste: true, categories: ["plastic", "glass"], severity: "High",
      confidence: 0.8, reason: "Waste detected.", model: "yolo",
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
      result: { hasWaste: true, categories: ["plastic_bottle"], severity: "High", confidence: 0.9, reason: "A bottle is visible." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      hasWaste: true, categories: ["plastic_bottle"], severity: "High",
      confidence: 0.9, reason: "A bottle is visible.", model: "gemini-test",
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
      severity: "MODERATE", confidence: 0.6, aiReason: "Detected plastic.",
      aiModel: "yolo", status: "PENDING",
    }]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(await response.json()).toMatchObject({
      severity: "Medium", model: "yolo", cached: true,
    });
    expect(mocks.query.mock.calls.at(-1)?.at(-1)).toBe("yolo");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normalizes clean detections and supports a multipart YOLO endpoint", async () => {
    vi.stubEnv("USE_GEMINI", "false");
    vi.stubEnv("YOLO_API_URL", "https://example.com/analyze");
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({
      has_waste: false, severity: "SPAM", confidence: 0, labels: [], message: "No waste detected.",
    }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(await response.json()).toMatchObject({
      hasWaste: false, categories: [], severity: "None", confidence: 0,
      reason: "No waste detected.", model: "yolo",
    });
    expect(fetchMock.mock.calls[0][1].body).toBeInstanceOf(FormData);
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
      result: { hasWaste: true, categories: ["plastic_bottle"], severity: "High", confidence: 0.9, reason: "A bottle." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const response = await legacyPOST(legacyRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      provider: "gemini", aiModel: "gemini-test", has_waste: true,
      labels: ["plastic_bottle"], confidence: 0.9,
      detectedObject: "plastic_bottle", wasteCategory: "PLASTIC_WASTE",
    });
    expect(mocks.gemini).toHaveBeenCalledOnce();
  });

  it("preserves Gemini labels and severity when saving a legacy report", async () => {
    vi.stubEnv("USE_GEMINI", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.gemini.mockResolvedValue({
      result: { hasWaste: true, categories: ["plastic_bottle"], severity: "High", confidence: 0.9, reason: "A bottle." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ url: "https://example.com/image.png" }))
      .mockResolvedValueOnce(Response.json({ id: "report-1" }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await legacyPOST(legacyRequest(true));
    expect(response.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      detectedObject: "plastic_bottle", labels: ["plastic_bottle"], severity: "HIGH",
    });
  });
});
