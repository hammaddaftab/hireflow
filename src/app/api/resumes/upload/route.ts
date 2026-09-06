export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { uploadResumeToBlob } from "@/lib/storage";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import type { DroppedResumeItem } from "@/features/review/types";
import { uploadsService } from "@/features/uploads/uploadsService";

// Maximum allowable file size: 25 MB
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

// Permitted resume extensions
const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".docx", ".doc", ".md"];

// Check if file has an allowed resume extension
function isValidResumeFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

// POST /api/resumes/upload
// Receives multipart/form-data containing candidate resumes, persists each to Vercel Blob,
// registers them in the uploads service, and returns structured descriptors for Step 2 extraction.
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

    // Collect all files from "file" and "files" entries
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

    const uploadedItems: DroppedResumeItem[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw ApiError.badRequest(
          `File '${file.name}' exceeds the maximum allowed size of 25 MB`,
          [{ name: file.name, reason: `Size is ${Math.round(file.size / (1024 * 1024))} MB` }],
          "/api/resumes/upload"
        );
      }

      // Validate file extension
      if (!isValidResumeFile(file)) {
        throw ApiError.badRequest(
          `Unsupported file format for '${file.name}'. Allowed formats: PDF, DOCX, TXT`,
          [{ name: file.name, reason: "Unsupported file extension" }],
          "/api/resumes/upload"
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Compute SHA-256 digest for document provenance and deduplication caching
      const hash = createHash("sha256").update(buffer).digest("hex");

      // Persist resume document directly to Vercel Blob Storage
      const blobResult = await uploadResumeToBlob(file.name, buffer, {
        contentType: file.type || "application/pdf",
      });

      const item: DroppedResumeItem = {
        id: `upl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        filename: file.name,
        size: blobResult.size,
        contentType: blobResult.contentType,
        status: "stored",
        progress: 100,
        blobUrl: blobResult.url,
        pathname: blobResult.pathname,
        hash,
        jobId,
        uploadedAt: new Date().toISOString(),
      };

      uploadedItems.push(item);
    }

    // Persist records into uploads service registry
    uploadsService.addBatch(
      uploadedItems.map((item) => ({
        id: item.id,
        filename: item.filename,
        size: item.size,
        contentType: item.contentType,
        status: "stored" as const,
        blobUrl: item.blobUrl || "",
        pathname: item.pathname || "",
        hash: item.hash || "",
        jobId: item.jobId || null,
        uploadedAt: item.uploadedAt || new Date().toISOString(),
      }))
    );

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
// Returns Vercel Blob storage configuration, recent upload items, and aggregate stats
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
// Removes an uploaded resume record by ID or clears the upload registry
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

    // If no id provided, clear all
    uploadsService.clear();
    return createSuccessResponse({ cleared: true });
  } catch (error) {
    return createErrorResponse(error, "/api/resumes/upload");
  }
}
