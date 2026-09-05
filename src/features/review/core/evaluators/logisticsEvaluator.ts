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
import type { NormalizedLocation } from "@/entities/extraction/candidate/aspects/identity";
import type {
  EvaluatedRequirement,
  EvaluatedCompensationRequirement,
  EvaluatedNoticePeriodRequirement,
  EvaluatedWorkModeRequirement,
  EvaluatedLocationRequirement,
  EvidentiaryDotType,
} from "./evaluationStatuses";
import { evaluateCompensation } from "./compensationEvaluator";
import { evaluateNoticePeriod } from "./noticePeriodEvaluator";
import { evaluateWorkMode } from "./workModeEvaluator";
import { evaluateLocation } from "./locationEvaluator";

export type LogisticsEvaluatorInput = {
  compensation_requirement: CompensationBandRequirement | null;
  salary_expectation: CandidateSalaryExpectation;
  notice_period_requirement: MaxNoticePeriodRequirement | null;
  notice_period: CandidateNoticePeriod;
  work_mode_requirement: WorkModeRequirement | null;
  stated_relocation_willingness?: string | null;
  location_requirement: LocationRequirement | null;
  normalized_location: NormalizedLocation;
};

export interface LogisticsEvaluatorOutput {
  compensation: EvaluatedCompensationRequirement;
  noticePeriod: EvaluatedNoticePeriodRequirement;
  workMode: EvaluatedWorkModeRequirement;
  location: EvaluatedLocationRequirement;
  missingLogistics: string[];
  derived: {
    statusDotType: EvidentiaryDotType;
    statusPillText: string;
    statusBadgeText: string;
  };
  evaluations: EvaluatedRequirement[];
}

export function evaluateLogistics(input: LogisticsEvaluatorInput): LogisticsEvaluatorOutput {
  const compensation = evaluateCompensation({
    compensation_requirement: input.compensation_requirement,
    salary_expectation: input.salary_expectation,
    id: "req_comp",
  });

  const noticePeriod = evaluateNoticePeriod({
    notice_period_requirement: input.notice_period_requirement,
    notice_period: input.notice_period,
    id: "req_notice",
  });

  const workMode = evaluateWorkMode({
    work_mode_requirement: input.work_mode_requirement,
    stated_relocation_willingness: input.stated_relocation_willingness,
    id: "req_work_mode",
  });

  const location = evaluateLocation({
    location_requirement: input.location_requirement,
    normalized_location: input.normalized_location,
    stated_relocation_willingness: input.stated_relocation_willingness,
    id: "req_location",
  });

  const missingLogistics: string[] = [];
  if (compensation.status === "not_stated") {
    missingLogistics.push("Salary expectation: not stated");
  }
  if (noticePeriod.status === "not_stated") {
    missingLogistics.push("Notice period: not stated");
  }
  if (workMode.status === "ambiguous") {
    missingLogistics.push("Relocation willingness: not stated");
  }
  if (location.status === "ambiguous") {
    missingLogistics.push("Location preference: not stated");
  }

  const statusDotType: EvidentiaryDotType = missingLogistics.length === 0 ? "confirmed" : "gap";
  const statusPillText =
    missingLogistics.length === 0
      ? "all logistics provided"
      : `${missingLogistics.length} logistics ${missingLogistics.length === 1 ? "field" : "fields"} missing`;
  const statusBadgeText = missingLogistics.length === 0 ? "Satisfied" : "Gap";

  return {
    compensation,
    noticePeriod,
    workMode,
    location,
    missingLogistics,
    derived: {
      statusDotType,
      statusPillText,
      statusBadgeText,
    },
    evaluations: [compensation, noticePeriod, workMode, location],
  };
}
