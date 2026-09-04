import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { jobs } from "./job";
import type { CandidateQueryEvaluation } from "./extraction/matching/queryEvaluation";

export const queryEvaluations = pgTable("query_evaluations", {
  id: varchar("id", { length: 128 }).primaryKey(),
  jobId: varchar("job_id", { length: 128 })
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),

  queryText: text("query_text").notNull(),
  evaluations: jsonb("evaluations").$type<CandidateQueryEvaluation[]>().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type QueryEvaluationRecord = typeof queryEvaluations.$inferSelect;
export type NewQueryEvaluationRecord = typeof queryEvaluations.$inferInsert;

export type { CandidateQueryEvaluation };
