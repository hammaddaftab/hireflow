// Drizzle ORM table schema for persistent resume uploads in PostgreSQL

import { pgTable, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const resumeUploads = pgTable("resume_uploads", {
  id: varchar("id", { length: 128 }).primaryKey(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),
  contentType: varchar("content_type", { length: 64 }).notNull().default("application/pdf"),
  blobUrl: text("blob_url").notNull(),
  pathname: text("pathname").notNull(),
  hash: varchar("hash", { length: 128 }),
  jobId: varchar("job_id", { length: 128 }),
  candidateId: varchar("candidate_id", { length: 128 }),
  status: varchar("status", { length: 32 }).notNull().default("stored"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ResumeUploadRecord = typeof resumeUploads.$inferSelect;
export type NewResumeUploadRecord = typeof resumeUploads.$inferInsert;
