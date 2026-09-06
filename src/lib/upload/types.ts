// Domain and transport contracts for candidate resume ingestion and Vercel Blob storage

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

export interface UploadedResumeRecord {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  status: "stored" | "uploading" | "error";
  blobUrl: string;
  pathname: string;
  hash: string;
  jobId: string | null;
  uploadedAt: string;
}

export interface ResumeUploadApiResponse {
  uploads: DroppedResumeItem[];
  count: number;
}
