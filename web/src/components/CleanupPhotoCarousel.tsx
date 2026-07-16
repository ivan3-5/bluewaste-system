"use client";

import { useState } from "react";
import Image from "next/image";

type CleanupPhoto = {
  id: string;
  imageUrl: string;
};

type CleanupPhotoCarouselProps = {
  images: CleanupPhoto[];
};

export function CleanupPhotoCarousel({ images }: CleanupPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = images.length;
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
          alt={`Cleanup proof ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {hasMultiple && (
        <div className="flex items-center justify-between gap-3 border-t border-emerald-200 bg-white px-3 py-2">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <p className="text-xs font-medium text-slate-600">
            Photo {currentIndex + 1} of {total}
          </p>

          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === total - 1}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
