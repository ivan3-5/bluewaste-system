"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CleanupPhoto = {
  id: string;
  imageUrl: string;
};

type CleanupPhotoCarouselProps = {
  images: CleanupPhoto[];
  heightClassName?: string;
  className?: string;
};

export function CleanupPhotoCarousel({
  images,
  heightClassName = "h-72 sm:h-80",
  className = "",
}: CleanupPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = images.length;
  if (total === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = total > 1;

  const goToPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const goToNext = () => {
    setCurrentIndex((index) => Math.min(total - 1, index + 1));
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`relative w-full ${heightClassName} bg-emerald-950/5`}>
        <Image
          src={currentImage.imageUrl}
          alt={`Cleanup proof ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-emerald-900/80 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Proof {currentIndex + 1}</span>
        </div>

        {hasMultiple && (
          <div className="absolute top-2.5 right-2.5 rounded-md bg-emerald-900/70 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-xs">
            {currentIndex + 1} / {total}
          </div>
        )}

        {hasMultiple && (
          <div className="absolute inset-y-0 inset-x-1.5 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition hover:bg-black/75 disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Previous proof image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={currentIndex === total - 1}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition hover:bg-black/75 disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Next proof image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {hasMultiple && (
        <div className="flex items-center justify-center gap-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 py-1.5 border-t border-emerald-200 dark:border-emerald-800/60">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "w-4 bg-emerald-600 dark:bg-emerald-400" : "w-1.5 bg-emerald-200 dark:bg-emerald-850 hover:bg-emerald-300 dark:hover:bg-emerald-700"
              }`}
              aria-label={`Go to proof slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
