"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCreateReport, useUploadReportImages } from "@/hooks/useReports";
import { useReportingZones, isPointInAnyZone } from "@/hooks/useReportingZones";
import {
  WASTE_CATEGORY_LABELS,
  WasteCategory,
  WasteSeverityLegacy,
  WasteType,
} from "@/types";
import { getApiErrorMessage } from "@/lib/apiError";
import { DetectionBox, inferWasteCategory } from "@/lib/waste-classification";
import DetectionImageOverlay from "@/components/ai/DetectionImageOverlay";
import { SeverityBadge, type SeverityLevel } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  EyeOff,
  ImagePlus,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
} from "lucide-react";

const LocationPickerMap = dynamic(
  () => import("@/components/map/LocationPicker"),
  { ssr: false },
);

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

type AnalyzeWasteResult = {
  detectedObject: string;
  dominantWaste: WasteType | null;
  totalItems: number;
  severity: any;
  has_waste?: boolean;
  wasteCategory?: WasteCategory;
  confidence: number;
  status: "DIRTY" | "CLEAN";
  wasteCount: number;
  count: number;
  topConfidence: number | null;
  decision: {
    isUncertain: boolean;
    message: string | null;
    retakeRecommended: boolean;
    captureTips: string[];
  };
  labels: any[];
  detections: DetectionBox[];
};

type WasteBucket = "with_waste" | "no_waste";

const WASTE_BUCKET_LABELS: Record<WasteBucket, string> = {
  with_waste: "With Waste",
  no_waste: "No Waste",
};

const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  PLASTIC: "Plastic",
  ORGANIC: "Organic",
  GLASS: "Glass",
  METAL: "Metal",
  PAPER: "Paper",
};

const DOMINANT_WASTE_STYLES: Record<WasteType, string> = {
  PLASTIC: "bg-blue-100 text-blue-700 border-blue-200",
  ORGANIC: "bg-emerald-100 text-emerald-700 border-emerald-200",
  GLASS: "bg-teal-100 text-teal-700 border-teal-200",
  METAL: "bg-amber-100 text-amber-700 border-amber-200",
  PAPER: "bg-slate-100 text-slate-700 border-slate-200",
};

const SEVERITY_STYLES: Record<WasteSeverityLegacy, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

function resolveSeverityLevel(val: unknown, confidence: number): SeverityLevel {
  if (typeof val === "string") {
    const upper = val.toUpperCase();
    if (upper === "CRITICAL") return "CRITICAL";
    if (upper === "HIGH") return "HIGH";
    if (upper === "MEDIUM" || upper === "MODERATE") return "MODERATE";
    if (upper === "LOW") return "MODERATE";
    if (upper === "SPAM") return "SPAM";
  }
  if (confidence >= 0.9) return "CRITICAL";
  if (confidence >= 0.7) return "HIGH";
  if (confidence >= 0.5) return "MODERATE";
  return "SPAM";
}

const SEVERITY_DESCRIPTIONS: Record<string, string> = {
  CRITICAL: "Immediate cleanup required!",
  HIGH: "Schedule cleanup within 24 hours.",
  MODERATE: "Queued for cleanup.",
  SPAM: "Flagged for admin review.",
};

function mapAnalysisToBucket(result: AnalyzeWasteResult): WasteBucket {
  // has_waste is the authoritative field from the YOLO /analyze endpoint.
  // Fall back to status only when has_waste is not explicitly set.
  if (result.has_waste === true) return "with_waste";
  if (result.has_waste === false) return "no_waste";
  return result.status === "DIRTY" ? "with_waste" : "no_waste";
}

function resolveWasteCategoryForSubmission(result: AnalyzeWasteResult | null) {
  if (result?.wasteCategory) {
    return result.wasteCategory;
  }
  if (result) {
    return inferWasteCategory(result.labels || [], result.dominantWaste);
  }
  return "PLASTIC_WASTE" as WasteCategory;
}

function buildDefaultDescription(bucket: WasteBucket) {
  return `Waste report submitted via mobile capture. Category: ${WASTE_BUCKET_LABELS[bucket]}.`;
}

