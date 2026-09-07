export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { uploadsService } from "@/services/uploadsService";
import { promises as fs } from "fs";
import path from "path";

// GET /api/resumes/[id]/view
// Streams the document directly or redirects to Vercel Blob CDN URL for inline browser preview
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

    // Direct binding: if stored in Vercel Blob, redirect immediately to CDN URL
    if (record.blobUrl && record.blobUrl.startsWith("http")) {
      return NextResponse.redirect(record.blobUrl, 302);
    }

    // Local resolution for development / mock files
    const cwd = process.cwd();
    const candidatePaths = [
      path.join(cwd, ".uploads", "resumes", path.basename(record.pathname)),
      path.join(cwd, record.filename),
      record.filename === "mock_resume_a.pdf" ? path.join(cwd, "mock_resume_a.pdf") : null,
      record.filename === "mock_resume_b.pdf" ? path.join(cwd, "mock_resume_b.pdf") : null,
      path.join(cwd, "public", "resumes", record.filename),
    ].filter(Boolean) as string[];

    let fileBuffer: Buffer | null = null;

    for (const filePath of candidatePaths) {
      try {
        fileBuffer = await fs.readFile(filePath);
        break;
      } catch {
        // Try next candidate path
      }
    }

    if (!fileBuffer) {
      return new NextResponse("Document content not available on local storage", { status: 404 });
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": record.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${record.filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to load document preview", { status: 500 });
  }
}
