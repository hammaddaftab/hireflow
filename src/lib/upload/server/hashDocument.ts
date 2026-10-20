// Computes deterministic SHA-256 byte digests for document provenance and deduplication caching.
// Disabled by default so developers and recruiters can drop the same resume repeatedly.
// Enable explicitly by setting ENABLE_RESUME_HASHING=true in .env

import { createHash } from "crypto";

export function isResumeHashingEnabled(): boolean {
  return process.env.ENABLE_RESUME_HASHING === "true";
}

export function hashDocumentBuffer(buffer: Buffer | Uint8Array): string {
  if (!isResumeHashingEnabled()) {
    return "";
  }
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return createHash("sha256").update(buf).digest("hex");
}
