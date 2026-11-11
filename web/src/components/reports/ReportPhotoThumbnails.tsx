"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function usePhotoUrl(file: File | null) {
  const [preview, setPreview] = useState<{ file: File; url: string }>();

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return preview?.file === file ? preview.url : undefined;
}

function PhotoThumbnail({ file, label, onRemove, primary }: {
  file: File;
  label: string;
  onRemove?: () => void;
  primary: boolean;
}) {
  const url = usePhotoUrl(file);
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
      {url && <Image src={url} alt={label} fill unoptimized sizes="120px" className="object-cover" />}
      {primary && (
        <span className="absolute bottom-1 left-1 rounded bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">Primary</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label.toLowerCase()}`}
          className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/85 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function ReportPhotoThumbnails({ files, onRemove, showPrimary = false }: {
  files: File[];
  onRemove?: (index: number) => void;
  showPrimary?: boolean;
}) {
  if (!files.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {files.map((file, index) => (
        <PhotoThumbnail
          key={`${file.name}-${file.lastModified}-${index}`}
          file={file}
          label={`Photo ${index + 1}`}
          onRemove={onRemove && (() => onRemove(index))}
          primary={showPrimary && index === 0}
        />
      ))}
    </div>
  );
}
