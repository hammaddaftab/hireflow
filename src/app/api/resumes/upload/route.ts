export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { ingestResumeFiles } from "@/lib/upload";
import { uploadsService } from "@/services/uploadsService";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

// POST /api/resumes/upload
// Thin HTTP transport controller: parses multipart payload and delegates to lib/upload pipeline
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw ApiError.badRequest(
        "Invalid Content-Type. Please use multipart/form-data",
        [{ name: "content-type", reason: `Received unsupported Content-Type: ${contentType}` }],
        "/api/resumes/upload"
      );
    }

    const formData = await request.formData();
    const jobId = (formData.get("jobId") as string) || (formData.get("appliedJobId") as string) || null;

    // Collect all valid files
    const fileEntries = [...formData.getAll("file"), ...formData.getAll("files")];
    const files: File[] = [];

    for (const entry of fileEntries) {
      if (entry instanceof File && entry.size > 0) {
        files.push(entry);
      }
    }

    if (files.length === 0) {
      throw ApiError.badRequest(
        "No resume files detected in upload request",
        [{ name: "file", reason: "Provide at least one non-empty resume document in 'file' or 'files' field" }],
        "/api/resumes/upload"
      );
    }

    // Delegate to pure ingestion utility
    const uploadedItems = await ingestResumeFiles(files, jobId);

    // Register into shared domain uploads service
    uploadsService.addBatch(uploadedItems);

    return createSuccessResponse(
      {
        uploads: uploadedItems,
        count: uploadedItems.length,
      },
      201
    );
  } catch (error) {
    return createErrorResponse(error, "/api/resumes/upload");
  }
}

// GET /api/resumes/upload
// Thin controller returning Vercel Blob configuration and registry contents
export async function GET() {
  const isConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const uploads = uploadsService.getAll();
  const stats = uploadsService.getStats();

  return createSuccessResponse({
    storage: "vercel-blob",
    isConfigured,
    mode: isConfigured ? "live" : "local-fallback",
    status: "ready",
    uploads,
    stats,
  });
}

// DELETE /api/resumes/upload
// Thin controller delegating record deletion or clearing to uploadsService
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const deleted = uploadsService.delete(id);
      if (!deleted) {
        throw ApiError.notFound(`Upload with ID '${id}' not found`, "/api/resumes/upload");
      }
      return createSuccessResponse({ deleted: true, id });
    }

    uploadsService.clear();
    return createSuccessResponse({ cleared: true });
  } catch (error) {
    return createErrorResponse(error, "/api/resumes/upload");
  }
}
