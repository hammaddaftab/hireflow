import type {
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
  WorkModeRequirement,
  LocationRequirement,
} from "@/entities/job";
import type {
  CandidateSalaryExpectation,
  CandidateNoticePeriod,
} from "@/entities/extraction/candidate/aspects/logistics";
import type {
  EvaluatedRequirement,
  EvaluatedCompensationRequirement,
  EvaluatedNoticePeriodRequirement,
  EvaluatedWorkModeRequirement,
  EvaluatedLocationRequirement,
  EvidentiaryDotType,
  EvaluationPair,
} from "./evaluationStatuses";
import { evaluateCompensation } from "./compensationEvaluator";
import { evaluateNoticePeriod } from "./noticePeriodEvaluator";
import { evaluateWorkMode, type CandidateWorkModeContext } from "./workModeEvaluator";
import { evaluateLocation, type CandidateLocationContext } from "./locationEvaluator";

export interface LogisticsEvaluatorInput {
  compensation: EvaluationPair<CompensationBandRequirement, CandidateSalaryExpectation>;
  noticePeriod: EvaluationPair<MaxNoticePeriodRequirement, CandidateNoticePeriod>;
  location: EvaluationPair<LocationRequirement, CandidateLocationContext>;
  workMode: EvaluationPair<WorkModeRequirement, CandidateWorkModeContext>;
}

export interface EvaluatedLogisticsRequirement {
  compensation: EvaluatedCompensationRequirement | null;
  noticePeriod: EvaluatedNoticePeriodRequirement | null;
  workMode: EvaluatedWorkModeRequirement | null;
  location: EvaluatedLocationRequirement | null;
  missingLogistics: string[];
  activeCount: number;
  derived: {
    statusDotType: EvidentiaryDotType;
    statusPillText: string;
    statusBadgeText: string;
  };
  evaluations: EvaluatedRequirement[];
}

// Backward compatibility alias
export type LogisticsEvaluatorOutput = EvaluatedLogisticsRequirement;

export function evaluateLogistics(input: LogisticsEvaluatorInput): EvaluatedLogisticsRequirement | null {
  const activeCount = [
    input.compensation.requirement.active !== false,
    input.noticePeriod.requirement.active !== false,
    input.workMode.requirement.active !== false,
    input.location.requirement.active !== false,
  ].filter(Boolean).length;

  // Null if all 4 logistics criteria are disabled
  if (activeCount === 0) {
    return null;
  }

  const compensation = evaluateCompensation(input.compensation, "req_comp");
  const noticePeriod = evaluateNoticePeriod(input.noticePeriod, "req_notice");
  const workMode = evaluateWorkMode(input.workMode, "req_work_mode");
  const location = evaluateLocation(input.location, "req_location");

  const evaluations = [
    compensation,
    noticePeriod,
    workMode,
    location,
  ].filter((e): e is NonNullable<typeof e> => e !== null);

  const missingLogistics: string[] = [];
  if (compensation?.status === "not_stated") {
    missingLogistics.push("Salary expectation: not stated");
  }
  if (noticePeriod?.status === "not_stated") {
    missingLogistics.push("Notice period: not stated");
  }
  if (workMode?.status === "ambiguous") {
    missingLogistics.push("Relocation willingness: not stated");
  }
  if (location?.status === "ambiguous") {
    missingLogistics.push("Location preference: not stated");
  }

  const statusDotType: EvidentiaryDotType =
    missingLogistics.length === 0 ? "confirmed" : "gap";

  const statusPillText =
    missingLogistics.length === 0
      ? "all logistics satisfied"
      : `${missingLogistics.length} of ${activeCount} logistics fields unstated`;

  const statusBadgeText =
    missingLogistics.length === 0 ? "Satisfied" : "Gap";

  return {
    compensation,
    noticePeriod,
    workMode,
    location,
    missingLogistics,
    activeCount,
    derived: {
      statusDotType,
      statusPillText,
      statusBadgeText,
    },
    evaluations,
  };
}
