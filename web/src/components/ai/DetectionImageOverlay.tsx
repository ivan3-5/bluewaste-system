"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DetectionBox } from "@/lib/waste-classification";

type Props = {
  imageSrc: string;
  alt: string;
  detections: DetectionBox[];
  imageClassName?: string;
};

export default function DetectionImageOverlay({
  imageSrc,
  alt,
  detections,
  imageClassName,
}: Props) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !naturalSize) {
      return;
    }

    const draw = () => {
      const rect = image.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.floor(rect.width));
      const cssHeight = Math.max(1, Math.floor(rect.height));
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(cssWidth * ratio);
      canvas.height = Math.floor(cssHeight * ratio);

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, cssWidth, cssHeight);

      for (const detection of detections) {
        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;

        if (detection.normalized) {
          x = detection.x * cssWidth;
          y = detection.y * cssHeight;
          width = detection.width * cssWidth;
          height = detection.height * cssHeight;
        } else {
          x = (detection.x / naturalSize.width) * cssWidth;
          y = (detection.y / naturalSize.height) * cssHeight;
          width = (detection.width / naturalSize.width) * cssWidth;
          height = (detection.height / naturalSize.height) * cssHeight;
        }

        if (width <= 0 || height <= 0) {
          continue;
        }

        context.strokeStyle = "#10b981";
        context.lineWidth = 2;
        context.fillStyle = "rgba(16, 185, 129, 0.08)";
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);

        const label = `${detection.className} ${(detection.confidence * 100).toFixed(1)}%`;
        context.font = "12px sans-serif";
        const textWidth = context.measureText(label).width;
        const textHeight = 18;
        const labelX = x;
        const labelY = Math.max(0, y - textHeight - 2);

        context.fillStyle = "#059669";
        context.fillRect(labelX, labelY, textWidth + 12, textHeight);
        context.fillStyle = "#ffffff";
        context.fillText(label, labelX + 6, labelY + 13);
      }
    };

    draw();

    const observer = new ResizeObserver(() => draw());
    observer.observe(image);

    return () => {
      observer.disconnect();
    };
  }, [detections, naturalSize]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <Image
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        width={1200}
        height={800}
        unoptimized
        className={imageClassName || "w-full h-auto object-contain"}
        onLoad={(event) => {
          setNaturalSize({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          });
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
