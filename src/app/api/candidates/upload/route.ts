import { NextRequest } from "next/server";
import { z } from "zod";
import { extractTextFromPdf, isPdfBuffer } from "@/lib/pdf";
import { extractCandidateProfile } from "@/features/extraction/candidate/candidateExtractionService";
import { candidatesService } from "@/features/candidates";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import type { ParsedCandidateProfile } from "@/features/candidates/types";

const JsonUploadPayloadSchema = z.object({
  text: z.string().min(1, "Resume text is required and cannot be empty"),
  filename: z.string().optional(),
  appliedJobId: z.string().optional(),
});

/**
 * POST /api/candidates/upload
 * Supports:
 * 1. multipart/form-data with one or more files in 'file' or 'files' field, optional 'appliedJobId'
 * 2. application/json with { text, filename, appliedJobId }
 * Extracts text from PDF using modular poppler utility, extracts all 7 candidate aspects,
 * and persists the structured profile to candidates storage.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const savedCandidates: ParsedCandidateProfile[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files: File[] = [];

      // Collect files from "file" and "files" form entries
      const fileEntries = [...formData.getAll("file"), ...formData.getAll("files")];
      for (const entry of fileEntries) {
        if (entry instanceof File && entry.size > 0) {
          files.push(entry);
        }
      }

      const appliedJobId = (formData.get("appliedJobId") as string) || undefined;
      const rawFormText = formData.get("text") as string | null;

      if (files.length === 0 && (!rawFormText || !rawFormText.trim())) {
        throw ApiError.badRequest(
          "No resume file or text found in upload payload",
          [{ name: "file", reason: "Expected at least one non-empty file or text field in form data" }],
          "/api/candidates/upload"
        );
      }

      // Process uploaded files
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let extractedText = "";
        const isPdf = file.type === "application/pdf" || isPdfBuffer(buffer) || file.name.toLowerCase().endsWith(".pdf");
        const isText = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt") || file.name.toLowerCase().endsWith(".md");

        if (isPdf) {
          try {
            extractedText = await extractTextFromPdf(buffer);
          } catch (pdfErr) {
            const message = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
            throw ApiError.badRequest(
              `Failed to parse PDF document '${file.name}'`,
              [{ name: file.name, reason: message }],
              "/api/candidates/upload"
            );
          }
        } else if (isText) {
          extractedText = buffer.toString("utf-8");
        } else {
          throw ApiError.badRequest(
            `Unsupported file format for '${file.name}'. Only PDF and plain text (.txt) files are supported.`,
            [{ name: file.name, reason: "Unsupported MIME type or file extension" }],
            "/api/candidates/upload"
          );
        }

        if (!extractedText.trim()) {
          throw ApiError.badRequest(
            `Unable to extract readable text from '${file.name}'`,
            [{ name: file.name, reason: "Extracted document content is empty or contains no readable text layer" }],
            "/api/candidates/upload"
          );
        }

        const candidateProfile = await extractCandidateProfile(extractedText, {
          filename: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || (isPdf ? "application/pdf" : "text/plain"),
          appliedJobId,
        });

        await candidatesService.createCandidate(candidateProfile);
        savedCandidates.push(candidateProfile);
      }

      // Process raw text field if passed in multipart form data without files
      if (files.length === 0 && rawFormText && rawFormText.trim()) {
        const candidateProfile = await extractCandidateProfile(rawFormText.trim(), {
          filename: (formData.get("filename") as string) || "pasted_resume.txt",
          mimeType: "text/plain",
          appliedJobId,
        });

        await candidatesService.createCandidate(candidateProfile);
        savedCandidates.push(candidateProfile);
      }
    } else if (contentType.includes("application/json")) {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/candidates/upload");
      }

      const validation = JsonUploadPayloadSchema.safeParse(body);
      if (!validation.success) {
        const invalidParams = validation.error.errors.map((err) => ({
          name: err.path.join("."),
          reason: err.message,
        }));
        throw ApiError.badRequest(
          "Invalid candidate upload JSON payload",
          invalidParams,
          "/api/candidates/upload"
        );
      }

      const { text, filename, appliedJobId } = validation.data;
      const candidateProfile = await extractCandidateProfile(text, {
        filename: filename || "pasted_resume.txt",
        mimeType: "text/plain",
        appliedJobId,
      });

      await candidatesService.createCandidate(candidateProfile);
      savedCandidates.push(candidateProfile);
    } else {
      throw ApiError.badRequest(
        "Unsupported Content-Type. Please use multipart/form-data or application/json",
        [{ name: "content-type", reason: `Received unsupported Content-Type: ${contentType}` }],
        "/api/candidates/upload"
      );
    }

    return createSuccessResponse(
      {
        candidate: savedCandidates[0],
        candidates: savedCandidates,
        total: savedCandidates.length,
      },
      201
    );
  } catch (error) {
    return createErrorResponse(error, "/api/candidates/upload");
  }
}
