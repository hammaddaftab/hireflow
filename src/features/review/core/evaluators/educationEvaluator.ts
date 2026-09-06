import type { EducationRequirement } from "@/entities/job";
import type { EducationEntry } from "@/entities/extraction/candidate/aspects/education";
import type {
  EvaluatedEducationRequirement,
  EducationStatus,
  EvaluationPair,
} from "./evaluationStatuses";
import { isFieldEquivalent, normalizeFieldOfStudy } from "@/features/extraction/fieldOfStudyNormalizer";

const DEGREE_LEVEL_RANKS: Record<string, number> = {
  high_school: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

export type EducationEvaluatorInput = EvaluationPair<
  EducationRequirement,
  EducationEntry[]
>;

export function evaluateEducation(
  input: EducationEvaluatorInput,
  id?: string
): EvaluatedEducationRequirement | null {
  const { requirement: education_requirement, candidate: education_entries } = input;

  // Invariant: If criterion is not active, omit completely
  if (education_requirement.active === false) {
    return null;
  }

  const requiredDegree = education_requirement.degree_level || null;
  const requiredRank = requiredDegree ? DEGREE_LEVEL_RANKS[requiredDegree] || 3 : 0;
  const requiredField = education_requirement.field?.trim() || null;
  const isBlocking = Boolean(education_requirement.blocking);

  const completedDegrees = education_entries.filter((e) => !e.is_current);
  const hasEducation = education_entries.length > 0;

  // Best completed degree satisfying tier rank
  const tierSatisfyingDegrees = completedDegrees.filter((entry) => {
    const rank = entry.degree_level.normalized ? DEGREE_LEVEL_RANKS[entry.degree_level.normalized] || 0 : 0;
    return rank >= requiredRank;
  });

  // Check if any tier-satisfying degree also satisfies field requirement
  const matchingDegree = tierSatisfyingDegrees.find((entry) => {
    if (!requiredField) return true;
    const candField = entry.field.normalized || normalizeFieldOfStudy(entry.field.raw);
    if (!candField) return false;
    return isFieldEquivalent(requiredField, candField);
  });

  let status: EducationStatus = "not_stated";
  let reasoning = "No completed degree found matching requirement.";

  if (matchingDegree) {
    status = "confirmed";
    const degText = matchingDegree.degree_level.raw || matchingDegree.degree_level.normalized || "Degree";
    const fieldText = matchingDegree.field.normalized || matchingDegree.field.raw || "";
    const detail = fieldText ? `${degText} in ${fieldText}` : degText;
    reasoning = requiredField
      ? `Completed degree (${detail}) meets required education criteria.`
      : `Highest completed degree tier (${degText}) meets or exceeds required ${requiredDegree || "degree"}.`;
  } else if (tierSatisfyingDegrees.length > 0 && requiredField) {
    // Degree tier was met, but field of study mismatched
    const candidateDegree = tierSatisfyingDegrees[0];
    const degText = candidateDegree.degree_level.raw || candidateDegree.degree_level.normalized || "Degree";
    const candField = candidateDegree.field.normalized || candidateDegree.field.raw;

    if (candField) {
      status = isBlocking ? "contradicted" : "ambiguous";
      const action = isBlocking ? "contradicts required" : "does not match preferred";
      reasoning = `Degree tier met (${degText}), but field (${candField}) ${action} ${requiredField}.`;
    } else {
      status = "ambiguous";
      reasoning = `Degree tier met (${degText}), but field of study is not stated (required: ${requiredField}).`;
    }
  } else if (completedDegrees.length > 0 && requiredRank > 0) {
    // Has completed degree but does not meet tier level
    const highestDegree = completedDegrees.reduce((best, cur) => {
      const curRank = cur.degree_level.normalized ? DEGREE_LEVEL_RANKS[cur.degree_level.normalized] || 0 : 0;
      const bestRank = best.degree_level.normalized ? DEGREE_LEVEL_RANKS[best.degree_level.normalized] || 0 : 0;
      return curRank >= bestRank ? cur : best;
    }, completedDegrees[0]);
    const degText = highestDegree.degree_level.raw || highestDegree.degree_level.normalized || "Degree";
    status = "contradicted";
    reasoning = `Highest completed degree tier (${degText}) does not meet required ${requiredDegree}.`;
  } else if (education_entries.some((e) => e.is_current)) {
    status = "ambiguous";
    reasoning = "Candidate is currently enrolled in degree program (in-progress).";
  } else if (completedDegrees.length > 0) {
    status = "confirmed";
    reasoning = `Completed degree: ${completedDegrees[0]?.degree_level.raw || "Degree"}.`;
  }

  const dotType =
    status === "confirmed"
      ? "confirmed"
      : status === "contradicted"
      ? "contradicted"
      : status === "ambiguous"
      ? "gap"
      : "not_stated";

  const labelParts = [
    requiredDegree ? `Degree: ${requiredDegree}` : null,
    requiredField ? `Field: ${requiredField}` : null,
  ].filter(Boolean);
  const label = labelParts.length > 0 ? labelParts.join(" · ") : "Education";

  const primaryEvidence = matchingDegree
    ? [matchingDegree.degree_level.raw, matchingDegree.field.raw].filter(Boolean).join(" in ")
    : completedDegrees[0]?.degree_level.raw || education_entries[0]?.degree_level.raw || null;

  const pillText = primaryEvidence || label;
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Contradicted"
      : status === "ambiguous"
      ? (education_entries.some((e) => e.is_current) ? "In Progress" : "Ambiguous")
      : "Not Stated";

  return {
    id: id || "req_edu",
    category: "education",
    label,
    blocking: isBlocking,
    status,
    evidence_span: primaryEvidence,
    reasoning,
    hasEducation,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

