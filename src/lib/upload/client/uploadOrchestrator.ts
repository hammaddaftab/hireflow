// Client-side orchestrator functions for uploading and sequentially ingesting resumes

import type { ResumeUploadApiResponse, DroppedResumeItem } from "../types";
import type { ParsedCandidateProfile } from "@/entities/candidate";

export interface UploadFilesOptions {
  files: File[];
  jobId?: string | null;
}

export interface IngestUploadOptions {
  uploadId: string;
  jobId?: string | null;
}

// Upload raw resume files to the upload API endpoint
export async function uploadResumeFiles(
  options: UploadFilesOptions
): Promise<ResumeUploadApiResponse> {
  const formData = new FormData();
  if (options.jobId) {
    formData.append("jobId", options.jobId);
  }
  options.files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("/api/resumes/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const errMsg = errJson?.error?.detail || `Upload failed with status ${response.status}`;
    throw new Error(errMsg);
  }

  const json = await response.json();
  return json.data;
}

// Ingest a single uploaded document to extract its candidate profile
export async function ingestUploadedResume(
  options: IngestUploadOptions
): Promise<ParsedCandidateProfile> {
  const response = await fetch("/api/resumes/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploadId: options.uploadId,
      jobId: options.jobId,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const reason = errData?.error?.message || "Extraction failed";
    throw new Error(reason);
  }

  const json = await response.json();
  return json.data.candidate;
}

// Sequentially ingest a list of uploaded resume records
export async function sequentiallyIngestUploads(
  uploads: DroppedResumeItem[],
  jobId?: string | null,
  callbacks?: {
    onStartItem?: (index: number, total: number, item: DroppedResumeItem) => void;
    onCandidateIngested?: (candidate: ParsedCandidateProfile) => void;
    onError?: (error: string, item: DroppedResumeItem) => void;
  }
): Promise<number> {
  let ingestedCount = 0;
  for (let i = 0; i < uploads.length; i++) {
    const uploadedItem = uploads[i];
    callbacks?.onStartItem?.(i, uploads.length, uploadedItem);

    try {
      const candidate = await ingestUploadedResume({
        uploadId: uploadedItem.id,
        jobId,
      });
      callbacks?.onCandidateIngested?.(candidate);
      ingestedCount++;
    } catch (ingestErr) {
      const msg = ingestErr instanceof Error ? ingestErr.message : String(ingestErr);
      callbacks?.onError?.(`Failed to extract ${uploadedItem.filename}: ${msg}`, uploadedItem);
    }
  }

  return ingestedCount;
}