function geolocationErrorMessage(code: number) {
  if (code === 1)
    return "Location permission denied. Allow location access to continue.";
  if (code === 2) return "Could not determine your location. Please try again.";
  if (code === 3) return "Location request timed out. Please try again.";
  return "Unable to retrieve location.";
}

function toNonNegativeInt(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.trunc(parsed);
    }
  }

  return fallback;
}

function normalizeDecisionStatus(value: unknown): "DIRTY" | "CLEAN" {
  if (typeof value !== "string") {
    return "CLEAN";
  }
  const upper = value.trim().toUpperCase();
  if (upper === "DIRTY") return "DIRTY";
  if (upper === "CLEAN") return "CLEAN";
  return "CLEAN";
}

function toFiniteNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return fallback;
}

async function requestAnalyzeWaste(
  formData: FormData,
  token: string,
): Promise<any> {
  // Demo mode: synthesize response client-side when activated
  try {
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem("demo_mode") === "true"
    ) {
      const counterRaw = window.localStorage.getItem("demo_counter") ?? "1";
      let counter = Number(counterRaw) || 1;

      const isOdd = counter % 2 === 1;
      // confidence ranges per spec
      const confidence = isOdd
        ? 0.91 + Math.random() * (0.96 - 0.91)
        : 0.93 + Math.random() * (0.97 - 0.93);

      const label = isOdd ? "with_waste" : "no_waste";
      const isWaste = isOdd;

      const payload = {
        label,
        confidence: Number(confidence.toFixed(4)),
        is_waste: isWaste,
        severity: isWaste ? null : null,
        message: isWaste ? "Coastal waste detected." : "Area is clean.",
        // compatibility fields used by the client
        status: isWaste ? "DIRTY" : "CLEAN",
        waste_count: isWaste ? 1 : 0,
        count: isWaste ? 1 : 0,
        top_confidence: Number(confidence.toFixed(4)),
        decision: {
          is_uncertain: false,
          message: isWaste ? "Coastal waste detected." : "Area is clean.",
          retake_recommended: false,
        },
        labels: [],
        detections: [],
        detectedObject: isWaste ? "waste" : "none",
      };

      // increment and persist counter
      try {
        counter += 1;
        window.localStorage.setItem("demo_counter", String(counter));
      } catch (e) {
        // ignore storage errors
      }

      return payload;
    }
  } catch (e) {
    // fall through to real request on any error
  }
  const endpoints = ["/api/ai/analyze-report"];
  let lastErrorMessage = "Failed to analyze image.";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        return payload;
      }

      lastErrorMessage =
        payload?.message || payload?.error || "Failed to analyze image.";

      // On this monorepo Vercel deployment, /api may resolve to backend first.
      if (response.status !== 404) {
        throw new Error(lastErrorMessage);
      }
    } catch (error) {
      lastErrorMessage =
        error instanceof Error ? error.message : "Failed to analyze image.";
    }
  }

  throw new Error(lastErrorMessage);
}

