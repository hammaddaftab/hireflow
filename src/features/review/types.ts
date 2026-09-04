import { ParsedCandidateProfile } from "../candidates/types";
import { EvidenceStatus } from "../extraction/shared/evidenceStatus";

export type ReviewDecision = "keep" | "flag" | "pass" | "pending";

/**
 * A single blocking requirement with Layer 1 status and Layer 2 evidence.
 */
export interface BlockingRequirementItem {
  id: string;
  label: string;
  category: "experience" | "skill" | "dealbreaker";
  status: EvidenceStatus;
  evidence_span: string | null;
  reasoning: string;
}

/**
 * Candidate item formatted for the high-velocity review queue.
 */
export interface CandidateReviewItem {
  candidate: ParsedCandidateProfile;
  blockingItems: BlockingRequirementItem[];
  isAllBlockingConfirmed: boolean;
  hasContradicted: boolean;
  hasAmbiguous: boolean;
  orphanSkillsCount: number;
  orphanSkillsList: string[];
  logisticsNotStatedCount: number;
  logisticsNotStatedList: string[];
  verifiedYearsExperience: number;
  compensationBand?: { min: number; max: number; currency: string } | null;
  decision: ReviewDecision;
}

export type QueueFilterTab = "all" | "fast_clear" | "needs_attention" | "contradicted";

export interface QueryGroup {
  id: string;
  name: string;
  candidateIds: string[];
}
