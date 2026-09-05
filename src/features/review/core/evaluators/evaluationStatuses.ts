import type { SyntacticTier } from "@/entities/extraction/candidate/aspects/skillsDemonstrated";

export type ExperienceStatus = "confirmed" | "contradicted" | "not_stated";
export type SkillStatus = "confirmed" | "ambiguous" | "contradicted" | "not_stated";
export type EducationStatus = "confirmed" | "ambiguous" | "contradicted" | "not_stated";
export type CompensationStatus = "confirmed" | "contradicted" | "ambiguous" | "not_stated";
export type NoticePeriodStatus = "confirmed" | "contradicted" | "not_stated";
export type WorkModeStatus = "confirmed" | "contradicted" | "ambiguous";
export type LocationStatus = "confirmed" | "contradicted" | "ambiguous";

export type RequirementCategory =
  | "experience"
  | "skill"
  | "education"
  | "compensation"
  | "notice_period"
  | "work_mode"
  | "location";

export type EvidentiaryDotType = "confirmed" | "gap" | "contradicted" | "not_stated";

export interface EvaluatedRequirementDerived {
  dotType: EvidentiaryDotType;
  pillText: string;
  badgeText: string;
}

export interface BaseEvaluatedRequirement {
  id: string;
  label: string;
  blocking: boolean;
  reasoning: string;
  evidence_span: string | null;
  derived: EvaluatedRequirementDerived;
}

export type EvaluatedExperienceRequirement = BaseEvaluatedRequirement & {
  category: "experience";
  status: ExperienceStatus;
  verifiedYears: number;
  minYears: number;
};

export type EvaluatedSkillRequirement = BaseEvaluatedRequirement & {
  category: "skill";
  status: SkillStatus;
  syntactic_tier: SyntacticTier | null;
  outcome_attached: string | null;
  hasOutcome: boolean;
  isOrphan: boolean;
  orphanSkills?: string[];
};

export type EvaluatedEducationRequirement = BaseEvaluatedRequirement & {
  category: "education";
  status: EducationStatus;
  hasEducation: boolean;
};

export type EvaluatedCompensationRequirement = BaseEvaluatedRequirement & {
  category: "compensation";
  status: CompensationStatus;
};

export type EvaluatedNoticePeriodRequirement = BaseEvaluatedRequirement & {
  category: "notice_period";
  status: NoticePeriodStatus;
};

export type EvaluatedWorkModeRequirement = BaseEvaluatedRequirement & {
  category: "work_mode";
  status: WorkModeStatus;
};

export type EvaluatedLocationRequirement = BaseEvaluatedRequirement & {
  category: "location";
  status: LocationStatus;
};

export type EvaluatedRequirement =
  | EvaluatedExperienceRequirement
  | EvaluatedSkillRequirement
  | EvaluatedEducationRequirement
  | EvaluatedCompensationRequirement
  | EvaluatedNoticePeriodRequirement
  | EvaluatedWorkModeRequirement
  | EvaluatedLocationRequirement;
