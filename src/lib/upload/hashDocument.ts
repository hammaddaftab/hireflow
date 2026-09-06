// Computes deterministic SHA-256 byte digests for document provenance and deduplication caching

import { createHash } from "crypto";

export function hashDocumentBuffer(buffer: Buffer | Uint8Array): string {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return createHash("sha256").update(buf).digest("hex");
}
