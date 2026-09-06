// Service for candidate resume uploads persisted directly in PostgreSQL via Drizzle ORM

import { db, resumeUploads } from "@/db";
import { desc, eq } from "drizzle-orm";
import type { UploadedResumeRecord } from "@/lib/upload";
import type { ResumeUploadRecord } from "@/entities/resumeUpload";

// Transform database row into domain UploadedResumeRecord contract
function toDomainRecord(row: ResumeUploadRecord): UploadedResumeRecord {
  return {
    id: row.id,
    filename: row.filename,
    size: row.size,
    contentType: row.contentType,
    status: (row.status as "stored" | "uploading" | "error") || "stored",
    blobUrl: row.blobUrl,
    pathname: row.pathname,
    hash: row.hash || "",
    jobId: row.jobId,
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
      status: record.status || "stored",
      createdAt: record.uploadedAt ? new Date(record.uploadedAt) : now,
      updatedAt: now,
    }));
    await db.insert(resumeUploads).values(values);
    return records;
  }

  // Delete a specific upload record by ID
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(resumeUploads)
      .where(eq(resumeUploads.id, id))
      .returning({ id: resumeUploads.id });

    return result.length > 0;
  }

  // Clear all uploaded resume records from database
  async clear(): Promise<void> {
    await db.delete(resumeUploads);
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
