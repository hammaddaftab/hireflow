import { put } from "@vercel/blob";
import path from "node:path";
import { promises as fs } from "node:fs";

export interface UploadResumeResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

// Determines if Vercel Blob storage is configured via environment token
export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// Resolves deterministic local path for resume documents in .uploads/resumes/
export function getLocalResumePath(pathnameOrFilename: string): string {
  return path.join(process.cwd(), ".uploads", "resumes", path.basename(pathnameOrFilename));
}

// Uploads a resume document: uses Vercel Blob if configured, otherwise stores locally on disk
export async function uploadResumeToBlob(
  filename: string,
  buffer: Buffer | Uint8Array,
  options?: {
    contentType?: string;
    token?: string;
  }
): Promise<UploadResumeResult> {
  const token = options?.token || process.env.BLOB_READ_WRITE_TOKEN;
  const contentType = options?.contentType || "application/pdf";
  const safeFilename = `resumes/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const payload = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  if (!token) {
    // Explicit local filesystem storage when Vercel Blob is not configured
    const localRef = `storage://resumes/${filename}`;
    const uploadsDir = path.join(process.cwd(), ".uploads", "resumes");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, path.basename(safeFilename)), payload);

    return {
      url: localRef,
      pathname: safeFilename,
      contentType,
      size: payload.length,
    };
  }

  // Explicit Vercel Blob storage when token is present
  const blob = await put(safeFilename, payload, {
    access: "public",
    token,
    contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType,
    size: payload.length,
  };
}

// Retrieves resume file buffer: fetches from Vercel Blob if an HTTP(S) blob URL is present, otherwise reads from local storage
export async function getResumeFileBuffer(record: {
  blobUrl: string | null;
  pathname?: string | null;
  filename: string;
}): Promise<Buffer> {
  if (isBlobStorageConfigured() && record.blobUrl && record.blobUrl.startsWith("http")) {
    const response = await fetch(record.blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob document for '${record.filename}' (status ${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Local mode or local-seeded storage:// URI: check .uploads/resumes first, then bench/cvs fallback
  const targetName = record.pathname || record.filename;
  const candidatePaths = [
    getLocalResumePath(targetName),
    path.join(process.cwd(), "docs", "research", "top-candidates", "bench", "cvs", path.basename(targetName)),
  ];

  for (const filePath of candidatePaths) {
    try {
      return await fs.readFile(filePath);
    } catch {
      // Continue to fallback path
    }
  }

  throw new Error(`Local resume file not found for '${record.filename}'`);
}
