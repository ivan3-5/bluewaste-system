"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, Camera, User } from "lucide-react";

type ReportPhoto = {
  id: string;
  imageUrl: string;
  type: string;
};

type ReportPhotoCarouselProps = {
  images: ReportPhoto[];
  heightClassName?: string;
  className?: string;
  reporterName?: string | null;
  reportedAt?: string | Date | null;
};

export function ReportPhotoCarousel({
  images,
  heightClassName = "h-72 sm:h-80",
  className = "",
  reporterName,
  reportedAt,
}: ReportPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const total = images.length;
  const currentImage = images[currentIndex];
  const hasMultiple = total > 1;

  const goToPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const goToNext = () => {
    setCurrentIndex((index) => Math.min(total - 1, index + 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen, total]);

  if (total === 0) return null;

  return (
    <>
      <div className={`relative overflow-hidden group ${className}`}>
        <div
          onClick={() => setIsLightboxOpen(true)}
          className={`relative w-full ${heightClassName} bg-slate-900/5 cursor-zoom-in`}
          title="Click to view full size"
        >
          <Image
            src={currentImage.imageUrl}
            alt={`Citizen submission ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Top-Left Angle/Primary Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs shadow-xs pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>
              {currentImage.type === "REPORT"
                ? "Primary"
                : `Angle ${currentIndex + 1}`}
            </span>
          </div>

          {/* Top-Right: Slide Count + View Large Button */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {hasMultiple && (
              <span className="rounded-md bg-slate-900/75 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-xs pointer-events-none">
                {currentIndex + 1} / {total}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              title="Click to view full size"
              className="flex items-center gap-1 rounded-md bg-black/65 hover:bg-black/85 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs shadow-xs transition hover:scale-105 active:scale-95"
            >
              <Maximize2 className="h-3 w-3" />
              <span>View Large</span>
            </button>
          </div>

          {/* Next / Previous arrows */}
          {hasMultiple && (
            <div className="absolute inset-y-0 inset-x-1.5 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                disabled={currentIndex === 0}
                className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/85 disabled:opacity-0 disabled:pointer-events-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                disabled={currentIndex === total - 1}
                className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/85 disabled:opacity-0 disabled:pointer-events-none"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 py-1.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Centered Lightbox Modal (View Large) ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#181c24]/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Centered Modal Card Container */}
          <div
            className="relative flex flex-col w-full max-w-4xl lg:max-w-5xl max-h-[90vh] bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-in zoom-in-95 duration-200 my-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex w-full items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-slate-950/40 shrink-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
                  <Camera className="h-3.5 w-3.5" />
                  Citizen Submission Original
                </span>
                {reporterName && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-300">
                    <User className="h-3.5 w-3.5 text-blue-400" />
                    Submitted by:{" "}
                    <strong className="text-white font-bold">
                      {reporterName}
                    </strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {hasMultiple && (
                  <span className="text-xs font-semibold text-slate-400">
                    Photo {currentIndex + 1} of {total}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 active:scale-95"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Large Center Photo */}
            <div className="relative flex-1 w-full flex items-center justify-center p-3 sm:p-5 bg-black/40 min-h-[320px] max-h-[64vh]">
              <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] max-h-[60vh]">
                <Image
                  src={currentImage.imageUrl}
                  alt={`Citizen submission ${currentIndex + 1}`}
                  fill
                  sizes="(max-width: 1200px) 90vw, 1024px"
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow-xl border border-white/10"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={currentIndex === total - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow-xl border border-white/10"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails */}
            {hasMultiple && (
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950/60 border-t border-white/10 overflow-x-auto shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      idx === currentIndex
                        ? "border-blue-400 scale-105 shadow-md shadow-blue-500/20"
                        : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
