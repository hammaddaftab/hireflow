import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { jobs } from "@/features/extraction/job/schema";
import { candidates } from "./candidateSchema";

export const candidateReviews = pgTable("candidate_reviews", {
  id: varchar("id", { length: 128 }).primaryKey(),
  candidateId: varchar("candidate_id", { length: 128 })
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  jobId: varchar("job_id", { length: 128 })
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),

  decision: varchar("decision", { length: 32 }).notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CandidateReviewRecord = typeof candidateReviews.$inferSelect;
export type NewCandidateReviewRecord = typeof candidateReviews.$inferInsert;

