import type { SkillRequirementItem } from "@/entities/job";
import type { SkillDemonstratedItem } from "@/entities/extraction/candidate/aspects/skillsDemonstrated";
import type { EvaluatedSkillRequirement } from "./evaluationStatuses";

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
  unverifiedClaimsBadge: "Satisfied" | "Gap";
  unverifiedClaimsPillText: string;
  unverifiedClaimsDotType: "confirmed" | "gap";
}

export function evaluateSkills(input: SkillEvaluatorInput): SkillEvaluatorOutput {
  const {
    skills_required = [],
    skills_preferred = [],
    skills_demonstrated,
    skills_declared,
  } = input;

  const demonstratedMap = new Map<string, SkillDemonstratedItem>();
  for (const s of skills_demonstrated) {
    demonstratedMap.set(s.skill.toLowerCase(), s);
  }

  const declaredSet = new Set(skills_declared.map((s) => s.toLowerCase()));

  // Unverified candidate claims: declared in resume but not demonstrated in work history
  const orphanSkillsList = skills_declared.filter(
    (s) => !demonstratedMap.has(s.toLowerCase())
  );
  const orphanSkillsCount = orphanSkillsList.length;

  const evaluations: EvaluatedSkillRequirement[] = [];

  function evaluateOne(
    reqItem: SkillRequirementItem,
    isBlocking: boolean,
    id: string
  ): EvaluatedSkillRequirement {
    const skillName = reqItem.skill;
    const demonstrated = demonstratedMap.get(skillName.toLowerCase());

    if (demonstrated) {
      const outcomeAttached = demonstrated.outcome_attached?.trim() || null;
      const hasOutcome = outcomeAttached !== null;
      const isConfirmed = demonstrated.evidence_status === "confirmed";

      return {
        id,
        category: "skill",
        label: skillName,
        blocking: isBlocking,
        status: demonstrated.evidence_status,
        dotType: isConfirmed || hasOutcome ? "confirmed" : "gap",
        hasOutcome,
        outcome_attached: outcomeAttached,
        isOrphan: false,
        badgeText: hasOutcome
          ? "Outcome Attached"
          : isConfirmed
          ? "Confirmed"
          : "2nd Look",
        badgeVariant: isConfirmed || hasOutcome ? "confirmed" : "gap",
        evidence_span: demonstrated.evidence_span,
        reasoning: `Demonstrated with ${demonstrated.syntactic_tier.replace("_", " ")} evidence: "${demonstrated.evidence_span}".`,
        syntactic_tier: demonstrated.syntactic_tier,
        orphanSkills: orphanSkillsList,
      };
    }

    const isDeclared = declaredSet.has(skillName.toLowerCase());
    return {
      id,
      category: "skill",
      label: skillName,
      blocking: isBlocking,
      status: isDeclared ? "ambiguous" : "not_stated",
      dotType: isDeclared ? "gap" : "not_stated",
      hasOutcome: false,
      outcome_attached: null,
      isOrphan: isDeclared,
      badgeText: isDeclared ? "Self-Reported Only" : "Not Stated",
      badgeVariant: "gap",
      evidence_span: null,
      reasoning: isDeclared
        ? "Skill declared in summary/list but lacks extracted behavioral demonstration."
        : "Skill neither demonstrated nor declared in candidate profile.",
      syntactic_tier: null,
      orphanSkills: orphanSkillsList,
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
    unverifiedClaimsBadge: orphanSkillsCount === 0 ? "Satisfied" : "Gap",
    unverifiedClaimsPillText:
      orphanSkillsCount === 0
        ? "all claims verified"
        : `${orphanSkillsCount} unverified ${orphanSkillsCount === 1 ? "claim" : "claims"}`,
    unverifiedClaimsDotType: orphanSkillsCount === 0 ? "confirmed" : "gap",
  };
}

