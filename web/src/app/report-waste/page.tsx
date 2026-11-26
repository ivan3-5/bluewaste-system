"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/apiError";
import { useReportPhotoAnalysis } from "@/hooks/useReportPhotoAnalysis";
import { MAX_REPORT_PHOTOS, REPORT_PHOTO_ACCEPT, selectReportPhotos } from "@/lib/report-photos";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ReportPhotoThumbnails, usePhotoUrl } from "@/components/reports/ReportPhotoThumbnails";
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
  XCircle,
  EyeOff,
} from "lucide-react";
import { useReportingZones, isPointInAnyZone } from "@/hooks/useReportingZones";
import { useCreateReport, useUploadReportImages } from "@/hooks/useReports";
import { dbSeverityToAiLabel, formatWasteAnalysis, isStrongerPhoto, parseYoloSeverity, severityFromWasteCount, type DbSeverity } from "@/lib/severity";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportAnalysisResult {
  hasWaste: boolean;
  severity: DbSeverity | null;
  reportId: string;
  cached?: boolean;
}

interface PhotoResult {
  hasWaste: boolean;
  wasteCount: number;
  severity: DbSeverity | null;
  model: string;
  categories: string[];
  cached?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────


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

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReportWastePage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const { data: reportingZones = [], isSuccess: zonesLoaded } =
    useReportingZones(true);
  const createReport = useCreateReport();
  const uploadImages = useUploadReportImages();
  const [outsideZone, setOutsideZone] = useState(false);

  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [savedReport, setSavedReport] = useState<ReportAnalysisResult | null>(null);
  const { photoAnalysis, retryPhoto, clearPhotoAnalysis } = useReportPhotoAnalysis(photos, !!token && !savedReport, analyzePhoto);
  const analysisReady = photos.length > 0 && photos.every((photo) => !!photoAnalysis.get(photo)?.result);
  const photosPending = photos.some((photo) => !photoAnalysis.has(photo));
  const imageFile = photos[0] ?? null;
  const previewPhoto = selectedPhoto ?? imageFile;
  const previewUrl = usePhotoUrl(previewPhoto);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReportAnalysisResult | null>(null);
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
    if (latitude === null || longitude === null || !zonesLoaded) {
      setOutsideZone(false);
      return;
    }
    const inside = isPointInAnyZone(latitude, longitude, reportingZones);
    setOutsideZone(!inside);
    if (!inside) {
      setLocationStatus("Location is outside the designated reporting zones.");
    }
  }, [latitude, longitude, reportingZones, zonesLoaded]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (!isLoading && !user) {
    return null;
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || isAnalyzing || savedReport) return;

    const selection = selectReportPhotos(files, MAX_REPORT_PHOTOS - photos.length);
    setError(selection.error);
    setPhotos((current) => [...current, ...selection.photos].slice(0, MAX_REPORT_PHOTOS));
  };

  async function analyzePhoto(photo: File): Promise<PhotoResult> {
    const formData = new FormData();
    formData.append("image", photo);
    formData.append("latitude", String(latitude ?? 0));
    formData.append("longitude", String(longitude ?? 0));
    if (user?.id) formData.append("citizenId", user.id);
    const response = await fetch("/api/ai/analyze-report", {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || "Failed to analyze image");
    }
    const data = await response.json();
    if (data.provider === "yolo" || data.model === "yolo") {
      const severity = parseYoloSeverity(data.severity);
      if (!severity) throw new Error("YOLO returned an invalid severity. Retry this photo.");
      const hasWaste = severity !== "SPAM";
      return {
        ...data,
        model: "yolo",
        hasWaste,
        severity,
        wasteCount: hasWaste ? data.wasteCount : 0,
        categories: hasWaste ? data.categories : [],
      };
    }
    return { ...data, severity: severityFromWasteCount(data.wasteCount) };
  }

  const finishPhotoUpload = async (report: ReportAnalysisResult) => {
    await uploadImages.mutateAsync({
      reportId: report.reportId,
      files: photos.slice(uploadedCount),
      type: "REPORT",
      onUploaded: () => setUploadedCount((count) => count + 1),
    });
    setCountdownSeconds(4);
    setResult(report);
  };

  const startNewReport = () => {
    setResult(null);
    setSavedReport(null);
    setUploadedCount(0);
    setPhotos([]);
    setSelectedPhoto(null);
    clearPhotoAnalysis();
    setError("");
    setDescription("");
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
    if (isAnalyzing || result) return;

    if (savedReport) {
      setIsAnalyzing(true);
      setError("");
      try {
        await finishPhotoUpload(savedReport);
      } catch (error) {
        setError(getApiErrorMessage(error, "Failed to upload photos. Please try again."));
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

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
      !zonesLoaded ||
      !isPointInAnyZone(latitude, longitude, reportingZones)
    ) {
      setError("Reporting is only allowed within the designated reporting zones.");
      return;
    }

    if (description.trim().length > 0 && description.trim().length < 10) {
      setError("Comment must be at least 10 characters when provided.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      if (!analysisReady) {
        throw new Error("Wait for all photos to be checked. Retry or remove failed photos.");
      }
      const analyses = photos.map((photo) => photoAnalysis.get(photo)!.result!);
      const data = analyses.reduce((best, current) => isStrongerPhoto(current, best) ? current : best);
      const hasSpamPhotos = analyses.some((analysis) => !analysis.hasWaste);

      const rawCategoryLabel = data.categories?.[0] ? (CATEGORY_LABELS[data.categories[0]] ?? data.categories[0]) : (data.hasWaste ? "With Waste" : "No Waste");
      const reportTitle = (rawCategoryLabel === "With Waste" || rawCategoryLabel === "No Waste")
        ? "Waste report"
        : `Waste report - ${rawCategoryLabel}`;
      const createdReport = await createReport.mutateAsync({
        title: reportTitle,
        description: description.trim(),
        category: data.hasWaste ? "with_waste" : "no_waste",
        latitude: latitude,
        longitude: longitude,
        address: address.trim().length > 0 ? address.trim() : undefined,
        isAnonymous: isAnonymous,
        isSpamFlagged: hasSpamPhotos,
        spamReason: hasSpamPhotos ? "One or more attached photos were flagged as spam during image analysis." : undefined,
        severity: data.severity,
        analysisStatus: data.hasWaste ? "DIRTY" : "CLEAN",
        analysisWasteCount: data.wasteCount,
        aiModel: data.model,
        aiCategories: data.categories,
        aiReason: formatWasteAnalysis(data.hasWaste, dbSeverityToAiLabel(data.severity)),
      });

      const report: ReportAnalysisResult = {
        hasWaste: data.hasWaste === true,
        severity: data.severity,
        reportId: createdReport.id,
        cached: data.cached === true,
      };
      setSavedReport(report);
      await finishPhotoUpload(report);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to analyze image");
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waste Analysis</h1>
            <p className="text-sm text-gray-600">
              Attach up to five photos. Every photo is analyzed before submission.
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
              Waste Photos ({photos.length}/{MAX_REPORT_PHOTOS})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="waste-image">Choose Photos</Label>
                <Input
                  id="waste-image"
                  type="file"
                  accept={REPORT_PHOTO_ACCEPT}
                  multiple
                  onChange={handleFileInput}
                  disabled={isAnalyzing || !!savedReport || photos.length >= MAX_REPORT_PHOTOS}
                />
                <p className="text-xs text-gray-500">
JPG, PNG or WEBP · 4 MB each
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
                  disabled={isAnalyzing || !!savedReport || photos.length >= MAX_REPORT_PHOTOS}
                />
                <p className="text-xs text-gray-500">
                  Take one photo at a time
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
                  disabled={isAnalyzing || !!savedReport}
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
                disabled={isAnalyzing || !!savedReport}
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
                  {reportingZones.length === 0
                    ? "Reporting is unavailable: no reporting zones are active."
                    : "Reporting is only allowed within the designated reporting zones."}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Citizen comment (optional)</Label>
              <Input
                id="description"
                placeholder="Describe what you see..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isAnalyzing || !!savedReport}
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
                  disabled={isAnalyzing || !!savedReport}
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

            <ReportPhotoThumbnails
              files={photos}
              onSelect={setSelectedPhoto}
              selectedFile={previewPhoto}
              showPrimary
              analysis={photos.map((photo) => {
                const entry = photoAnalysis.get(photo);
                return !entry ? { status: "pending" as const }
                  : entry.error ? { status: "error" as const, message: entry.error }
                  : { status: entry.result?.hasWaste ? "complete" as const : "spam" as const };
              })}
              onRetry={isAnalyzing || savedReport ? undefined : (index) => retryPhoto(photos[index])}
              onRemove={isAnalyzing || savedReport ? undefined : (index) => {
                if (photos[index] === selectedPhoto) setSelectedPhoto(null);
                setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
                setError("");
              }}
            />
            {savedReport && !result && (
              <p role="status" className="text-sm text-gray-600">
                Report saved. {uploadedCount} of {photos.length} photos uploaded.
              </p>
            )}

            {photos.some((photo) => photoAnalysis.get(photo)?.result?.hasWaste === false) && <p role="alert" className="text-sm text-red-700">Warning: Keeping a spam photo will flag this report as spam. We suggest removing it.</p>}
            {photosPending && <p role="status" className="text-sm text-gray-600">Analyzing all photos…</p>}

            {/* Error */}
            {error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

            {/* Analyze & Submit Button */}
            <Button
              id="analyze-submit-btn"
              onClick={handleAnalyzeAndSubmit}
              disabled={
                isAnalyzing || !!result || (!savedReport && (!analysisReady || !imageFile || !zonesLoaded || outsideZone || latitude === null))
              }
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {savedReport ? "Uploading photos…" : "Submitting report…"}
                </>
              ) : savedReport && !result ? (
                "Retry Photo Upload"
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && !savedReport && (
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
                Your photos were submitted. Report ID:{" "}
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
                  onClick={startNewReport}
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
            <CardContent className="space-y-5 pt-5">
              {!result.hasWaste && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Report marked as spam.</p>
                </div>
              )}

              <AnalysisSummary
                hasWaste={result.hasWaste}
                severity={result.severity}
              />
              <div>
                <p className="text-xs font-semibold text-gray-500">Citizen Comment</p>
                <p className="mt-1 text-sm text-gray-700">{description.trim() || "None"}</p>
              </div>

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
                onClick={startNewReport}
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
