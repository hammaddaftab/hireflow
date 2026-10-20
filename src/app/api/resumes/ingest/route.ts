export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;

import { NextRequest } from "next/server";
import { z } from "zod";
import { getResumeFileBuffer } from "@/lib/storage";
import { uploadsService } from "@/services/uploadsService";
import { jobService } from "@/features/jobs";
import { candidatesService } from "@/services/candidatesService";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import { extractCandidateProfile } from "@/lib/extraction";
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

    // Explicit storage retrieval: Vercel Blob when configured, else local storage (.uploads/resumes)
    let fileBuffer: Buffer;
    try {
      fileBuffer = await getResumeFileBuffer(uploadRecord);
    } catch (storageErr) {
      const reason = storageErr instanceof Error ? storageErr.message : String(storageErr);
      throw ApiError.badRequest(
        `Unable to retrieve resume document '${uploadRecord.filename}': ${reason}`,
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

    // Mark status as extracting
    await uploadsService.updateStatus(uploadId, "extracting", null);

    // Extract structured candidate profile across all 7 aspects
    let candidateProfile: ParsedCandidateProfile;
    try {
      candidateProfile = await extractCandidateProfile(extractedText, {
        filename: uploadRecord.filename,
        fileSizeBytes: uploadRecord.size,
        mimeType: uploadRecord.contentType || "application/pdf",
        fileUrl: uploadRecord.blobUrl,
        appliedJobId: jobId,
        timeoutMs: 60000,
        createdAt: uploadRecord.uploadedAt,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      await uploadsService.updateStatus(uploadId, "failed", reason);
      throw ApiError.badRequest(
        `AI extraction failed for '${uploadRecord.filename}': ${reason}`,
        undefined,
        "/api/resumes/ingest"
      );
    }

    // Preserve the original upload timestamp so queue ordering is identical across re-extractions
    if (uploadRecord.uploadedAt) {
      candidateProfile.created_at = uploadRecord.uploadedAt;
    }

    // Persist to PostgreSQL database
    await candidatesService.createCandidate(candidateProfile);

    // Update upload record with target job ID and candidate ID
    await uploadsService.updateJobId(uploadId, jobId);
    await uploadsService.updateCandidateId(uploadId, candidateProfile.id);

    // Clean up old candidate if re-ingesting an existing candidate record
    // Only delete AFTER candidateId on upload record is updated to prevent cascade deletion of upload
    if (uploadRecord.candidateId && uploadRecord.candidateId !== candidateProfile.id) {
      try {
        await candidatesService.deleteCandidate(uploadRecord.candidateId);
      } catch {
        // Continue if old record already absent
      }
    }

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
