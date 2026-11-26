/** Analyze each uncached photo in order, allowing failed entries to be retried. */
export async function analyzePendingPhotos<Photo, Result>(
  photos: readonly Photo[],
  cached: ReadonlyMap<Photo, { result?: Result; error?: string }>,
  analyze: (photo: Photo) => Promise<Result>,
  onResult: (photo: Photo, entry: { result?: Result; error?: string }) => void,
  isCancelled: () => boolean,
) {
  for (const photo of photos) {
    if (isCancelled()) return;
    if (cached.has(photo)) continue;
    let entry: { result?: Result; error?: string };
    try {
      entry = { result: await analyze(photo) };
    } catch (error) {
      entry = { error: error instanceof Error ? error.message : "Failed to analyze image." };
    }
    if (isCancelled()) return;
    onResult(photo, entry);
  }
}
