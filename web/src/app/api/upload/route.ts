import { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { corsEmptyResponse, corsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return corsEmptyResponse();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") || formData.get("file");

    if (!(file instanceof File)) {
      return corsResponse(
        { message: "Image file is required." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer);

    return corsResponse({ imageUrl: uploaded.secureUrl });
  } catch (error) {
    return corsResponse(
      { message: "Failed to upload image." },
      { status: 500 },
    );
  }
}
