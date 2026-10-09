// Service for candidate review decisions persisted in PostgreSQL via Drizzle ORM

import { db, candidateReviews } from "@/db";
import { eq, sql } from "drizzle-orm";
import type { ReviewDecision } from "@/entities/review";

export async function upsertDecision(
  candidateId: string,
  jobId: string,
  decision: ReviewDecision,
  notes?: string
): Promise<void> {
  const id = `rev_${candidateId}_${jobId}`;
  await db
    .insert(candidateReviews)
    .values({
      id,
      candidateId,
      jobId,
      decision,
      notes: notes ?? null,
    })
    .onConflictDoUpdate({
      target: [candidateReviews.candidateId, candidateReviews.jobId],
      set: {
        decision,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: sql`now()`,
      },
    });
}

export interface PersistedDecisionRecord {
  decision: ReviewDecision;
  updatedAt?: Date | string | null;
}

export async function getDecisionsForJob(
  jobId: string
): Promise<Map<string, PersistedDecisionRecord>> {
  const rows = await db
    .select({
      candidateId: candidateReviews.candidateId,
      decision: candidateReviews.decision,
      updatedAt: candidateReviews.updatedAt,
    })
    .from(candidateReviews)
    .where(eq(candidateReviews.jobId, jobId));

  const decisions = new Map<string, PersistedDecisionRecord>();
  for (const row of rows) {
    decisions.set(row.candidateId, {
      decision: row.decision as ReviewDecision,
      updatedAt: row.updatedAt,
    });
  }
  return decisions;
}

export const reviewsService = {
  upsertDecision,
  getDecisionsForJob,
};
