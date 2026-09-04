import { NextRequest } from "next/server";
import { z } from "zod";
import { extractTextFromPdf, isPdfBuffer } from "@/lib/pdf";
import { uploadResumeToBlob } from "@/lib/storage";
import { db, candidates } from "@/db";
import { extractCandidateProfile } from "@/features/extraction/candidate/candidateExtractionService";
import { candidatesService } from "@/features/candidates";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import type { ParsedCandidateProfile } from "@/features/candidates/types";

const JsonUploadPayloadSchema = z.object({
  text: z.string().min(1, "Resume text is required and cannot be empty"),
  filename: z.string().optional(),
  appliedJobId: z.string().optional(),
});

const DEGREE_RANKS: Record<string, number> = {
  high_school: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

function extractCandidateProfileColumns(profile: ParsedCandidateProfile) {
  const activeRole = profile.work_history.entries.find((e) => e.is_current) || profile.work_history.entries[0];
  const currentRoleTitle = activeRole?.title || null;
  const currentCompany = activeRole?.employer || null;

  const totalMonths = profile.work_history.entries.reduce((acc, entry) => {
    const start = new Date(entry.start_date).getTime();
    const end = entry.end_date ? new Date(entry.end_date).getTime() : Date.now();
    if (isNaN(start)) return acc;
    const validEnd = isNaN(end) ? Date.now() : end;
    const months = Math.max(1, Math.round((validEnd - start) / (1000 * 60 * 60 * 24 * 30.4375)));
    return acc + months;
  }, 0);
  const totalYearsExperience = totalMonths > 0 ? (Math.round((totalMonths / 12) * 10) / 10).toString() : null;

  let highestDegreeLevel: string | null = null;
  let highestDegreeField: string | null = null;
  let highestRank = 0;

  for (const entry of profile.education.entries) {
    const normLevel = entry.degree_level.normalized;
    const rank = normLevel ? DEGREE_RANKS[normLevel] || 0 : 0;
    if (rank > highestRank) {
      highestRank = rank;
      highestDegreeLevel = normLevel;
      highestDegreeField = entry.field.normalized || entry.field.raw || null;
    }
  }

  const salaryNorm = profile.logistics.salary_expectation.normalized;
  const expectedSalaryMin = salaryNorm?.min != null ? String(salaryNorm.min) : null;
  const expectedSalaryMax = salaryNorm?.max != null ? String(salaryNorm.max) : null;
  const salaryCurrency = salaryNorm?.currency || null;

  const noticeNorm = profile.logistics.notice_period.normalized;
  let noticePeriodDays: number | null = null;
  if (noticeNorm?.value != null && noticeNorm.unit) {
    switch (noticeNorm.unit) {
      case "days":
        noticePeriodDays = noticeNorm.value;
        break;
      case "weeks":
        noticePeriodDays = noticeNorm.value * 7;
        break;
      case "months":
        noticePeriodDays = noticeNorm.value * 30;
        break;
      default:
        noticePeriodDays = noticeNorm.value;
    }
  }

  return {
    currentRoleTitle,
    currentCompany,
    totalYearsExperience,
    highestDegreeLevel,
    highestDegreeField,
    expectedSalaryMin,
    expectedSalaryMax,
    salaryCurrency,
    noticePeriodDays,
  };
}

async function persistCandidateToDatabase(candidateProfile: ParsedCandidateProfile) {
  try {
    const summaryColumns = extractCandidateProfileColumns(candidateProfile);

    await db.insert(candidates).values({
      id: candidateProfile.id,
      appliedJobId: candidateProfile.applied_job_id ?? null,
      name: candidateProfile.identity.name,
      email: candidateProfile.identity.email,
      phone: candidateProfile.identity.phone,
      cnic: candidateProfile.identity.cnic,
      city: candidateProfile.identity.location.normalized?.city ?? null,
      province: candidateProfile.identity.location.normalized?.province ?? null,
      pdfUrl: candidateProfile.source_document.url ?? null,

      currentRoleTitle: summaryColumns.currentRoleTitle,
      currentCompany: summaryColumns.currentCompany,
      totalYearsExperience: summaryColumns.totalYearsExperience,
      highestDegreeLevel: summaryColumns.highestDegreeLevel,
      highestDegreeField: summaryColumns.highestDegreeField,
      expectedSalaryMin: summaryColumns.expectedSalaryMin,
      expectedSalaryMax: summaryColumns.expectedSalaryMax,
      salaryCurrency: summaryColumns.salaryCurrency,
      noticePeriodDays: summaryColumns.noticePeriodDays,

      sourceDocument: candidateProfile.source_document,
      identity: candidateProfile.identity,
      workHistory: candidateProfile.work_history,
      education: candidateProfile.education,
      skillsDemonstrated: candidateProfile.skills_demonstrated,
      skillsDeclared: candidateProfile.skills_declared,
      logistics: candidateProfile.logistics,
      extractionMetadata: candidateProfile.extraction_metadata,
      createdAt: new Date(candidateProfile.created_at),
      updatedAt: new Date(candidateProfile.updated_at),
    }).onConflictDoNothing();
  } catch (dbErr) {
    console.warn("Drizzle database insert warning (skipped):", dbErr instanceof Error ? dbErr.message : String(dbErr));
  }
}

/**
 * POST /api/candidates/upload
 * Supports:
 * 1. multipart/form-data with one or more files in 'file' or 'files' field, optional 'appliedJobId'
 * 2. application/json with { text, filename, appliedJobId }
 * Extracts text from PDF using modular poppler utility, uploads PDF to Vercel Blob Storage,
 * extracts all 7 candidate aspects, and persists the structured profile to Drizzle and in-memory cache.
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
        let blobUrl: string | undefined;
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

          // Upload PDF to Vercel Blob Storage
          try {
            const blobResult = await uploadResumeToBlob(file.name, buffer, {
              contentType: file.type || "application/pdf",
            });
            blobUrl = blobResult.url;
          } catch (blobErr) {
            console.warn("Vercel Blob upload warning:", blobErr instanceof Error ? blobErr.message : String(blobErr));
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
          fileUrl: blobUrl,
          appliedJobId,
        });

        await candidatesService.createCandidate(candidateProfile);
        await persistCandidateToDatabase(candidateProfile);
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
        await persistCandidateToDatabase(candidateProfile);
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
      await persistCandidateToDatabase(candidateProfile);
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
