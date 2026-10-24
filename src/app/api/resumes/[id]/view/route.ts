export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { uploadsService } from "@/services/uploadsService";
import { isBlobStorageConfigured, getLocalResumePath } from "@/lib/storage";
import { promises as fs } from "node:fs";
import path from "node:path";

// GET /api/resumes/[id]/view
// Redirects to Vercel Blob CDN when the upload record holds an external HTTP(S) Blob URL.
// Otherwise streams the PDF directly from local .uploads/resumes or the benchmark CVs directory.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await uploadsService.getById(id);

    // Redirect to Vercel Blob CDN only when the record actually has an external http(s) Blob URL
    if (record && isBlobStorageConfigured() && record.blobUrl && record.blobUrl.startsWith("http")) {
      return NextResponse.redirect(record.blobUrl, 302);
    }

    // Resolve filename from DB record or from deterministic upl_<cvId> naming
    const inferredFilename = id.startsWith("upl_") ? `${id.slice(4)}.pdf` : `${id}.pdf`;
    const targetName = record?.pathname || record?.filename || inferredFilename;
    const baseFilename = path.basename(targetName);

    const candidatePaths = [
      getLocalResumePath(targetName),
      path.join(process.cwd(), "docs", "research", "top-candidates", "bench", "cvs", baseFilename),
    ];

    let fileBuffer: Buffer | null = null;
    for (const filePath of candidatePaths) {
      try {
        fileBuffer = await fs.readFile(filePath);
        break;
      } catch {
        // Try next path
      }
    }

    if (!fileBuffer) {
      return new NextResponse("Resume document not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": record?.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${record?.filename || baseFilename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to load document preview", { status: 404 });
  }
}
