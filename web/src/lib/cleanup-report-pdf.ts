import type { jsPDF } from "jspdf";
import { ADMIN_REPORT_STATUS_LABELS } from "./admin-report";
import {
  SCHEDULE_STATUS_LABELS,
  WASTE_CATEGORY_LABELS,
  type ConsolidatedCleanupReport,
} from "../types";

export interface Signatory {
  name: string;
  position: string;
}

export interface CleanupReportData {
  cudNumber: string;
  reportDate: string;
  forName: string;
  forPosition: string;
  dateConducted: string;
  activityType: string;
  location: string;
  male: number;
  female: number;
  wasteType: string;
  wasteKg: string;
  areaCovered: string;
  organization: string;
  focalName: string;
  focalPosition: string;
  remarks: string;
  preparedBy: Signatory[];
  notedBy: Signatory[];
  approvedBy: Signatory[];
  reportedPhotoUrls: string[];
  cleanupPhotoUrls: string[];
}

const PAGE_W = 210;
const MARGIN_X = 20;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const PHOTOS_PER_GROUP = 2;
const BODY_BOTTOM = 262;
const NAVY: [number, number, number] = [31, 56, 100];
const GRAY: [number, number, number] = [110, 110, 110];

export function formatLongDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function loadImage(
  url: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image failed to load"));
      el.src = url;
    });
    // Re-encode as JPEG so any source format (webp, png...) works in jsPDF.
    const scale = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height };
  } catch {
    return null;
  }
}

