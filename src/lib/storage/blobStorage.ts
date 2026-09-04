import { put } from "@vercel/blob";

export interface UploadResumeResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Uploads a resume PDF to Vercel Blob Storage using @vercel/blob.
 * If BLOB_READ_WRITE_TOKEN is not configured (e.g. local offline development),
 * provides a structured local reference fallback without throwing.
 */
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
    // Graceful fallback for local development without active Vercel token
    const localRef = `storage://resumes/${filename}`;
    return {
      url: localRef,
      pathname: safeFilename,
      contentType,
      size: payload.length,
    };
  }

  const blob = await put(safeFilename, payload, {
    access: "public",
    token,
    contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType,
    size: buffer.length,
  };
}
