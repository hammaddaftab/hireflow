import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { ReviewDecision } from "@/entities/review";
import type { CompensationBandRequirement } from "@/entities/job";
export * from "./core/evaluators/evaluationStatuses";
import type {
  EvaluatedRequirement,
  EvaluatedExperienceRequirement,
  EvaluatedEducationRequirement,
} from "./core/evaluators/evaluationStatuses";
import type {
  EvaluatedSkillsRequirement,
  SkillEvaluatorOutput,
} from "./core/evaluators/skillEvaluator";
import type {
  EvaluatedLogisticsRequirement,
  LogisticsEvaluatorOutput,
} from "./core/evaluators/logisticsEvaluator";

export type {
  EvaluatedSkillsRequirement,
  SkillEvaluatorOutput,
  EvaluatedLogisticsRequirement,
  LogisticsEvaluatorOutput,
};

export interface CandidateReviewItem {
  candidate: ParsedCandidateProfile;
  jobId?: string;
  evaluations: EvaluatedRequirement[];
  decision: ReviewDecision;

  // Direct Concept Evaluator Outputs (null if criterion was disabled/inactive)
  experience: EvaluatedExperienceRequirement | null;
  skills: EvaluatedSkillsRequirement | null;
  education: EvaluatedEducationRequirement | null;
  logistics: EvaluatedLogisticsRequirement | null;

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
