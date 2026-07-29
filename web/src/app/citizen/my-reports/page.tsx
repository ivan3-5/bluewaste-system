"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useMyReports } from "@/hooks/useReports";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  WASTE_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  ReportStatus,
} from "@/types";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ImageIcon, EyeOff } from "lucide-react";

interface LightboxState {
  images: string[];
  index: number;
  title: string;
}

export default function MyReportsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const { data, isLoading } = useMyReports({ page, status: statusFilter });

  const reports = data?.data || [];
  const pagination = data?.pagination;

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightbox({ images, index, title });
  };

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prev = useCallback(() => {
    setLightbox((lb) =>
      lb
        ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }
        : lb,
    );
  }, []);

  const next = useCallback(() => {
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb,
    );
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, prev, next]);

  return (
    <div>
      {/* ── Lightbox modal ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Panel — stop propagation so clicks inside don't close */}
          <div
            className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              aria-label="Close image viewer"
              onClick={closeLightbox}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-colors hover:bg-white hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div className="relative h-[80vh] w-[85vw]">
                <Image
                  src={lightbox.images[lightbox.index]}
                  alt={lightbox.title}
                  fill
                  className="block object-contain lightbox-img"
                />
              </div>

              {/* Prev / Next arrows — only shown when multiple images */}
              {lightbox.images.length > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/75"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    aria-label="Next image"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/75"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Caption + counter */}
            <div className="mt-3 flex items-center gap-3">
              <p className="text-sm font-medium text-white/90">
                {lightbox.title}
              </p>
              {lightbox.images.length > 1 && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs text-white">
                  {lightbox.index + 1} / {lightbox.images.length}
                </span>
              )}
            </div>

            {/* Thumbnail strip for multi-image reports */}
            {lightbox.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {lightbox.images.map((src, i) => (
                  <button
                    key={i}
                    aria-label={`View image ${i + 1}`}
                    onClick={() =>
                      setLightbox((lb) => (lb ? { ...lb, index: i } : lb))
                    }
                    className={`h-12 w-12 overflow-hidden rounded-md border-2 transition-all ${
                      i === lightbox.index
                        ? "border-white opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-black">
          My Reports
        </h1>
        <Link href="/citizen/report">
          <Button 
            size="sm" 
            className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="relative z-10 flex items-center gap-1.5 font-medium">
              <span className="text-lg leading-none transition-transform group-hover:rotate-90 duration-300">+</span>
              New Report
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex w-max gap-2 px-1">
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              !statusFilter
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-600"
                : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
            }`}
          >
            All Reports
          </button>
          {Object.entries(REPORT_STATUS_LABELS).map(([k, v]) => {
            const isActive = statusFilter === k;
            return (
              <button
                key={k}
                onClick={() => {
                  setStatusFilter(k as ReportStatus);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-600"
                    : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white/50 p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 rounded-md bg-gray-200"></div>
                    <div className="h-4 w-2/3 rounded-md bg-gray-100"></div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-24 rounded-full bg-gray-100"></div>
                    </div>
                  </div>
                  <div className="h-20 w-20 rounded-xl bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white/60 p-12 text-center shadow-lg shadow-blue-900/5 backdrop-blur-md transition-all">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />

            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/50 ring-1 ring-blue-200 shadow-inner group">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-12 w-12 text-blue-500 transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-3 animate-[bounce_3s_infinite]"
              >
                <path
                  fill="currentColor"
                  d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              No reports yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Create your first report to track clean-up status and keep your
              area visible to responders.
            </p>
            <div className="mt-6">
              <Link href="/citizen/report">
                <Button size="sm">Submit your first report</Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Tip: add a clear photo for faster validation.
            </p>
          </div>
        ) : (
          reports.map((report) => {
            const reportImages = report.images.filter(
              (img) => img.type === "REPORT",
            );
            const cleanupImages = report.images.filter(
              (img) => img.type === "CLEANUP",
            );
            const reportImageUrls = reportImages.map((img) => img.imageUrl);
            const cleanupImageUrls = cleanupImages.map((img) => img.imageUrl);
            return (
              <div
                key={report.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate transition-colors group-hover:text-blue-700">
                      {report.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <StatusBadge status={report.status} />
                      <div className="h-4 w-px bg-gray-200" />
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {WASTE_CATEGORY_LABELS[report.category]}
                      </span>
                      {report.isAnonymous && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          <EyeOff className="h-3 w-3 text-slate-500" /> Anonymous
                        </span>
                      )}
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {timeAgo(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Report + Cleanup thumbnails (side-by-side) */}
                  {(reportImageUrls.length > 0 ||
                    cleanupImageUrls.length > 0) && (
                    <div className="flex shrink-0 items-start gap-3">
                      {reportImageUrls.length > 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            aria-label={`View ${reportImageUrls.length} report photo${reportImageUrls.length > 1 ? "s" : ""} for ${report.title}`}
                            onClick={() =>
                              openLightbox(
                                reportImageUrls,
                                0,
                                `${report.title} (Report)`,
                              )
                            }
                            className="group relative block h-16 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all hover:scale-105 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <Image
                              src={reportImageUrls[0]}
                              alt="Report photo"
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                              <ImageIcon className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          </button>
                          <span className="text-[10px] text-gray-500">
                            Waste Report
                          </span>
                        </div>
                      )}
                      {cleanupImageUrls.length > 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            aria-label={`View ${cleanupImageUrls.length} cleanup photo${cleanupImageUrls.length > 1 ? "s" : ""} for ${report.title}`}
                            onClick={() =>
                              openLightbox(
                                cleanupImageUrls,
                                0,
                                `${report.title} (Cleanup)`,
                              )
                            }
                            className="group relative block h-16 w-16 overflow-hidden rounded-lg border border-emerald-200 shadow-sm transition-all hover:scale-105 hover:border-emerald-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          >
                            <Image
                              src={cleanupImageUrls[0]}
                              alt="Cleanup photo"
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                              <ImageIcon className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          </button>
                          <span className="text-[10px] text-emerald-600">
                            Cleanup
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
