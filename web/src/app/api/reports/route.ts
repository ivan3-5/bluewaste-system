import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";

const VALID_CATEGORIES = new Set(["with_waste", "no_waste"]);
const VALID_STATUSES = new Set([
  "PENDING",
  "VERIFIED",
  "CLEANUP_SCHEDULED",
  "IN_PROGRESS",
  "CLEANED",
  "REJECTED",
]);

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category")?.trim();
  const status = searchParams.get("status")?.trim().toUpperCase();

  const where: Record<string, unknown> = {};
  if (category && VALID_CATEGORIES.has(category)) {
    where.category = category;
  }
  if (status && VALID_STATUSES.has(status)) {
    where.status = status;
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return corsResponse(reports);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageUrl = body?.imageUrl?.toString().trim();
    const category = body?.category?.toString().trim();
    const confidence = Number(body?.confidence);
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const locationName = body?.locationName?.toString().trim();
    const description = body?.description?.toString().trim();

    if (!imageUrl || !VALID_CATEGORIES.has(category)) {
      return corsResponse(
        { message: "imageUrl and a valid category are required." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(confidence) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return corsResponse(
        { message: "confidence, latitude, and longitude must be numbers." },
        { status: 400 },
      );
    }

    if (!locationName) {
      return corsResponse(
        { message: "locationName is required." },
        { status: 400 },
      );
    }

    const report = await prisma.report.create({
      data: {
        title: locationName,
        description: description || "",
        category: category as "with_waste" | "no_waste",
        analysisConfidence: confidence,
        latitude,
        longitude,
        address: locationName,
        images: {
          create: {
            imageUrl,
            publicId: imageUrl,
          },
        },
      },
      include: { images: true },
    });

    return corsResponse(report, { status: 201 });
  } catch (error) {
    return corsResponse(
      { message: "Failed to create report." },
      { status: 500 },
    );
  }
}
