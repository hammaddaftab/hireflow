import { ParsedCandidateProfile } from "./types";
import { MOCK_CANDIDATES } from "./mockCandidates";

export class CandidatesService {
  private candidates: Map<string, ParsedCandidateProfile> = new Map();

  constructor(initialCandidates?: ParsedCandidateProfile[]) {
    const seed = initialCandidates || MOCK_CANDIDATES;
    seed.forEach((c) => this.candidates.set(c.id, c));
  }

  async getAllCandidates(filters?: { jobId?: string; search?: string }): Promise<ParsedCandidateProfile[]> {
    let list = Array.from(this.candidates.values());

    if (filters?.jobId) {
      list = list.filter((c) => c.applied_job_id === filters.jobId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.identity.name.toLowerCase().includes(q) ||
          (c.identity.email && c.identity.email.toLowerCase().includes(q)) ||
          (c.identity.location.raw && c.identity.location.raw.toLowerCase().includes(q)) ||
          c.skills_declared.skills_declared.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getCandidateById(id: string): Promise<ParsedCandidateProfile | null> {
    return this.candidates.get(id) || null;
  }

  async createCandidate(candidate: ParsedCandidateProfile): Promise<ParsedCandidateProfile> {
    this.candidates.set(candidate.id, candidate);
    return candidate;
  }
}

// Global singleton instance for in-memory persistence in development / API routes
const globalForCandidateService = globalThis as unknown as { candidatesService?: CandidatesService };
export const candidatesService = globalForCandidateService.candidatesService ?? new CandidatesService();

if (process.env.NODE_ENV !== "production") {
  globalForCandidateService.candidatesService = candidatesService;
}
