// Service for candidate profiles persisted directly in PostgreSQL via Drizzle ORM

import { db, candidates } from "@/db";
import { desc, eq, and, or, ilike, type SQL } from "drizzle-orm";
import {
  candidateProfileToRow,
  candidateRowToProfile,
  type ParsedCandidateProfile,
} from "@/entities/candidate";
import { normalizeCandidateProfile } from "@/lib/extraction";

export class CandidatesService {
  // Query all candidates from PostgreSQL ordered by newest first
  async getAllCandidates(filters?: { jobId?: string; search?: string }): Promise<ParsedCandidateProfile[]> {
    const conditions: SQL[] = [];

    if (filters?.jobId) {
      conditions.push(eq(candidates.appliedJobId, filters.jobId));
    }

    if (filters?.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(candidates.name, term),
          ilike(candidates.email, term),
          ilike(candidates.city, term),
          ilike(candidates.currentRoleTitle, term)
        )!
      );
    }

    const query = db
      .select()
      .from(candidates)
      .orderBy(desc(candidates.createdAt));

    const rows = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    return rows.map((row) => normalizeCandidateProfile(candidateRowToProfile(row)));
  }

  // Get a single candidate by ID from PostgreSQL
  async getCandidateById(id: string): Promise<ParsedCandidateProfile | null> {
    const rows = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return normalizeCandidateProfile(candidateRowToProfile(rows[0]));
  }

  // Insert a candidate profile into PostgreSQL
  async createCandidate(candidate: ParsedCandidateProfile): Promise<ParsedCandidateProfile> {
    const normalized = normalizeCandidateProfile(candidate);
    const row = candidateProfileToRow(normalized);
    await db.insert(candidates).values(row);
    return normalized;
  }

  // Delete candidate by ID
  async deleteCandidate(id: string): Promise<boolean> {
    const result = await db
      .delete(candidates)
      .where(eq(candidates.id, id))
      .returning({ id: candidates.id });

    return result.length > 0;
  }

  // Clear all candidates from PostgreSQL
  async clear(): Promise<void> {
    await db.delete(candidates);
  }
}

// Global singleton instance for database-backed candidate operations
export const candidatesService = new CandidatesService();
