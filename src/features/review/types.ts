import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { ReviewDecision } from "@/entities/review";
import type { CompensationBandRequirement } from "@/entities/job";
export * from "./evaluators/evaluationStatuses";
import type { EvaluatedRequirement } from "./evaluators/evaluationStatuses";
import type { SkillEvaluatorOutput } from "./evaluators/skillEvaluator";

export interface CandidateReviewItem {
  candidate: ParsedCandidateProfile;
  jobId?: string;
  evaluations: EvaluatedRequirement[];
  skills: SkillEvaluatorOutput;
  decision: ReviewDecision;

  // Knockout sorting and queue metrics
  blockingItems: EvaluatedRequirement[];
  isAllBlockingConfirmed: boolean;
  hasContradicted: boolean;
  hasAmbiguous: boolean;
  verifiedYearsExperience: number;
  compensationBand?: CompensationBandRequirement | null;
}

export interface QueryGroup {
  id: string;
  name: string;
  candidateIds: string[];
}
