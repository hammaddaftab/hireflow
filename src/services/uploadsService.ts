// Service for candidate resume uploads persisted directly in PostgreSQL via Drizzle ORM
// Cross-cutting ingress service intentionally located in /src/services/ rather than /src/features/uploads/
// to allow consumption across /uploads, /review, and API routes without violating ADR 0003 sibling import rules

import { db, resumeUploads, candidates } from "@/db";
import { desc, eq, inArray, isNotNull } from "drizzle-orm";
import { candidatesService } from "./candidatesService";
import type { UploadedResumeRecord } from "@/lib/upload";
import type { ResumeUploadRecord } from "@/entities/resumeUpload";

// Transform database row into domain UploadedResumeRecord contract
function toDomainRecord(row: ResumeUploadRecord): UploadedResumeRecord {
  return {
    id: row.id,
    filename: row.filename,
    size: row.size,
    contentType: row.contentType,
    status: (row.status as UploadedResumeRecord["status"]) || "stored",
    errorMessage: row.errorMessage || null,
    blobUrl: row.blobUrl,
    pathname: row.pathname,
    hash: row.hash || "",
    jobId: row.jobId,
    candidateId: row.candidateId || null,
    uploadedAt: row.createdAt.toISOString(),
  };
}

export class UploadsService {
  // Query all uploaded resume records ordered by most recent first
  async getAll(): Promise<UploadedResumeRecord[]> {
    const rows = await db
      .select()
      .from(resumeUploads)
      .orderBy(desc(resumeUploads.createdAt));

    return rows.map(toDomainRecord);
  }

  // Find a specific resume upload by unique ID
  async getById(id: string): Promise<UploadedResumeRecord | null> {
    const rows = await db
      .select()
      .from(resumeUploads)
      .where(eq(resumeUploads.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return toDomainRecord(rows[0]);
  }

  // Insert a single uploaded resume record into PostgreSQL
  async add(record: UploadedResumeRecord): Promise<UploadedResumeRecord> {
    const now = new Date();
    await db.insert(resumeUploads).values({
      id: record.id,
      filename: record.filename,
      size: record.size,
      contentType: record.contentType,
      blobUrl: record.blobUrl,
      pathname: record.pathname,
      hash: record.hash || null,
      jobId: record.jobId || null,
      candidateId: record.candidateId || null,
      status: record.status || "stored",
      createdAt: record.uploadedAt ? new Date(record.uploadedAt) : now,
      updatedAt: now,
    });
    return record;
  }

  // Batch insert multiple uploaded resume records into PostgreSQL
  async addBatch(records: UploadedResumeRecord[]): Promise<UploadedResumeRecord[]> {
    if (records.length === 0) return [];
    const now = new Date();
    const values = records.map((record) => ({
      id: record.id,
      filename: record.filename,
      size: record.size,
      contentType: record.contentType,
      blobUrl: record.blobUrl,
      pathname: record.pathname,
      hash: record.hash || null,
      jobId: record.jobId || null,
      candidateId: record.candidateId || null,
      status: record.status || "stored",
      createdAt: record.uploadedAt ? new Date(record.uploadedAt) : now,
      updatedAt: now,
    }));
    await db.insert(resumeUploads).values(values);
    return records;
  }

  // Delete a specific upload record by ID
  async delete(id: string): Promise<boolean> {
    const upload = await this.getById(id);
    if (!upload) return false;

    // If upload was ingested into a candidate, deleting the candidate
    // automatically cascades via database FK to delete:
    // 1. The upload record (via resume_uploads FK onDelete: "cascade")
    // 2. Candidate reviews (via candidate_reviews FK onDelete: "cascade")
    // 3. Candidate group memberships (via candidate_group_memberships FK onDelete: "cascade")
    if (upload.candidateId) {
      return await candidatesService.deleteCandidate(upload.candidateId);
    }

    // If un-ingested (no candidate created yet), delete upload record directly
    const result = await db
      .delete(resumeUploads)
      .where(eq(resumeUploads.id, id))
      .returning({ id: resumeUploads.id });

    return result.length > 0;
  }

  // Clear all uploaded resume records from database
  async clear(): Promise<void> {
    // 1. Delete all candidates linked to uploads (cascades to their upload rows, reviews, and memberships)
    const uploadsWithCandidates = await db
      .select({ candidateId: resumeUploads.candidateId })
      .from(resumeUploads)
      .where(isNotNull(resumeUploads.candidateId));

    const candidateIds = uploadsWithCandidates.map((u) => u.candidateId!).filter(Boolean);
    if (candidateIds.length > 0) {
      await db.delete(candidates).where(inArray(candidates.id, candidateIds));
    }

    // 2. Delete any remaining un-ingested uploads where candidateId was null
    await db.delete(resumeUploads);
  }

  // Associate a resume upload with an applied job ID
  async updateJobId(id: string, jobId: string): Promise<boolean> {
    const result = await db
      .update(resumeUploads)
      .set({ jobId, updatedAt: new Date() })
      .where(eq(resumeUploads.id, id))
      .returning({ id: resumeUploads.id });

    return result.length > 0;
  }

  // Associate a resume upload with a candidate ID
  async updateCandidateId(id: string, candidateId: string): Promise<boolean> {
    const result = await db
      .update(resumeUploads)
      .set({ candidateId, status: "extracted", errorMessage: null, updatedAt: new Date() })
      .where(eq(resumeUploads.id, id))
      .returning({ id: resumeUploads.id });

    return result.length > 0;
  }

  // Update status and optional error message of an upload record
  async updateStatus(id: string, status: string, errorMessage?: string | null): Promise<boolean> {
    const result = await db
      .update(resumeUploads)
      .set({ status, errorMessage: errorMessage || null, updatedAt: new Date() })
      .where(eq(resumeUploads.id, id))
      .returning({ id: resumeUploads.id });

    return result.length > 0;
  }

  // Compute aggregate metrics directly from database records
  async getStats(): Promise<{ total: number; totalBytes: number; stored: number }> {
    const items = await this.getAll();
    const totalBytes = items.reduce((acc, item) => acc + item.size, 0);
    const stored = items.filter((item) => item.status === "stored").length;
    return {
      total: items.length,
      totalBytes,
      stored,
    };
  }
}

// Global singleton instance for database-backed resume uploads
export const uploadsService = new UploadsService();
