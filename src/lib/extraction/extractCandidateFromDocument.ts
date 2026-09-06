// Universal, source-agnostic document extraction utility
// Decoupled from HTTP, Next.js requests, or UI views.
// Accepts document buffers or raw text from manual uploads, triage drops, or Gmail attachments.

import { extractTextFromPdf, isPdfBuffer } from "@/lib/pdf";
import { extractCandidateProfile } from "@/features/extraction";
import type { ParsedCandidateProfile } from "@/entities/candidate";

export interface IngestionDocumentInput {
  buffer?: Buffer;
  text?: string;
  filename: string;
  mimeType?: string;
  sourceUrl?: string; // Vercel Blob URL, Gmail attachment link, or local path
  sourceChannel?: "upload_drop" | "upload_page" | "gmail" | "api";
  appliedJobId?: string | null;
}

// Ingests any document payload (PDF buffer, text, or stream) and executes multi-aspect candidate profile extraction
export async function extractCandidateFromDocument(
  input: IngestionDocumentInput
): Promise<ParsedCandidateProfile> {
  let extractedText = "";

  if (input.text && input.text.trim()) {
    extractedText = input.text.trim();
  } else if (input.buffer) {
    const isPdf =
      input.mimeType === "application/pdf" ||
      isPdfBuffer(input.buffer) ||
      input.filename.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      extractedText = await extractTextFromPdf(input.buffer);
    } else {
      extractedText = input.buffer.toString("utf-8");
    }
  } else {
    throw new Error(`Cannot extract candidate profile: no text or buffer provided for '${input.filename}'`);
  }

  if (!extractedText.trim()) {
    throw new Error(`No readable textual layer could be extracted from '${input.filename}'`);
  }

  return extractCandidateProfile(extractedText, {
    filename: input.filename,
    fileSizeBytes: input.buffer ? input.buffer.length : undefined,
    mimeType: input.mimeType || "application/pdf",
    fileUrl: input.sourceUrl,
    appliedJobId: input.appliedJobId,
  });
}
