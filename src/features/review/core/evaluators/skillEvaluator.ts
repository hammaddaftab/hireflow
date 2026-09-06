import type { SkillRequirementItem } from "@/entities/job";
import type { SkillDemonstratedItem } from "@/entities/extraction/candidate/aspects/skillsDemonstrated";
import type { EvaluatedSkillRequirement } from "./evaluationStatuses";
import { matchSkill } from "@/features/extraction/skillNormalizer";

export type SkillEvaluatorInput = {
  skills_required?: SkillRequirementItem[] | null;
  skills_preferred?: SkillRequirementItem[] | null;
  skills_demonstrated: SkillDemonstratedItem[];
  skills_declared: string[];
};

export interface SkillEvaluatorOutput {
  evaluations: EvaluatedSkillRequirement[];
  statedSkills: EvaluatedSkillRequirement[];
  notStatedSkills: EvaluatedSkillRequirement[];
  totalSkillsCount: number;
  notStatedCount: number;
  orphanSkillsList: string[];
  orphanSkillsCount: number;
  orphanSkillsFormatted: string;
  derived: {
    unverifiedClaimsBadgeText: string;
    unverifiedClaimsPillText: string;
    unverifiedClaimsDotType: "confirmed" | "gap";
  };
}

export function evaluateSkills(input: SkillEvaluatorInput): SkillEvaluatorOutput {
  const {
    skills_required = [],
    skills_preferred = [],
    skills_demonstrated,
    skills_declared,
  } = input;

  // Assumes normalized candidate skills from extraction pipeline and normalized requirements from job pipeline
  const demonstratedMap = new Map<string, SkillDemonstratedItem>();
  for (const s of skills_demonstrated) {
    demonstratedMap.set(s.skill, s);
  }

  const declaredSet = new Set(skills_declared);

  // Unverified candidate claims: declared in resume but not demonstrated in work history
  const orphanSkillsList = skills_declared.filter((declared) => {
    if (demonstratedMap.has(declared)) return false;
    return !skills_demonstrated.some((item) => matchSkill(declared, item.skill));
  });
  const orphanSkillsCount = orphanSkillsList.length;

  // Matches required skill against candidate's demonstrated list
  function findDemonstrated(skillName: string): SkillDemonstratedItem | undefined {
    // Direct O(1) match on normalized values established at ingress
    const direct = demonstratedMap.get(skillName);
    if (direct) return direct;

    for (const item of skills_demonstrated) {
      if (matchSkill(skillName, item.skill)) {
        return item;
      }
    }
    return undefined;
  }

  // Checks if required skill was declared in candidate's profile
  function isSkillDeclared(skillName: string): boolean {
    if (declaredSet.has(skillName)) return true;
    for (const declared of skills_declared) {
      if (matchSkill(skillName, declared)) {
        return true;
      }
    }
    return false;
  }

  const evaluations: EvaluatedSkillRequirement[] = [];

  function evaluateOne(
    reqItem: SkillRequirementItem,
    isBlocking: boolean,
    id: string
  ): EvaluatedSkillRequirement {
    const skillName = reqItem.skill;
    const demonstrated = findDemonstrated(skillName);

    if (demonstrated) {
      const outcomeAttached = demonstrated.outcome_attached?.trim() || null;
      const hasOutcome = outcomeAttached !== null;
      const isConfirmed = demonstrated.evidence_status === "confirmed";
      const dotType = isConfirmed || hasOutcome ? "confirmed" : "gap";
      const badgeText = hasOutcome
        ? "Outcome Attached"
        : isConfirmed
        ? "Confirmed"
        : "2nd Look";

      return {
        id,
        category: "skill",
        label: skillName,
        blocking: isBlocking,
        status: demonstrated.evidence_status,
        hasOutcome,
        outcome_attached: outcomeAttached,
        isOrphan: false,
        evidence_span: demonstrated.evidence_span,
        reasoning: `Demonstrated with ${demonstrated.syntactic_tier.replace("_", " ")} evidence: "${demonstrated.evidence_span}".`,
        syntactic_tier: demonstrated.syntactic_tier,
        orphanSkills: orphanSkillsList,
        derived: {
          dotType,
          pillText: skillName,
          badgeText,
        },
      };
    }

    const isDeclared = isSkillDeclared(skillName);
    const dotType = isDeclared ? "gap" : "not_stated";
    const badgeText = isDeclared ? "Self-Reported Only" : "Not Stated";

    return {
      id,
      category: "skill",
      label: skillName,
      blocking: isBlocking,
      status: isDeclared ? "ambiguous" : "not_stated",
      hasOutcome: false,
      outcome_attached: null,
      isOrphan: isDeclared,
      evidence_span: null,
      reasoning: isDeclared
        ? "Skill declared in summary/list but lacks extracted behavioral demonstration."
        : "Skill neither demonstrated nor declared in candidate profile.",
      syntactic_tier: null,
      orphanSkills: orphanSkillsList,
      derived: {
        dotType,
        pillText: skillName,
        badgeText,
      },
    };
  }

  // 1. Evaluate required skills
  (skills_required || []).forEach((reqItem, idx) => {
    evaluations.push(evaluateOne(reqItem, true, `req_skill_req_${idx}`));
  });

  // 2. Evaluate preferred skills
  (skills_preferred || []).forEach((prefItem, idx) => {
    evaluations.push(evaluateOne(prefItem, false, `req_skill_pref_${idx}`));
  });

  const statedSkills = evaluations.filter((s) => s.status !== "not_stated");
  const notStatedSkills = evaluations.filter((s) => s.status === "not_stated");

  const orphanPreview = orphanSkillsList.slice(0, 6).join(", ");
  const orphanRemaining =
    orphanSkillsList.length > 6 ? ` +${orphanSkillsList.length - 6} more` : "";
  const orphanSkillsFormatted = orphanPreview
    ? `${orphanPreview}${orphanRemaining}`
    : "";

  return {
    evaluations,
    statedSkills,
    notStatedSkills,
    totalSkillsCount: evaluations.length,
    notStatedCount: notStatedSkills.length,
    orphanSkillsList,
    orphanSkillsCount,
    orphanSkillsFormatted,
    derived: {
      unverifiedClaimsBadgeText: orphanSkillsCount === 0 ? "Satisfied" : "Gap",
      unverifiedClaimsPillText:
        orphanSkillsCount === 0
          ? "all claims verified"
          : `${orphanSkillsCount} unverified ${orphanSkillsCount === 1 ? "claim" : "claims"}`,
      unverifiedClaimsDotType: orphanSkillsCount === 0 ? "confirmed" : "gap",
    },
  };
}

