import { describe, expect, it, vi } from "vitest";
import { useUploadReportImages } from "@/hooks/useReports";
import { selectReportPhotos } from "@/lib/report-photos";

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/api", () => ({ default: { post: mocks.post } }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ setQueryData: vi.fn(), invalidateQueries: vi.fn() }),
  useMutation: ({ mutationFn }: { mutationFn: unknown }) => ({ mutateAsync: mutationFn }),
}));

const photo = (name: string) => new File(["photo"], name, { type: "image/jpeg" });

describe("web report photo uploads", () => {
  it("accepts valid photos in order within the available slots", () => {
    const files = [photo("primary.jpg"), new File(["document"], "doc.txt"), photo("second.jpg"), photo("extra.jpg")];

    const { photos, error } = selectReportPhotos(files, 2);

    expect(photos).toEqual([files[0], files[2]]);
    expect(error).toContain("up to 5 photos");
  });

  it("uploads one file per request and records only the successful prefix", async () => {
    const files = [photo("primary.jpg"), photo("second.jpg"), photo("third.jpg")];
    const onUploaded = vi.fn();
    mocks.post.mockResolvedValueOnce({ data: [] }).mockRejectedValueOnce(new Error("Connection lost"));

    await expect(useUploadReportImages().mutateAsync({ reportId: "report", files, type: "REPORT", onUploaded }))
      .rejects.toThrow("Connection lost");

    expect(mocks.post).toHaveBeenCalledTimes(2);
    expect(mocks.post.mock.calls.map(([url, body]: [string, FormData]) => [url, body.getAll("images")])).toEqual([
      ["/reports/report/images", [files[0]]],
      ["/reports/report/images", [files[1]]],
    ]);
    expect(onUploaded).toHaveBeenCalledExactlyOnceWith(files[0]);
  });
});
