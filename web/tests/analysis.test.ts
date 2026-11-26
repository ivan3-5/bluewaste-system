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
      hasWaste: true, categories: ["plastic", "glass"], severity: "HIGH",
      wasteCount: 4, reason: "Waste detected. Severity: High.", model: "yolo",
    });
    expect(mocks.gemini).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.hf.space/gradio_api/call/analyze");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).data[0]).toMatchObject({
      mime_type: "image/png", meta: { _type: "gradio.FileData" },
    });
    expect(fetchMock.mock.calls[1][0]).toBe("https://example.hf.space/gradio_api/call/analyze/event-1");
  });

  it("uses server-side Space credentials and resolves on a split terminal event", async () => {
    vi.stubEnv("HF_TOKEN", "test-space-token");
    const encoder = new TextEncoder();
    const cancel = vi.fn();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("event: heartbeat\r\ndata: null\r\n\r\nevent: com"));
        controller.enqueue(encoder.encode(`plete\r\ndata: ${JSON.stringify([yoloPayload])}\r\n\r\n`));
      },
      cancel,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(stream));
    vi.stubGlobal("fetch", fetchMock);

    expect((await POST(request())).status).toBe(200);
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.headers.Authorization).toBe("Bearer test-space-token");
    }
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("retries an explicit queue rejection before a job is accepted", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ detail: "Queue is full!" }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([yoloPayload])}\n\n`));
    vi.stubGlobal("fetch", fetchMock);

    expect((await POST(request())).status).toBe(200);
    expect(fetchMock.mock.calls.map(([, options]) => options.method ?? "GET")).toEqual(["POST", "POST", "GET"]);
  });

  it.each([
    ["event: error\ndata: GPU quota exceeded.\n\n", 429, /GPU quota/],
    ['event: complete\ndata: [{"error":"GPU quota exceeded."}]\n\n', 429, /GPU quota/],
    ["event: error\ndata: timed out waiting for a GPU\n\n", 504, /timed out/],
    ["event: error\ndata: null\n\n", 503, /could not analyze/],
  ] as const)("keeps per-photo provider failures actionable without submitting twice", async (events, status, message) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(events));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());
    expect(response.status).toBe(status);
    expect((await response.json()).message).toMatch(message);
    expect(fetchMock).toHaveBeenCalledTimes(2);
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
      hasWaste: true, categories: ["plastic_bottle"], severity: "None",
      wasteCount: 3, reason: "Waste detected. Severity: None.", model: "gemini-test",
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
      severity: "MODERATE", reason: "Waste detected. Severity: Medium.", model: "yolo", cached: true,
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
      hasWaste: false, categories: [], severity: "SPAM", wasteCount: 0,
      reason: "No waste detected. Severity: None.", model: "yolo",
    });
    expect(fetchMock.mock.calls[0][1].body).toBeInstanceOf(FormData);
  });

  it.each([
    [0, "None"], [1, "None"], [3, "None"], [4, "Low"], [13, "Low"],
    [14, "Medium"], [25, "Medium"], [26, "High"],
  ])("preserves Gemini grading for %i detected items", (count, label) => {
    const hasWaste = count > 0;
    const categories = hasWaste ? ["plastic_bottle"] : [];
    const gemini = validateGeminiResult({
      hasWaste, severity: "None", wasteCount: count, categories,
      reason: `There are ${count} bottles.`,
    });
    expect(gemini).toMatchObject({ valid: true, data: {
      hasWaste, severity: label, wasteCount: count,
      reason: `${hasWaste ? "Waste detected" : "No waste detected"}. Severity: ${label}.`,
    } });
  });

  it("shows None for missing comments and legacy analysis stored as a comment", () => {
    expect(citizenComment("  ")).toBe("None");
    expect(citizenComment("Found three items.", "Found three items.")).toBe("None");
    expect(citizenComment("Please check the shoreline.", "Found three items.")).toBe("Please check the shoreline.");
    expect(citizenComment("Waste detected. Severity: Low.", "Waste detected. Severity: Low.")).toBe("Waste detected. Severity: Low.");
  });

  it("uses explicit YOLO spam despite two reported items in both endpoints", async () => {
    const emptyPayload = { has_waste: true, severity: "SPAM", waste_count: 2, labels: [{ label: "others", count: 2 }] };
    const stubAnalysis = () => vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([emptyPayload])}\n\n`)));

    stubAnalysis();
    const response = await POST(request());
    expect(await response.json()).toMatchObject({
      hasWaste: false, severity: "SPAM", wasteCount: 0, status: "REJECTED",
      message: "No waste detected. Severity: None.",
    });

    stubAnalysis();
    const legacy = await legacyPOST(legacyRequest());
    expect(await legacy.json()).toMatchObject({ has_waste: false, status: "CLEAN", severity: "SPAM", labels: [], waste_count: 0 });
  });

  it("accepts a graded YOLO result with zero items and a conflicting waste flag", () => {
    expect(normalizeYoloResult({ has_waste: false, severity: "LOW", waste_count: 0, labels: [] }))
      .toMatchObject({ hasWaste: true, severity: "LOW", wasteCount: 0 });
  });

  it.each([undefined, null, "None", "MEDIUM", "CRITICAL", "low"])(
    "returns an analysis error for unsupported YOLO severity %s in both endpoints",
    async (severity) => {
      for (const analyze of [() => POST(request()), () => legacyPOST(legacyRequest())]) {
        vi.stubGlobal("fetch", vi.fn()
          .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
          .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([{ ...yoloPayload, severity }])}\n\n`)));
        const response = await analyze();
        expect(response.status).toBe(502);
        expect(await response.json()).toMatchObject({ error: expect.stringContaining("invalid severity") });
      }
    },
  );

  it("reanalyzes legacy cached YOLO results with no explicit grade", async () => {
    mocks.query.mockResolvedValue([{
      id: "report-1", hasWaste: true, categories: ["others"],
      severity: null, wasteCount: 2, aiModel: "yolo", status: "PENDING",
    }]);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ event_id: "event-1" }))
      .mockResolvedValueOnce(new Response(`event: complete\ndata: ${JSON.stringify([yoloPayload])}\n\n`));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    const body = await response.json();
    expect(body).toMatchObject({ hasWaste: true, severity: "HIGH" });
    expect(body).not.toHaveProperty("cached");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("derives Gemini severity from the counted items, not the model's own severity", async () => {
    vi.stubEnv("USE_GEMINI", "true");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.gemini.mockResolvedValue({
      result: { hasWaste: true, categories: ["can"], wasteCount: 25, severity: "Low", reason: "Many cans." },
      modelName: "gemini-test", latencyMs: 1,
    });
    const response = await POST(request());
    expect(await response.json()).toMatchObject({ severity: "Medium", wasteCount: 25, reason: "Waste detected. Severity: Medium." });
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
      labels: ["plastic_bottle"], waste_count: 3, severity: null, reason: "Waste detected. Severity: None.",
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
      detectedObject: "plastic_bottle", labels: ["plastic_bottle"], severity: null,
    });
  });
});
