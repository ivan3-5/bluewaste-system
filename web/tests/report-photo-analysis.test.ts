import { describe, expect, it, vi } from "vitest";
import { analyzePendingPhotos } from "@/lib/report-photo-analysis";

for (const provider of ["gemini", "yolo"]) {
  describe(`${provider} multi-photo analysis`, () => {
    const photos = [1, 2, 3, 4, 5].map((id) => new File([String(id)], `${id}.jpg`));
    it("analyzes every photo, including spam in later positions", async () => {
      const analyze = vi.fn(async (photo: File) => ({ provider, hasWaste: photo !== photos[4] }));
      const results = new Map();
      await analyzePendingPhotos(photos, results, analyze, (photo, entry) => results.set(photo, entry), () => false);
      expect(analyze.mock.calls.map(([photo]) => photo)).toEqual(photos);
      expect(results.get(photos[4]).result).toEqual({ provider, hasWaste: false });
    });
    it("continues after failures, retries only the failed photo, and preserves results after removal", async () => {
      const analyze = vi.fn(async (photo: File) => {
        if (photo === photos[1]) throw new Error("Try again");
        return { provider, hasWaste: true };
      });
      const results = new Map();
      const save = (photo: File, entry: unknown) => results.set(photo, entry);
      await analyzePendingPhotos(photos, results, analyze, save, () => false);
      expect(results.get(photos[1]).error).toBe("Try again");
      expect(results.get(photos[4]).result.hasWaste).toBe(true);
      results.delete(photos[1]);
      const retry = vi.fn(async () => ({ provider, hasWaste: true }));
      await analyzePendingPhotos(photos.slice(1), results, retry, save, () => false);
      expect(retry).toHaveBeenCalledExactlyOnceWith(photos[1]);
    });
    it("ignores in-flight responses after selection is cancelled", async () => {
      let cancelled = false;
      const save = vi.fn();
      const analyze = vi.fn(async () => { cancelled = true; return { provider }; });
      await analyzePendingPhotos(photos, new Map(), analyze, save, () => cancelled);
      expect(save).not.toHaveBeenCalled();
      expect(analyze).toHaveBeenCalledTimes(1);
    });
  });
}
