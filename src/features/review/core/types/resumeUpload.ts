// Domain types for candidate resume drag-and-drop upload architecture

export type ResumeUploadStatus = "queued" | "uploading" | "stored" | "error";

export interface DroppedResumeItem {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  status: ResumeUploadStatus;
  progress?: number;
  blobUrl?: string;
  pathname?: string;
  hash?: string;
  error?: string;
  uploadedAt?: string;
  jobId?: string | null;
}

export interface ResumeUploadApiResponse {
  uploads: DroppedResumeItem[];
  count: number;
}
