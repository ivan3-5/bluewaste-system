"use client";

import { useEffect, useRef, useState } from "react";
import { analyzePendingPhotos } from "@/lib/report-photo-analysis";

export function useReportPhotoAnalysis<Photo, Result>(
  photos: readonly Photo[],
  enabled: boolean,
  analyze: (photo: Photo) => Promise<Result>,
) {
  const [{ entries, completedJob }, setAnalysis] = useState({
    entries: new Map<Photo, { result?: Result; error?: string }>(),
    completedJob: null as symbol | null,
  });
  const selected = useRef<readonly Photo[] | null>(null);
  const activeJob = useRef<symbol | null>(null);

  useEffect(() => () => { selected.current = null; }, []);

  useEffect(() => {
    selected.current = enabled ? photos : [];
    // Wait for React to commit the previous result before selecting the next photo.
    if (activeJob.current && activeJob.current !== completedJob) return;
    activeJob.current = null;
    if (!enabled) return;

    const next = photos.find((photo) => !entries.has(photo));
    if (next === undefined) return;

    const job = Symbol();
    activeJob.current = job;
    void analyzePendingPhotos([next], entries, analyze, (photo, entry) => {
      if (selected.current === null) return;
      const keepResult = selected.current.includes(photo);
      setAnalysis((current) => ({
        entries: keepResult ? new Map(current.entries).set(photo, entry) : current.entries,
        completedJob: job,
      }));
    }, () => false);
  }, [analyze, completedJob, enabled, entries, photos]);

  function retryPhoto(photo: Photo) {
    setAnalysis((current) => {
      const updated = new Map(current.entries);
      updated.delete(photo);
      return { ...current, entries: updated };
    });
  }

  function clearPhotoAnalysis() {
    setAnalysis((current) => ({ ...current, entries: new Map() }));
  }

  return { photoAnalysis: entries, retryPhoto, clearPhotoAnalysis };
}
