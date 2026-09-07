export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { z } from "zod";
import path from "node:path";
import { promises as fs } from "node:fs";
import { uploadsService } from "@/services/uploadsService";
import { jobService } from "@/features/jobs";
import { candidatesService } from "@/features/candidates";
import { extractCandidateProfile } from "@/features/extraction";
import { extractTextFromPdf } from "@/lib/pdf";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

const IngestPayloadSchema = z.object({
  uploadId: z.string().min(1, "uploadId is required"),
  jobId: z.string().min(1, "jobId is required"),
});

// POST /api/resumes/ingest
// Reads uploaded resume file, executes multi-aspect candidate extraction, persists to DB, and links to target job
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/resumes/ingest");
    }

    const validation = IngestPayloadSchema.safeParse(body);
    if (!validation.success) {
      const invalidParams = validation.error.errors.map((err) => ({
        name: err.path.join("."),
        reason: err.message,
      }));
      throw ApiError.badRequest("Invalid ingest payload", invalidParams, "/api/resumes/ingest");
    }

    const { uploadId, jobId } = validation.data;

    // Verify job exists
    const targetJob = await jobService.getJobById(jobId);
    if (!targetJob) {
      throw ApiError.notFound(`Target job '${jobId}' not found`, "/api/resumes/ingest");
    }

    // Verify upload record exists
    const uploadRecord = await uploadsService.getById(uploadId);
    if (!uploadRecord) {
      throw ApiError.notFound(`Upload record '${uploadId}' not found`, "/api/resumes/ingest");
    }

    // Load file buffer from Vercel Blob URL or local filesystem
    let fileBuffer: Buffer | null = null;

    if (uploadRecord.blobUrl && uploadRecord.blobUrl.startsWith("http")) {
      try {
        const response = await fetch(uploadRecord.blobUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        }
      } catch {
        // Fallback to local disk lookup if network fetch fails
      }
    }

    if (!fileBuffer) {
      const cwd = process.cwd();
      const candidatePaths = [
        uploadRecord.pathname ? path.join(cwd, uploadRecord.pathname) : null,
        path.join(cwd, ".uploads", "resumes", path.basename(uploadRecord.pathname)),
        path.join(cwd, uploadRecord.filename),
        uploadRecord.filename === "mock_resume_a.pdf" ? path.join(cwd, "mock_resume_a.pdf") : null,
        uploadRecord.filename === "mock_resume_b.pdf" ? path.join(cwd, "mock_resume_b.pdf") : null,
        path.join(cwd, "public", "resumes", uploadRecord.filename),
      ].filter(Boolean) as string[];

      for (const filePath of candidatePaths) {
        try {
          fileBuffer = await fs.readFile(filePath);
          break;
        } catch {
          // Check next candidate path
        }
      }
    }

    if (!fileBuffer) {
      throw ApiError.badRequest(
        `Unable to locate document content for '${uploadRecord.filename}'`,
        undefined,
        "/api/resumes/ingest"
      );
    }

    // Extract text from PDF buffer
    let extractedText = "";
    try {
      extractedText = await extractTextFromPdf(fileBuffer);
    } catch (pdfErr) {
      const reason = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
      throw ApiError.badRequest(`Failed to parse PDF document text: ${reason}`, undefined, "/api/resumes/ingest");
    }

    if (!extractedText.trim()) {
      throw ApiError.badRequest(
        `No readable text extracted from document '${uploadRecord.filename}'`,
        undefined,
        "/api/resumes/ingest"
      );
    }

    // Extract structured candidate profile across all 7 aspects
    const candidateProfile = await extractCandidateProfile(extractedText, {
      filename: uploadRecord.filename,
      fileSizeBytes: uploadRecord.size,
      mimeType: uploadRecord.contentType || "application/pdf",
      fileUrl: uploadRecord.blobUrl,
      appliedJobId: jobId,
    });

    // Persist to PostgreSQL database
    await candidatesService.createCandidate(candidateProfile);

    // Update upload record with target job ID
    await uploadsService.updateJobId(uploadId, jobId);

    return createSuccessResponse(
      {
        candidate: candidateProfile,
        uploadId,
        jobId,
      },
      201
    );
  } catch (error) {
    return createErrorResponse(error, "/api/resumes/ingest");
  }
}
