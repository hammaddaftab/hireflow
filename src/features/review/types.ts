import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { ReviewDecision } from "@/entities/review";
import type { CompensationBandRequirement } from "@/entities/job";
export * from "./evaluators/evaluationStatuses";
import type {
  EvaluatedRequirement,
  EvaluatedExperienceRequirement,
  EvaluatedEducationRequirement,
} from "./evaluators/evaluationStatuses";
import type { SkillEvaluatorOutput } from "./evaluators/skillEvaluator";
import type { LogisticsEvaluatorOutput } from "./evaluators/logisticsEvaluator";

export interface CandidateReviewItem {
  candidate: ParsedCandidateProfile;
  jobId?: string;
  evaluations: EvaluatedRequirement[];
  decision: ReviewDecision;

  // Direct Concept Evaluator Outputs
  experience: EvaluatedExperienceRequirement;
  skills: SkillEvaluatorOutput;
  education: EvaluatedEducationRequirement;
  logistics: LogisticsEvaluatorOutput;

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
