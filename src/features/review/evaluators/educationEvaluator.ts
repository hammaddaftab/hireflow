import type { EducationRequirement } from "@/entities/job";
import type { EducationEntry } from "@/entities/extraction/candidate/aspects/education";
import type { EvaluatedEducationRequirement, EducationStatus } from "./evaluationStatuses";

const DEGREE_LEVEL_RANKS: Record<string, number> = {
  high_school: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

export type EducationEvaluatorInput = {
  education_requirement: EducationRequirement | null;
  education_entries: EducationEntry[];
  id?: string;
};

export function evaluateEducation(input: EducationEvaluatorInput): EvaluatedEducationRequirement {
  const { education_requirement, education_entries, id } = input;
  const requiredDegree = education_requirement?.degree_level || null;
  const requiredRank = requiredDegree ? DEGREE_LEVEL_RANKS[requiredDegree] || 3 : 0;
  const isBlocking = Boolean(education_requirement?.blocking);

  const completedDegrees = education_entries.filter((e) => !e.is_current);
  const candHighestDegree = completedDegrees.reduce<number>((highest, entry) => {
    const rank = entry.degree_level.normalized ? DEGREE_LEVEL_RANKS[entry.degree_level.normalized] || 0 : 0;
    return Math.max(highest, rank);
  }, 0);

  let status: EducationStatus = "not_stated";
  let reasoning = "No completed degree found matching requirement.";
  const primaryEvidence = completedDegrees[0]?.degree_level.raw || education_entries[0]?.degree_level.raw || null;

  if (candHighestDegree >= requiredRank && requiredRank > 0) {
    status = "confirmed";
    reasoning = `Highest completed degree tier (${completedDegrees[0]?.degree_level.raw}) meets or exceeds required ${requiredDegree}.`;
  } else if (education_entries.some((e) => e.is_current)) {
    status = "ambiguous";
    reasoning = "Candidate is currently enrolled in degree program (in-progress).";
  } else if (completedDegrees.length > 0) {
    status = requiredRank > 0 ? "contradicted" : "confirmed";
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

  const pillText = primaryEvidence || (requiredDegree ? `Degree: ${requiredDegree}` : "Education");
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Contradicted"
      : status === "ambiguous"
      ? "In Progress"
      : "Not Stated";

  const hasEducation = education_entries.length > 0;

  return {
    id: id || "req_edu",
    category: "education",
    label: requiredDegree ? `Degree: ${requiredDegree}` : "Education",
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