function drawLetterhead(doc: jsPDF, cud: string) {
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Republic of the Philippines", PAGE_W / 2, 16, { align: "center" });
  doc.text("Province of Davao del Norte", PAGE_W / 2, 20, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CITY OF PANABO", PAGE_W / 2, 25.5, { align: "center" });
  doc.setFontSize(12);
  doc.text("CITY ENVIRONMENT AND NATURAL RESOURCES OFFICE", PAGE_W / 2, 31.5, {
    align: "center",
  });
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, 34, PAGE_W - MARGIN_X, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const prefix = `CUD-${new Date().getFullYear()}-`;
  const lineEnd = PAGE_W - MARGIN_X;
  const prefixW = doc.getTextWidth(prefix);
  const valueW = Math.max(doc.getTextWidth(cud), 26);
  const startX = lineEnd - prefixW - valueW;
  doc.text(prefix, startX, 40);
  if (cud) doc.text(cud, startX + prefixW + 1, 39.6);
  doc.setLineWidth(0.2);
  doc.line(startX + prefixW, 40.6, lineEnd, 40.6);
}

function drawFooter(doc: jsPDF, page: number, total: number) {
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_X, 275, PAGE_W - MARGIN_X, 275);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Page ${page} of ${total}`, PAGE_W / 2, 270, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text("2/F New CityHall Bldg Nat'l Highway,", MARGIN_X, 279);
  doc.text("JP Laurel, Panabo City 8105", MARGIN_X, 282.5);
  doc.text("(084) 822-5113", 95, 279);
  doc.text("(084) 822-7455 / 822-7466", 95, 282.5);
  doc.setTextColor(0, 0, 0);
}

function drawDocumentHeader(
  doc: jsPDF,
  data: Pick<CleanupReportData, "forName" | "forPosition" | "reportDate">,
  subject = "REPORT ON THE CONDUCTED CLEAN-UP DRIVE ACTIVITY",
  introduction = "Please be informed that the undersigned personnel had conducted clean-up drive activity relative to the above mentioned subject and these are the following details, to wit;",
) {
  const labelX = MARGIN_X;
  const colonX = 51;
  const valueX = 58;
  let y = 50;

  const row = (label: string, lines: string[], boldFirst = false) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(label, labelX, y);
    doc.text(":", colonX, y);
    lines.forEach((line, i) => {
      doc.setFont("helvetica", boldFirst && i === 0 ? "bold" : "normal");
      doc.text(line, valueX, y + i * 4.5);
    });
    y += Math.max(1, lines.length) * 4.5 + 5;
  };

  row("FOR", [data.forName, data.forPosition].filter(Boolean), true);
  row("FROM", ["The Undersigned Personnel", "This Office"], true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("SUBJECT", labelX, y);
  doc.text(":", colonX, y);
  doc.text(subject, valueX, y);
  y += 9.5;
  doc.text("DATE", labelX, y);
  doc.text(":", colonX, y);
  doc.text(formatLongDate(data.reportDate), valueX, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y + 1.8, PAGE_W - MARGIN_X, y + 1.8);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const intro = doc.splitTextToSize(introduction, CONTENT_W);
  doc.text(intro, MARGIN_X, y);
  return y + intro.length * 4 + 1.5;
}

function drawDetailsTable(doc: jsPDF, data: CleanupReportData, startY: number) {
  const x0 = MARGIN_X;
  const x1 = PAGE_W - MARGIN_X;
  const pad = 2;
  const rowH = 6.4;
  let y = startY;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.setFontSize(8.5);

  const cell = (
    x: number,
    w: number,
    h: number,
    text: string,
    opts: { bold?: boolean; align?: "left" | "center" } = {},
  ) => {
    doc.rect(x, y, w, h);
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    const textY = y + h / 2 + 1.1;
    if (opts.align === "center") {
      doc.text(text, x + w / 2, textY, { align: "center", maxWidth: w - pad * 2 });
    } else {
      doc.text(text, x + pad, textY, { maxWidth: w - pad * 2 });
    }
  };

  // Row 1: date + activity
  cell(x0, 55, rowH, "Date conducted:", { bold: true });
  cell(x0 + 55, 40, rowH, formatLongDate(data.dateConducted));
  cell(x0 + 95, 37, rowH, "Type of activity:", { bold: true });
  cell(x0 + 132, x1 - x0 - 132, rowH, data.activityType);
  y += rowH;

  // Row 2: location (wraps if long)
  const locLines = doc.splitTextToSize(data.location, x1 - x0 - 55 - pad * 2);
  const locH = Math.max(rowH, locLines.length * 4 + 3);
  doc.rect(x0, y, 55, locH);
  doc.setFont("helvetica", "bold");
  doc.text("Location of the Activity:", x0 + pad, y + locH / 2 + 1.1);
  doc.rect(x0 + 55, y, x1 - x0 - 55, locH);
  doc.setFont("helvetica", "normal");
  doc.text(locLines, x0 + 55 + pad, y + 4.3);
  y += locH;

  // Row 3: participants
  const total = data.male + data.female;
  cell(x0, 55, rowH, "Total No. of Participants:", { bold: true });
  cell(x0 + 55, 22, rowH, String(total), { align: "center" });
  cell(x0 + 77, 18, rowH, "Male:", { bold: true, align: "center" });
  cell(x0 + 95, 22, rowH, String(data.male), { align: "center" });
  cell(x0 + 117, 18, rowH, "Female:", { bold: true, align: "center" });
  cell(x0 + 135, x1 - x0 - 135, rowH, String(data.female), { align: "center" });
  y += rowH;

  // Waste table
  const c1 = 55;
  const c2 = 62;
  const c3 = x1 - x0 - c1 - c2;
  cell(x0, c1, rowH, "Type of Waste", { bold: true, align: "center" });
  cell(x0 + c1, c2, rowH, "Total No. of Waste Collected (Kg)", {
    bold: true,
    align: "center",
  });
  cell(x0 + c1 + c2, c3, rowH, "Total No. of Area Covered", {
    bold: true,
    align: "center",
  });
  y += rowH;
  const kg = data.wasteKg.trim();
  cell(x0, c1, rowH, data.wasteType, { align: "center" });
  cell(x0 + c1, c2, rowH, kg ? `${kg} kg` : "");
  cell(x0 + c1 + c2, c3, rowH, data.areaCovered);
  y += rowH;
  cell(x0, c1, rowH, "Total:", { bold: true, align: "center" });
  cell(x0 + c1, c2, rowH, kg ? `${kg} kg` : "", { bold: true });
  cell(x0 + c1 + c2, c3, rowH, "");
  y += rowH;

  // Organization / focal person
  const half = (x1 - x0) / 2;
  cell(x0, half, rowH, "Name of Organization", { bold: true, align: "center" });
  cell(x0 + half, half, rowH, "Name of Focal Person/ Organizer", {
    bold: true,
    align: "center",
  });
  y += rowH;
  const focalH = data.focalPosition ? 11 : rowH;
  doc.rect(x0, y, half, focalH);
  doc.setFont("helvetica", "normal");
  doc.text(data.organization, x0 + half / 2, y + focalH / 2 + 1.1, {
    align: "center",
    maxWidth: half - pad * 2,
  });
  doc.rect(x0 + half, y, half, focalH);
  doc.setFont("helvetica", "bold");
  doc.text(data.focalName, x0 + half + half / 2, y + (data.focalPosition ? 4.3 : focalH / 2 + 1.1), {
    align: "center",
    maxWidth: half - pad * 2,
  });
  if (data.focalPosition) {
    doc.setFont("helvetica", "normal");
    doc.text(data.focalPosition, x0 + half + half / 2, y + 8.6, {
      align: "center",
      maxWidth: half - pad * 2,
    });
  }
  y += focalH;

  // Remarks
  const remarkLines = doc.splitTextToSize(
    data.remarks || " ",
    x1 - x0 - 22 - pad * 2,
  );
  const remarksH = Math.max(rowH, remarkLines.length * 4 + 3);
  doc.rect(x0, y, 22, remarksH);
  doc.setFont("helvetica", "bold");
  doc.text("Remarks:", x0 + pad, y + 4.3);
  doc.rect(x0 + 22, y, x1 - x0 - 22, remarksH);
  doc.setFont("helvetica", "normal");
  doc.text(remarkLines, x0 + 22 + pad, y + 4.3);
  y += remarksH;

  return y;
}

type LoadedImage = Awaited<ReturnType<typeof loadImage>>;

function drawPhoto(
  doc: jsPDF,
  image: LoadedImage,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
  if (!image) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("Image unavailable", x + w / 2, y + h / 2, { align: "center" });
    doc.setTextColor(0, 0, 0);
    return;
  }
  const ratio = Math.min(w / image.width, h / image.height);
  const dw = image.width * ratio;
  const dh = image.height * ratio;
  doc.addImage(image.dataUrl, "JPEG", x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawPhotoRow(doc: jsPDF, images: LoadedImage[], y: number, h: number) {
  const gap = 8;
  const w = (CONTENT_W - gap) / 2;
  images.forEach((image, i) => drawPhoto(doc, image, MARGIN_X + i * (w + gap), y, w, h));
}

function drawSignatory(doc: jsPDF, s: Signatory, cx: number, y: number, maxWidth: number) {
  if (!s.name && !s.position) return;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(s.name, cx, y, { align: "center", maxWidth });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(s.position, cx, y + 4.5, { align: "center", maxWidth });
}

function drawSignatures(
  doc: jsPDF,
  data: Pick<CleanupReportData, "preparedBy" | "notedBy" | "approvedBy">,
  startY: number,
) {
  const leftCx = MARGIN_X + CONTENT_W * 0.27;
  const rightCx = MARGIN_X + CONTENT_W * 0.73;
  const midCx = PAGE_W / 2;
  const colW = CONTENT_W * 0.46;
  let y = startY;

  const label = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(text, MARGIN_X, y);
    y += 11;
  };

  const group = (list: Signatory[]) => {
    const filled = list.filter((s) => s.name || s.position);
    for (let i = 0; i < filled.length; i += 2) {
      const pair = filled.slice(i, i + 2);
      if (pair.length === 1) {
        drawSignatory(doc, pair[0], midCx, y, CONTENT_W);
      } else {
        drawSignatory(doc, pair[0], leftCx, y, colW);
        drawSignatory(doc, pair[1], rightCx, y, colW);
      }
      y += 14;
    }
  };

  label("Prepared and Submitted by:");
  // Template layout: first two side by side, the third centered below.
  group(data.preparedBy);
  y += 4;
  label("Noted by:");
  group(data.notedBy);
  y += 4;
  label("Approved by:");
  group(data.approvedBy);
}

export async function generateCleanupReportPdf(
  data: CleanupReportData,
  fileName: string,
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({ title: "Report on the Conducted Clean-up Drive Activity" });

  const [reportedPhotos, cleanedPhotos] = await Promise.all(
    [data.reportedPhotoUrls, data.cleanupPhotoUrls].map((urls) =>
      Promise.all(urls.slice(0, PHOTOS_PER_GROUP).map((url) => loadImage(url))),
    ),
  );

  const drawGroup = (
    title: string,
    emptyText: string,
    photos: LoadedImage[],
    titleY: number,
    maxH: number,
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(title, PAGE_W / 2, titleY, { align: "center" });
    if (photos.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAY);
      doc.text(emptyText, PAGE_W / 2, titleY + 8, { align: "center" });
      doc.setTextColor(0, 0, 0);
      return titleY + 14;
    }
    const photoY = titleY + 4;
    const photoH = Math.max(30, Math.min(maxH, BODY_BOTTOM - photoY));
    drawPhotoRow(doc, photos, photoY, photoH);
    return photoY + photoH + 8;
  };

  // Page 1
  drawLetterhead(doc, data.cudNumber);
  const headerEnd = drawDocumentHeader(doc, data);
  const tableEnd = drawDetailsTable(doc, data, headerEnd);
  drawGroup(
    "Reported photos",
    "No reported photos were uploaded for this report.",
    reportedPhotos,
    tableEnd + 10,
    55,
  );
  drawFooter(doc, 1, 2);

  // Page 2
  doc.addPage();
  drawLetterhead(doc, data.cudNumber);
  const y2 = drawGroup(
    "Cleaned photos",
    "No cleanup photos were uploaded for this report.",
    cleanedPhotos,
    50,
    55,
  );
  drawSignatures(doc, data, y2 + 4);
  drawFooter(doc, 2, 2);

  doc.save(fileName);
}

export async function generateConsolidatedCleanupReportPdf(
  report: ConsolidatedCleanupReport,
  fileName: string,
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const title = "Combined Clean-up Drive Report";
  const continuationTop = 47;
  const headingHeight = 9;
  doc.setProperties({ title });
  drawLetterhead(doc, "");
  let y = drawDocumentHeader(
    doc,
    { forName: "CGDH, CENRO", forPosition: "", reportDate: report.generatedAt },
    title.toUpperCase(),
    "The following is a summary of the clean-up activity and the waste reports linked to this schedule.",
  );

  const nextPage = () => {
    doc.addPage();
    drawLetterhead(doc, "");
    y = continuationTop;
  };

  const ensureSpace = (height: number) => {
    if (y + height > BODY_BOTTOM) nextPage();
  };

  const heading = (label: string, nextHeight: number) => {
    ensureSpace(headingHeight + nextHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, MARGIN_X, y + 4);
    y += headingHeight;
  };

  const table = (rows: [string, string][], headings: string[] = []) => {
    const labelWidth = 55;
    const valueWidth = CONTENT_W - labelWidth;
    const lineHeight = 4;
    const padding = 2;
    const minimumRowHeight = lineHeight + padding * 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const wrappedRows = rows.map(([label, value]) => ({
      label,
      lines: doc.splitTextToSize(value || "-", valueWidth - padding * 2) as string[],
    }));
    if (headings.length) {
      const tableHeight = wrappedRows.reduce(
        (height, { lines }) => height + lines.length * lineHeight + padding * 2,
        0,
      );
      const headingsHeight = headings.length * headingHeight;
      const sectionHeight = headingsHeight + tableHeight;
      ensureSpace(
        sectionHeight <= BODY_BOTTOM - continuationTop
          ? sectionHeight
          : headingsHeight + minimumRowHeight,
      );
      headings.forEach((label) => heading(label, minimumRowHeight));
    }
    for (const { label, lines } of wrappedRows) {
      let start = 0;
      while (start < lines.length) {
        ensureSpace(minimumRowHeight);
        const count = Math.min(
          lines.length - start,
          Math.floor((BODY_BOTTOM - y - padding * 2) / lineHeight),
        );
        const height = count * lineHeight + padding * 2;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.25);
        doc.rect(MARGIN_X, y, labelWidth, height);
        doc.rect(MARGIN_X + labelWidth, y, valueWidth, height);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.text(start === 0 ? label : `${label} (continued)`, MARGIN_X + padding, y + 4.5);
        doc.setFont("helvetica", "normal");
        lines.slice(start, start + count).forEach((line, index) => {
          doc.text(line, MARGIN_X + labelWidth + padding, y + 4.5 + index * lineHeight);
        });
        y += height;
        start += count;
      }
    }
  };

  const { summary, completionInfo } = report;
  const notes = completionInfo?.notes || report.notes;
  table([
    ["Activity", report.scheduleTitle],
    ["Schedule ID", report.scheduleId],
    ["Scheduled date", formatLongDate(report.scheduledAt)],
    ["Location of the activity", report.barangay],
    ["Status", SCHEDULE_STATUS_LABELS[report.overallStatus]],
    ["Linked reports", String(summary.totalReports)],
    ["Reporting citizens", String(summary.totalCitizens)],
    ["Locations cleaned", `${summary.cleanedReportsCount} of ${summary.totalReports}`],
    ["Assigned field workers", report.assignedWorkers.map((worker) => {
      const contact = worker.phone || worker.email;
      return `${worker.firstName} ${worker.lastName}${contact ? ` (${contact})` : ""}`;
    }).join("\n") || "None"],
    ["Equipment", report.equipment.join(", ") || "Standard cleanup safety equipment"],
  ]);

  if (completionInfo?.verifiedAt || completionInfo?.verifiedBy || notes) {
    y += 6;
    table([
      ["Verified by", completionInfo?.verifiedBy?.name || ""],
      ["Verification date", formatLongDate(completionInfo?.verifiedAt)],
      ["Remarks", notes || ""],
    ], ["Completion and verification"]);
  }

  y += 6;
  const linkedReportsHeading = `Linked waste reports (${report.groupedReports.length})`;
  if (!report.groupedReports.length) {
    table([["Reports", "No linked waste reports"]], [linkedReportsHeading]);
  }
  for (const [index, item] of report.groupedReports.entries()) {
    const reportHeading = `Report ${index + 1}`;
    table([
      ["Title", item.title],
      ["Report ID", item.id],
      ["Location", `${item.address || report.barangay || "Panabo City"}\n(${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)})`],
      ["Reporter", item.isAnonymous ? "Anonymous Citizen" : item.reporter?.name || "Citizen"],
      ["Waste category", WASTE_CATEGORY_LABELS[item.category] || item.category],
      ["Severity", item.severity || ""],
      ["Estimated quantity", item.wasteQuantity == null ? "" : `${item.wasteQuantity} items`],
      ["Status", ADMIN_REPORT_STATUS_LABELS[item.status]],
    ], index === 0 ? [linkedReportsHeading, reportHeading] : [reportHeading]);
    y += 6;
  }

  nextPage();
  const photoHeight = 55;
  const photoRows = report.groupedReports.flatMap((item, index) => {
    const groups = [
      { label: "Reported photos", urls: item.photoUrls },
      { label: "Cleaned photos", urls: item.cleanupPhotoUrls },
    ];
    return groups.flatMap(({ label, urls }) =>
      Array.from({ length: Math.ceil(urls.length / PHOTOS_PER_GROUP) }, (_, row) => {
        const offset = row * PHOTOS_PER_GROUP;
        return {
          label: `Report ${index + 1} - ${label}${row > 0 ? " (continued)" : ""}`,
          urls: urls.slice(offset, offset + PHOTOS_PER_GROUP),
        };
      }),
    );
  });
  heading("Photo documentation", photoRows.length ? headingHeight + photoHeight : 8);
  const signatureHeight = 85;
  for (const [index, row] of photoRows.entries()) {
    const photos = await Promise.all(row.urls.map(loadImage));
    const signatureSpace = index === photoRows.length - 1 ? signatureHeight + 14 : 0;
    heading(row.label, photoHeight + signatureSpace);
    drawPhotoRow(doc, photos, y, photoHeight);
    y += photoHeight + 6;
  }
  if (!photoRows.length) table([["Photos", "No reported or cleanup photos were uploaded."]]);

  y += 8;
  ensureSpace(signatureHeight);
  drawSignatures(doc, {
    preparedBy: [{ name: "City ENRO Field Coordination Unit", position: "" }],
    notedBy: [{ name: "____________________________", position: "" }],
    approvedBy: [{ name: "CGDH, City ENRO Panabo", position: "" }],
  }, y);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawFooter(doc, page, totalPages);
  }
  doc.save(fileName);
}