export default function SubmitReportPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const createReport = useCreateReport();
  const uploadImages = useUploadReportImages();
  const { data: reportingZones = [] } = useReportingZones(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WasteBucket | "">(
    "",
  );
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeWasteResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [decisionMessage, setDecisionMessage] = useState("");

  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outsideZone, setOutsideZone] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);

  useEffect(() => {
    if (!isSubmittedSuccess) return;
    if (countdownSeconds <= 0) {
      router.push("/citizen/my-reports");
      return;
    }
    const timer = setTimeout(() => {
      setCountdownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSubmittedSuccess, countdownSeconds, router]);

  // Re-validate every time location or zones change
  useEffect(() => {
    if (!location || reportingZones.length === 0) {
      setOutsideZone(false);
      return;
    }
    setOutsideZone(
      !isPointInAnyZone(location.lat, location.lng, reportingZones),
    );
  }, [location, reportingZones]);

  const canSubmit = useMemo(
    () =>
      !!imageFile &&
      !!location &&
      locationConfirmed &&
      selectedCategory !== "" &&
      !isSubmitting &&
      !outsideZone,
    [
      imageFile,
      location,
      locationConfirmed,
      selectedCategory,
      isSubmitting,
      outsideZone,
    ],
  );

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Auto-run analysis when a new image is selected and user is authenticated.
  // Small delay gives the browser time to create the preview and for
  // `requestCurrentLocation()` to start fetching coordinates.
  useEffect(() => {
    if (!imageFile) return;
    if (!token) return;
    if (analysisResult) return; // already analyzed
    if (isAnalyzing) return; // already running

    const timer = setTimeout(() => {
      // Fire and forget — handleAnalyzeWaste manages its own state and errors
      handleAnalyzeWaste();
    }, 300);

    return () => clearTimeout(timer);
    // Intentionally exclude handleAnalyzeWaste from deps to avoid re-creating
    // the timeout when the function identity changes; rely on state deps above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, token, analysisResult, isAnalyzing]);

  const requestCurrentLocation = () => {
    setIsLocating(true);
    setLocationError("");
    setLocationStatus("Getting your current location...");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationStatus("");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocation(nextLocation);
        setLocationConfirmed(false);
        setLocationStatus(
          "Location detected. Confirm or adjust the pin on the map.",
        );
        setIsLocating(false);
      },
      (error) => {
        setLocationError(geolocationErrorMessage(error.code));
        setLocationStatus("");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    );
  };

  const selectImage = (file: File | null) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFileError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError("Image must be 8MB or smaller.");
      return;
    }

    setFileError("");
    setSubmitError("");
    setAnalysisError("");
    setDecisionMessage("");
    setAnalysisResult(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    requestCurrentLocation();
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectImage(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const openCameraPicker = () => {
    if (!cameraInputRef.current) return;
    cameraInputRef.current.setAttribute("capture", "environment");
    cameraInputRef.current.click();
  };

  const analyzeWasteImage = async (): Promise<AnalyzeWasteResult> => {
    if (!imageFile) {
      throw new Error("Select an image first.");
    }

    if (!token) {
      throw new Error("Your session expired. Please log in again.");
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("latitude", String(location?.lat ?? 0));
    formData.append("longitude", String(location?.lng ?? 0));
    formData.append("citizenId", user?.id || "citizen");

    const payload = await requestAnalyzeWaste(formData, token);
    console.log("🔍 Waste Analysis API JSON Output:", payload);

    const hasWasteRaw = payload?.hasWaste ?? payload?.has_waste;
    const hasWaste: boolean =
      typeof hasWasteRaw === "boolean"
        ? hasWasteRaw
        : typeof hasWasteRaw === "string"
          ? hasWasteRaw === "true"
          : true;

    const status: "DIRTY" | "CLEAN" = hasWaste ? "DIRTY" : "CLEAN";

    const decisionPayload = payload?.decision ?? {};
    const isUncertain = toBoolean(decisionPayload?.is_uncertain, false);
    const retakeRecommended = toBoolean(
      decisionPayload?.retake_recommended,
      isUncertain,
    );
    const decisionMessage =
      typeof payload?.reason === "string" && payload.reason.trim().length > 0
        ? payload.reason.trim()
        : typeof payload?.message === "string" && payload.message.trim().length > 0
          ? payload.message.trim()
          : typeof decisionPayload?.message === "string" &&
              decisionPayload.message.trim().length > 0
            ? decisionPayload.message.trim()
            : null;

    const captureTips = Array.isArray(decisionPayload?.capture_tips)
      ? decisionPayload.capture_tips.filter(
          (tip: unknown): tip is string => typeof tip === "string",
        )
      : [];

    const categoriesList = Array.isArray(payload?.categories)
      ? payload.categories
      : Array.isArray(payload?.labels)
        ? payload.labels
        : [];

    const confidenceVal =
      typeof payload?.confidence === "number" &&
      Number.isFinite(payload.confidence)
        ? payload.confidence
        : 0;

    const severityVal = payload?.severity || (hasWaste ? "MODERATE" : "SPAM");

    return {
      detectedObject: hasWaste ? "waste" : "none",
      dominantWaste: null,
      totalItems: categoriesList.length || (hasWaste ? 1 : 0),
      severity: severityVal,
      has_waste: hasWaste,
      confidence: confidenceVal,
      status,
      wasteCount: hasWaste ? 1 : 0,
      count: categoriesList.length || (hasWaste ? 1 : 0),
      topConfidence: confidenceVal,
      wasteCategory: undefined,
      decision: {
        isUncertain,
        message: decisionMessage,
        retakeRecommended,
        captureTips,
      },
      labels: categoriesList,
      detections: Array.isArray(payload?.detections) ? payload.detections : [],
    };
  };

  const handleAnalyzeWaste = async () => {
    setIsAnalyzing(true);
    setAnalysisError("");
    setDecisionMessage("");

    try {
      const result = await analyzeWasteImage();

      setAnalysisResult(result);
      setSelectedCategory(mapAnalysisToBucket(result));
      if (result.decision.retakeRecommended) {
        setDecisionMessage(
          result.decision.message ||
            "Uncertain classification. Please retake the image for better accuracy.",
        );
      } else if (!result.has_waste) {
        setDecisionMessage("No waste detected in this image.");
      } else {
        const countLabel = result.wasteCount > 0 ? ` (${result.wasteCount} item${result.wasteCount !== 1 ? "s" : ""})` : "";
        setDecisionMessage(`Waste detected${countLabel}. Ready to submit.`);
      }
    } catch (error) {
      setAnalysisResult(null);
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to analyze image.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setSubmitError("You need to log in before submitting a report.");
      router.push("/login");
      return;
    }

    if (!imageFile) {
      setSubmitError("Please add a photo before submitting.");
      return;
    }
    if (!location) {
      setSubmitError("Location is required.");
      return;
    }
    if (!locationConfirmed) {
      setSubmitError("Please confirm your pin location on the map.");
      return;
    }

    // Hard zone guard
    if (
      location &&
      reportingZones.length > 0 &&
      !isPointInAnyZone(location.lat, location.lng, reportingZones)
    ) {
      setSubmitError("You can only report within the designated coastal zone.");
      return;
    }
    if (!selectedCategory) {
      setSubmitError("Please select a waste category.");
      return;
    }

    // Allow submitting reports marked as `no_waste` — backend will auto-mark
    // them as spam after images are uploaded (auto analysis). We no longer
    // block submission for `no_waste` so spam detection runs server-side.

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 0 && trimmedDescription.length < 10) {
      setSubmitError(
        "Description must be at least 10 characters when provided.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setDecisionMessage("");

    try {
      const resolvedCategory =
        resolveWasteCategoryForSubmission(analysisResult);
      const reportTitle = `Waste report - ${WASTE_BUCKET_LABELS[selectedCategory]}`;
      const reportDescription =
        trimmedDescription.length > 0
          ? trimmedDescription
          : buildDefaultDescription(selectedCategory);

      // Backend expects a simple bucket category: "with_waste" | "no_waste".
      // Use the selectedCategory (set from analysis or user) to satisfy the API.
      // Also forward the pre-computed YOLO analysis data so severity is stored
      // immediately without requiring a second YOLO call from the backend.
      const severityToSave = analysisResult?.has_waste
        ? resolveSeverityLevel(analysisResult.severity, analysisResult.confidence)
        : null;

      const report = await createReport.mutateAsync({
        title: reportTitle,
        description: reportDescription,
        category: selectedCategory,
        latitude: location.lat,
        longitude: location.lng,
        isAnonymous: isAnonymous,
        // Analysis data from the client-side YOLO /analyze pipeline
        severity: severityToSave,
        analysisStatus: analysisResult?.status ?? null,
        analysisConfidence: analysisResult?.confidence ?? null,
        analysisWasteCount: analysisResult?.wasteCount ?? null,
        aiModel: analysisResult ? "gemini-3.5-flash" : null,
        aiCategories: analysisResult?.labels?.filter((l: unknown): l is string => typeof l === "string" && l !== "with_waste" && l !== "no_waste") ?? [],
        aiReason: decisionMessage || analysisResult?.decision?.message || (analysisResult?.has_waste ? `Detected waste items (${(analysisResult?.labels || []).join(", ")}) with ${Math.round((analysisResult?.confidence || 0) * 100)}% confidence.` : "No visible waste detected.") || null,
      });

      await uploadImages.mutateAsync({
        reportId: report.id,
        files: [imageFile],
        type: "REPORT",
      });

      setIsSubmittedSuccess(true);
      setCountdownSeconds(3);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setSubmitError("Session expired. Please log in and try again.");
        router.push("/login");
        return;
      }

      setSubmitError(
        getApiErrorMessage(error, "Failed to submit report. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-gray-50 to-emerald-50/30 p-4">
        <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl animate-in fade-in zoom-in duration-300">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Report Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Thank you for helping protect our coastal areas. Your waste report has been submitted and is queued for review.
          </p>

          <div className="my-6 rounded-xl bg-gray-50 p-3.5 text-xs font-medium text-gray-700 ring-1 ring-gray-100">
            Redirecting to My Reports in{" "}
            <span className="font-bold text-emerald-600 text-sm">
              {countdownSeconds}s
            </span>
            …
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold h-11 rounded-xl shadow-sm"
              onClick={() => router.push("/citizen/my-reports")}
            >
              Go to My Reports Now
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setIsSubmittedSuccess(false);
                setCountdownSeconds(3);
                setImageFile(null);
                setImagePreview(null);
                setLocationConfirmed(false);
                setDescription("");
                setSelectedCategory("");
                setAnalysisResult(null);
              }}
            >
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* ── Page header ── */}
      <div className="border-b bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Submit Waste Report
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 hidden sm:block">
              Photo · Confirm location · Submit
            </p>
          </div>

          {/* Step pills */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 border ${imageFile ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200"}`}
            >
              {imageFile ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                  1
                </span>
              )}
              Photo
            </span>
            <span className="text-gray-300">›</span>
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 border ${locationConfirmed ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-400 border-gray-200"}`}
            >
              {locationConfirmed ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                  2
                </span>
              )}
              Location
            </span>
            <span className="text-gray-300">›</span>
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 border ${canSubmit ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-400 border-gray-200"}`}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                3
              </span>
              Submit
            </span>
          </div>
        </div>
      </div>

      {/* ── Hidden file inputs ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        title="Upload waste image"
        className="hidden"
        onChange={handleFileInput}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        title="Capture waste image"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* ── No image: centered upload prompt ── */}
      {!imageFile && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border-2 border-dashed border-blue-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <ImagePlus className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                Add a waste photo
              </p>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG or WEBP · max 8 MB
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="gap-2" onClick={openCameraPicker}>
                <Camera className="h-4 w-4" /> Take a Photo
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
            </div>
            {fileError && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> {fileError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Two-column layout once image is selected ── */}
      {imageFile && (
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-5"
        >
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            {/* ══ LEFT COLUMN — Photo + AI analysis ══ */}
            <div className="space-y-4">
              {/* Photo card */}
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      Waste Photo
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={openCameraPicker}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Camera className="h-3 w-3" /> Retake
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-3 w-3" /> Replace
                    </button>
                  </div>
                </div>
                {imagePreview && (
                  <DetectionImageOverlay
                    imageSrc={imagePreview}
                    alt="Selected waste"
                    detections={analysisResult?.detections || []}
                    imageClassName="w-full h-auto max-h-80 object-contain bg-gray-50"
                  />
                )}
              </div>

              {/* AI Analysis card */}
              <div className="rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    Waste Analysis
                  </span>
                  <span className="ml-auto text-[11px] text-gray-400">
                    Optional — helps auto-fill waste type
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-violet-200 bg-violet-50/70 p-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Analyzing image…
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Detecting waste categories, severity, and confidence score
                        </p>
                      </div>
                    </div>
                  )}

                  {!isAnalyzing && analysisError && (
                    <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{" "}
                      {analysisError}
                    </p>
                  )}

                  {!isAnalyzing && analysisResult && (
                    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${analysisResult.has_waste !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {analysisResult.has_waste !== false ? "✓" : "✕"}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {analysisResult.has_waste !== false ? "Waste Detected" : "No Waste Detected"}
                          </span>
                        </div>
                        <SeverityBadge severity={resolveSeverityLevel(analysisResult.severity, analysisResult.confidence)} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">Confidence</span>
                          <span className="font-bold text-gray-800">
                            {(analysisResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, analysisResult.confidence * 100))}%` }}
                          />
                        </div>
                      </div>

                      {resolveSeverityLevel(analysisResult.severity, analysisResult.confidence) && (
                        <p className="text-[11px] text-gray-600 italic">
                          {SEVERITY_DESCRIPTIONS[resolveSeverityLevel(analysisResult.severity, analysisResult.confidence) || "MODERATE"]}
                        </p>
                      )}

                      {analysisResult.labels && analysisResult.labels.length > 0 && (
                        <div className="pt-1 border-t border-gray-200/80">
                          <span className="text-[11px] font-semibold text-gray-700 block mb-1.5">Detected Labels:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.labels.map((lbl: any, idx: number) => {
                              const labelText = typeof lbl === "string" ? lbl : (lbl?.label || lbl?.class_name || "item");
                              const confText = typeof lbl === "object" && typeof lbl?.confidence === "number" ? ` (${(lbl.confidence * 100).toFixed(0)}%)` : "";
                              return (
                                <span key={idx} className="inline-flex items-center rounded-md bg-white border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-2xs">
                                  {labelText}{confText}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {decisionMessage && (
                    <p
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        analysisResult?.decision.retakeRecommended
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : analysisResult?.has_waste
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {decisionMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ══ RIGHT COLUMN — Location + form + submit ══ */}
            <div className="space-y-4">
              {/* Location card */}
              <div className="rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      Pin Location
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={requestCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Detecting…
                      </>
                    ) : (
                      "Detect Again"
                    )}
                  </button>
                </div>

                {/* Map */}
                <div className="overflow-hidden rounded-b-none">
                  <div className="h-64 sm:h-72">
                    <LocationPickerMap
                      value={location}
                      zones={reportingZones}
                      onChange={(nextLocation) => {
                        setLocation(nextLocation);
                        setLocationConfirmed(false);
                        setLocationError("");
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3">
                  {locationStatus && (
                    <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                      {locationStatus}
                    </p>
                  )}
                  {locationError && (
                    <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                      <AlertCircle className="h-3.5 w-3.5" /> {locationError}
                    </p>
                  )}
                  {outsideZone && (
                    <p className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      You can only report within the designated coastal zone.
                    </p>
                  )}
                  {location && !outsideZone && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                      <span className="font-mono text-xs text-gray-500">
                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </span>
                      {!locationConfirmed ? (
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => setLocationConfirmed(true)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Pin
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Report details card */}
              <div className="rounded-2xl border bg-white shadow-sm">
                <div className="border-b px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    Report Details
                  </span>
                </div>
                <div className="space-y-4 p-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="waste-category"
                      className="text-xs font-medium text-gray-700"
                    >
                      Waste Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="waste-category"
                      title="Select waste category"
                      className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-gray-100"
                      value={selectedCategory}
                      onChange={(event) =>
                        setSelectedCategory(event.target.value as WasteBucket)
                      }
                      // Lock the category when AI detected waste to prevent accidental override
                      disabled={!!(analysisResult?.has_waste)}
                    >
                      <option value="">Select waste category…</option>
                      {(["with_waste", "no_waste"] as WasteBucket[]).map(
                        (key) => (
                          <option key={key} value={key}>
                            {WASTE_BUCKET_LABELS[key]}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="description"
                      className="text-xs font-medium text-gray-700"
                    >
                      Description{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Add details about the waste condition or surroundings…"
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Submit anonymously option */}
                  <div
                    className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      isAnonymous
                        ? "border-emerald-200 bg-emerald-50/60 text-emerald-950 shadow-sm"
                        : "border-gray-200 bg-gray-50/50 text-gray-800"
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        id="submit-anonymously"
                        checked={isAnonymous}
                        onChange={(event) => setIsAnonymous(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <label
                      htmlFor="submit-anonymously"
                      className="flex flex-1 cursor-pointer flex-col gap-0.5 select-none"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                        <EyeOff className={`h-4 w-4 ${isAnonymous ? "text-emerald-600" : "text-gray-500"}`} />
                        <span>Submit anonymously</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">
                        Hide your personal identity from city officials, field workers, and the public map.
                      </p>
                    </label>
                  </div>

                  {(fileError || submitError) && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{fileError || submitError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full h-11 gap-2 text-sm font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving
                        Report…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
