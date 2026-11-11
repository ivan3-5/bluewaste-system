import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { CloudinaryService } from "../../src/services/cloudinary.service";
import { ReportAnalysisService } from "../../src/services/report-analysis.service";
import { REPORT_PHOTO_LIMIT_MESSAGE, ReportImageService } from "../../src/services/report-image.service";

vi.mock("../../src/services/cloudinary.service", () => ({
  CloudinaryService: { uploadImage: vi.fn(), deleteImage: vi.fn() },
}));
vi.mock("../../src/services/report-analysis.service", () => ({
  ReportAnalysisService: { analyzeReport: vi.fn().mockResolvedValue(undefined) },
}));

const worker = { id: "worker", role: "FIELD_WORKER" };
const file = { buffer: Buffer.from("photo") } as Express.Multer.File;

beforeEach(() => {
  prismaMock.report.findUnique.mockResolvedValue({ id: "report", reporterId: "citizen", assignedToId: worker.id } as never);
  prismaMock.$transaction.mockImplementation(async (transaction) => {
    if (typeof transaction !== "function") throw new Error("Expected an interactive transaction");
    return transaction(prismaMock);
  });
  vi.mocked(CloudinaryService.uploadImage).mockResolvedValue({ url: "https://example.test/photo", publicId: "photo" });
  vi.mocked(CloudinaryService.deleteImage).mockResolvedValue(undefined);
});

describe("report photos", () => {
  it("accepts a fifth cleanup photo without rerunning waste analysis", async () => {
    prismaMock.reportImage.count.mockResolvedValue(4);
    prismaMock.reportImage.create.mockResolvedValue({ id: "photo" } as never);

    await expect(ReportImageService.addImagesToReport("report", [file], worker, "CLEANUP"))
      .resolves.toEqual([{ id: "photo" }]);

    expect(prismaMock.reportImage.count).toHaveBeenCalledWith({ where: { reportId: "report", type: "CLEANUP" } });
    expect(ReportAnalysisService.analyzeReport).not.toHaveBeenCalled();
  });

  it("counts already attached photos before accepting more", async () => {
    prismaMock.reportImage.count.mockResolvedValue(4);

    await expect(ReportImageService.addImagesToReport("report", [file, file], worker, "CLEANUP"))
      .rejects.toThrow(REPORT_PHOTO_LIMIT_MESSAGE);

    expect(CloudinaryService.uploadImage).not.toHaveBeenCalled();
  });

  it("rechecks the limit under a lock and cleans up when another upload fills the last slot", async () => {
    prismaMock.reportImage.count.mockResolvedValueOnce(4).mockResolvedValueOnce(5);

    await expect(ReportImageService.addImagesToReport("report", [file], worker, "CLEANUP"))
      .rejects.toThrow(REPORT_PHOTO_LIMIT_MESSAGE);

    expect(prismaMock.$queryRaw).toHaveBeenCalled();
    expect(prismaMock.reportImage.create).not.toHaveBeenCalled();
    expect(CloudinaryService.deleteImage).toHaveBeenCalledWith("photo");
  });

  it("starts analysis for the primary report photo", async () => {
    prismaMock.reportImage.count.mockResolvedValue(0);

    await ReportImageService.addImagesToReport("report", [file], { id: "citizen", role: "CITIZEN" });

    expect(ReportAnalysisService.analyzeReport).toHaveBeenCalledWith("report");
  });
});
