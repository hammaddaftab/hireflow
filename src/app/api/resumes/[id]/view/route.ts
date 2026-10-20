export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { uploadsService } from "@/services/uploadsService";
import { isBlobStorageConfigured, getLocalResumePath } from "@/lib/storage";
import { promises as fs } from "node:fs";

// GET /api/resumes/[id]/view
// When Vercel Blob is configured, redirects (302) to Vercel Blob CDN.
// When Vercel Blob is not configured, explicitly streams the local file from .uploads/resumes.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await uploadsService.getById(id);

    if (!record) {
      return new NextResponse("Resume document not found", { status: 404 });
    }

    // Explicit Vercel Blob handling: redirect to CDN URL
    if (isBlobStorageConfigured()) {
      if (!record.blobUrl || !record.blobUrl.startsWith("http")) {
        return new NextResponse("Document Blob URL not found", { status: 404 });
      }
      return NextResponse.redirect(record.blobUrl, 302);
    }

    // Explicit local mode: read directly from .uploads/resumes
    const localFilePath = getLocalResumePath(record.pathname || record.filename);
    const fileBuffer = await fs.readFile(localFilePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": record.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${record.filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to load document preview", { status: 404 });
  }
}
