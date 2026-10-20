export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;


import { NextRequest } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { extractTextFromPdf, extractPdfHyperlinks, isPdfBuffer } from "@/lib/pdf";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

// POST /api/evals/pdf-extract
// Extracts raw text from an uploaded PDF buffer or sample document without persistence
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer;
    let filename = "document.pdf";
    const startTime = Date.now();

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File) || file.size === 0) {
        throw ApiError.badRequest(
          "No PDF file uploaded",
          [{ name: "file", reason: "Expected a non-empty file in 'file' form data field" }],
          "/api/evals/pdf-extract"
        );
      }

      filename = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw ApiError.badRequest("Invalid JSON or multipart request", undefined, "/api/evals/pdf-extract");
      }

      const sampleName = (body as { sample?: string })?.sample;
      if (!sampleName) {
        throw ApiError.badRequest("Must provide either a PDF file via multipart/form-data or 'sample' filename", undefined, "/api/evals/pdf-extract");
      }

      const allowedSamples: Record<string, string> = {
        "mock_resume_a.pdf": "mock_resume_a.pdf",
        "mock_resume_b.pdf": "mock_resume_b.pdf",
      };

      const resolvedSample = allowedSamples[sampleName];
      if (!resolvedSample) {
        throw ApiError.badRequest(`Unknown sample '${sampleName}'`, undefined, "/api/evals/pdf-extract");
      }

      const filePath = resolve(process.cwd(), resolvedSample);
      if (!existsSync(filePath)) {
        throw ApiError.notFound(`Sample file not found at ${resolvedSample}`);
      }

      filename = resolvedSample;
      buffer = readFileSync(filePath);
    }

    if (!isPdfBuffer(buffer)) {
      throw ApiError.badRequest(
        "Invalid file signature: file does not contain a valid %PDF- header",
        undefined,
        "/api/evals/pdf-extract"
      );
    }

    const text = await extractTextFromPdf(buffer, { layout: true });
    const detectedLinks = extractPdfHyperlinks(buffer);
    const durationMs = Date.now() - startTime;

    const characterCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const lineCount = text ? text.split("\n").length : 0;

    return createSuccessResponse({
      text,
      filename,
      fileSizeBytes: buffer.length,
      durationMs,
      characterCount,
      wordCount,
      lineCount,
      linksCount: detectedLinks.length,
      links: detectedLinks,
    });
  } catch (error) {
    return createErrorResponse(error, "/api/evals/pdf-extract");
  }
}
