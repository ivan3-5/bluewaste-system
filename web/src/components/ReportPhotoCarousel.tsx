"use client";

import { useState } from "react";
import Image from "next/image";

type ReportPhoto = {
  id: string;
  imageUrl: string;
  type: string;
};

type ReportPhotoCarouselProps = {
  images: ReportPhoto[];
};

export function ReportPhotoCarousel({ images }: ReportPhotoCarouselProps) {
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
    <div>
      <div className="relative h-72 w-full sm:h-80">
        <Image
          src={currentImage.imageUrl}
          alt={`Citizen submission ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white shadow">
          {currentImage.type === "REPORT" ? "Primary" : `Angle ${currentIndex + 1}`}
        </div>
      </div>

      {hasMultiple && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-slate-500">
            {currentIndex + 1} of {total}
          </span>
          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === total - 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
