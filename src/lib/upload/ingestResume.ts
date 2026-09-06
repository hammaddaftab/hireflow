// Core transport-agnostic resume ingestion pipeline: validate, digest, and persist to Vercel Blob

import { uploadResumeToBlob } from "@/lib/storage";
import { validateResumeFile } from "./validateResume";
import { hashDocumentBuffer } from "./hashDocument";
import type { UploadedResumeRecord } from "./types";

export interface IngestDocumentInput {
  filename: string;
  buffer: Buffer;
  size: number;
  contentType: string;
  jobId?: string | null;
}

// Ingest a single document buffer into Vercel Blob Storage
export async function ingestDocumentBuffer(input: IngestDocumentInput): Promise<UploadedResumeRecord> {
  const validation = validateResumeFile({ name: input.filename, size: input.size });
  if (!validation.valid) {
    throw new Error(validation.error || `Invalid document: ${input.filename}`);
  }

  // Compute SHA-256 hash for document provenance & deduplication
  const hash = hashDocumentBuffer(input.buffer);

  // Persist directly to Vercel Blob Storage
  const blobResult = await uploadResumeToBlob(input.filename, input.buffer, {
    contentType: input.contentType,
  });

  return {
    id: `upl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    filename: input.filename,
    size: blobResult.size,
    contentType: blobResult.contentType,
    status: "stored",
    blobUrl: blobResult.url,
    pathname: blobResult.pathname,
    hash,
    jobId: input.jobId || null,
    uploadedAt: new Date().toISOString(),
  };
}

// Ingest a standard web File object (from multipart form data or browser)
export async function ingestResumeFile(file: File, jobId?: string | null): Promise<UploadedResumeRecord> {
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || `Invalid file: ${file.name}`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return ingestDocumentBuffer({
    filename: file.name,
    buffer,
    size: file.size,
    contentType: file.type || "application/pdf",
    jobId,
  });
}

// Ingest a batch of resume files concurrently
export async function ingestResumeFiles(files: File[], jobId?: string | null): Promise<UploadedResumeRecord[]> {
  const tasks = files.map((file) => ingestResumeFile(file, jobId));
  return Promise.all(tasks);
}
