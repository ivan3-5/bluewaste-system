"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MapPin,
  LocateFixed,
  ImagePlus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  EyeOff,
} from "lucide-react";
import { useReportingZones, isPointInAnyZone } from "@/hooks/useReportingZones";
import { useCreateReport, useUploadReportImages } from "@/hooks/useReports";

// ── Types ─────────────────────────────────────────────────────────────────────

type AiSeverity = "Low" | "Medium" | "High" | "Critical" | "None";

interface GeminiAnalysisResult {
  hasWaste: boolean;
  categories: string[];
  severity: AiSeverity;
  confidence: number;
  reason: string;
  reportId: string;
  status: string;
  imageUrl?: string;
  message?: string; // polite spam message
  cached?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const CATEGORY_LABELS: Record<string, string> = {
  plastic_bottle: "Plastic Bottle",
  plastic_bag: "Plastic Bag",
  fishing_net: "Fishing Net",
  rope: "Rope",
  styrofoam: "Styrofoam",
  can: "Can",
  glass: "Glass",
  battery: "Battery",
  diaper: "Diaper",
  cigarette_butt: "Cigarette Butt",
};

const CATEGORY_COLORS: Record<string, string> = {
  plastic_bottle: "bg-blue-100 text-blue-800 border-blue-200",
  plastic_bag: "bg-cyan-100 text-cyan-800 border-cyan-200",
  fishing_net: "bg-teal-100 text-teal-800 border-teal-200",
  rope: "bg-amber-100 text-amber-800 border-amber-200",
  styrofoam: "bg-purple-100 text-purple-800 border-purple-200",
  can: "bg-gray-100 text-gray-800 border-gray-200",
  glass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  battery: "bg-red-100 text-red-800 border-red-200",
  diaper: "bg-pink-100 text-pink-800 border-pink-200",
  cigarette_butt: "bg-orange-100 text-orange-800 border-orange-200",
};

const SEVERITY_CONFIG: Record<AiSeverity, { label: string; classes: string }> = {
  Critical: { label: "Critical", classes: "bg-red-100 text-red-800 border-red-300" },
  High: { label: "High", classes: "bg-orange-100 text-orange-800 border-orange-300" },
  Medium: { label: "Medium", classes: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  Low: { label: "Low", classes: "bg-green-100 text-green-800 border-green-300" },
  None: { label: "None", classes: "bg-slate-100 text-slate-600 border-slate-300" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReportWastePage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const { data: reportingZones = [] } = useReportingZones(true);
  const createReport = useCreateReport();
  const uploadImages = useUploadReportImages();
  const [outsideZone, setOutsideZone] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GeminiAnalysisResult | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(4);
  const [error, setError] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    if (!result || !result.reportId) return;
    if (countdownSeconds <= 0) {
      router.push("/my-reports");
      return;
    }
    const timer = setTimeout(() => {
      setCountdownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [result, countdownSeconds, router]);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Re-validate zone membership whenever location OR zones change
  useEffect(() => {
    if (latitude === null || longitude === null || reportingZones.length === 0) {
      setOutsideZone(false);
      return;
    }
    const inside = isPointInAnyZone(latitude, longitude, reportingZones);
    setOutsideZone(!inside);
    if (!inside) {
      setLocationStatus("Location is outside the designated coastal zone.");
    }
  }, [latitude, longitude, reportingZones]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isLoading && !user) {
    return null;
  }

  const onFileSelect = (file: File | null) => {
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Unsupported image type. Use JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Image must be 10MB or smaller.");
      return;
    }

    setError("");
    setResult(null);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported in this browser.");
      return;
    }

    setLocationStatus("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus("Location captured.");
      },
      () => {
        setLocationStatus("Unable to access your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleAnalyzeAndSubmit = async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }

    if (!token) {
      setError("Please login to analyze and submit reports.");
      return;
    }

    if (latitude === null || longitude === null) {
      setError("Please capture your location before submitting.");
      return;
    }

    // Hard zone guard
    if (
      reportingZones.length > 0 &&
      !isPointInAnyZone(latitude, longitude, reportingZones)
    ) {
      setError("Reporting is only allowed within the designated coastal zone.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      if (address.trim().length > 0) {
        formData.append("description", address.trim());
      }
      if (description.trim().length > 0) {
        formData.append("description", description.trim());
      }
      if (user?.id) {
        formData.append("citizenId", user.id);
      }

      const response = await fetch("/api/ai/analyze-report", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to analyze image");
      }

      const rawCategoryLabel = data.categories?.[0] ? (CATEGORY_LABELS[data.categories[0]] ?? data.categories[0]) : (data.hasWaste ? "With Waste" : "No Waste");
      const reportTitle = (rawCategoryLabel === "With Waste" || rawCategoryLabel === "No Waste")
        ? "Waste report"
        : `Waste report - ${rawCategoryLabel}`;
      const reportDescription = description.trim().length > 0
        ? description.trim()
        : (address.trim().length > 0 ? address.trim() : (data.reason || `Waste report submitted via quick capture.`));

      const severityMap: Record<string, "CRITICAL" | "HIGH" | "MODERATE" | "SPAM"> = {
        Critical: "CRITICAL",
        High: "HIGH",
        Medium: "MODERATE",
        Low: "MODERATE",
        None: "SPAM",
      };

      const createdReport = await createReport.mutateAsync({
        title: reportTitle,
        description: reportDescription,
        category: data.hasWaste ? "with_waste" : "no_waste",
        latitude: latitude,
        longitude: longitude,
        address: address.trim().length > 0 ? address.trim() : undefined,
        isAnonymous: isAnonymous,
        severity: data.hasWaste ? (severityMap[data.severity] ?? "MODERATE") : "SPAM",
        analysisStatus: data.hasWaste ? "DIRTY" : "CLEAN",
        analysisConfidence: data.confidence,
        analysisWasteCount: data.hasWaste ? Math.max(1, data.categories?.length || 1) : 0,
      });

      await uploadImages.mutateAsync({
        reportId: createdReport.id,
        files: [imageFile],
        type: "REPORT",
      });

      setCountdownSeconds(4);
      setResult({ ...data, reportId: createdReport.id } as GeminiAnalysisResult);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to analyze image");
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waste Analysis</h1>
            <p className="text-sm text-gray-600">
              Upload a photo — the system will detect, classify, and prepare your waste report automatically.
            </p>
          </div>
          <Link href="/my-reports">
            <Button variant="outline">View My Reports</Button>
          </Link>
        </div>

        {/* Upload Card */}
        <Card className="border-blue-100 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImagePlus className="h-5 w-5 text-blue-600" />
              Upload Waste Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="waste-image">Choose Image</Label>
                <Input
                  id="waste-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInput}
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-gray-500">
                  Accepted: JPG, PNG, WEBP (max 10MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera-image">Use Camera</Label>
                <Input
                  id="camera-image"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInput}
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-gray-500">
                  Mobile-friendly camera capture input
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="address">Address or landmark (optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isAnalyzing}
                >
                  <LocateFixed className="mr-1 h-4 w-4" />
                  Use Current Location
                </Button>
              </div>
              <Input
                id="address"
                placeholder="e.g. Near public market"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={isAnalyzing}
              />
              <div className="text-xs text-gray-500">
                {locationStatus}
                {latitude !== null && longitude !== null && (
                  <span className="ml-1 font-medium text-gray-700">
                    ({latitude.toFixed(5)}, {longitude.toFixed(5)})
                  </span>
                )}
              </div>
              {outsideZone && (
                <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
                  Reporting is only allowed within the designated coastal zone.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Additional description (optional)</Label>
              <Input
                id="description"
                placeholder="Describe what you see..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            {/* Submit anonymously */}
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
                  id="submit-anonymously-quick"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={isAnalyzing}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <label
                htmlFor="submit-anonymously-quick"
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

            {/* Image Preview */}
            {previewUrl && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="relative w-full h-[28rem]">
                  <Image
                    src={previewUrl}
                    alt="Waste preview"
                    fill
                    unoptimized
                    className="object-contain bg-white"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

            {/* Analyze & Submit Button */}
            <Button
              id="analyze-submit-btn"
              onClick={handleAnalyzeAndSubmit}
              disabled={!imageFile || isAnalyzing || outsideZone || latitude === null}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing image…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze &amp; Submit Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="border-violet-100 shadow-md">
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse rounded-full bg-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-800">Analyzing image…</p>
                <p className="mt-1 text-sm text-slate-500">
                  Scanning your photo for waste and categories. This usually takes 3–8 seconds.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Confirmation Card & Countdown */}
        {result && !isAnalyzing && (
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg animate-in fade-in zoom-in duration-300">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Report Submitted Successfully!
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Your photo was analyzed and submitted. Report ID:{" "}
                <span className="font-mono font-semibold">{result.reportId}</span>
              </p>
              <div className="my-4 rounded-xl bg-white/80 p-3 text-xs font-medium text-gray-700 shadow-sm border border-emerald-100">
                Redirecting to My Reports in{" "}
                <span className="font-bold text-emerald-600 text-sm">
                  {countdownSeconds}s
                </span>
                …
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                  onClick={() => router.push("/my-reports")}
                >
                  Go to My Reports Now
                </Button>
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={() => {
                    setResult(null);
                    setImageFile(null);
                    setPreviewUrl(null);
                    setError("");
                    setDescription("");
                  }}
                >
                  Submit Another Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Card */}
        {result && !isAnalyzing && (
          <Card
            className={`shadow-md ${
              result.hasWaste
                ? "border-emerald-100"
                : "border-amber-100"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {result.hasWaste ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Waste Detected
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    No Waste Found
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Spam / No Waste Message */}
              {!result.hasWaste && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Report marked as Spam</p>
                  <p className="mt-1">
                    {result.message ||
                      "No visible waste was detected in this image. Your report has been marked as Spam."}
                  </p>
                </div>
              )}

              {/* Waste Result Grid */}
              {result.hasWaste && (
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Categories */}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Detected Categories
                    </p>
                    {result.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.categories.map((cat) => (
                          <span
                            key={cat}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                              CATEGORY_COLORS[cat] ?? "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">None identified</p>
                    )}
                  </div>

                  {/* Severity */}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Severity
                    </p>
                    {result.severity !== "None" && (
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${
                          SEVERITY_CONFIG[result.severity]?.classes ??
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {SEVERITY_CONFIG[result.severity]?.label ?? result.severity}
                      </span>
                    )}
                  </div>

                  {/* Confidence */}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Confidence Score
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            (confidencePct ?? 0) >= 80
                              ? "bg-emerald-500"
                              : (confidencePct ?? 0) >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${confidencePct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-gray-900">
                        {confidencePct}%
                      </span>
                    </div>
                  </div>

                  {/* AI Reason */}
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Analysis Details
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {result.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Location summary */}
              {(latitude !== null || longitude !== null) && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  <p className="mb-1 flex items-center gap-1 font-medium text-gray-800">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Attached Location
                  </p>
                  {address.trim().length > 0 && <p>Address: {address.trim()}</p>}
                  {latitude !== null && longitude !== null && (
                    <p>
                      Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </p>
                  )}
                </div>
              )}

              {/* Report ID */}
              <p className="text-xs text-gray-400">
                Report ID: <span className="font-mono">{result.reportId}</span>
                {result.cached && " (duplicate — reused existing analysis)"}
              </p>

              {/* Submit another */}
              <Button
                id="submit-another-btn"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResult(null);
                  setImageFile(null);
                  setPreviewUrl(null);
                  setError("");
                  setDescription("");
                }}
              >
                Submit Another Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
