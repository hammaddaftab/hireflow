import type { MinExperienceRequirement } from "@/entities/job";
import type { WorkHistoryEntry } from "@/entities/extraction/candidate/aspects/workHistory";
import type {
  EvaluatedExperienceRequirement,
  ExperienceStatus,
} from "./evaluationStatuses";

export type ExperienceEvaluatorInput = {
  experience_requirement: MinExperienceRequirement | null;
  work_history_entries: WorkHistoryEntry[];
};

export function evaluateExperience(
  input: ExperienceEvaluatorInput
): EvaluatedExperienceRequirement {
  const { experience_requirement, work_history_entries } = input;
  const minYears = experience_requirement?.years ?? 0;
  const isBlocking = Boolean(experience_requirement?.blocking);

  const totalMonths = work_history_entries
    .filter((e) => e.employment_type?.value === "full_time")
    .reduce((acc, entry) => {
      const start = new Date(entry.start_date).getTime();
      const end = entry.end_date ? new Date(entry.end_date).getTime() : Date.now();
      const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.4375)));
      return acc + months;
    }, 0);

  const verifiedYears = Math.round((totalMonths / 12) * 10) / 10;
  const isPassed = verifiedYears >= minYears;
  const status: ExperienceStatus = isPassed ? "confirmed" : "contradicted";

  const fullTimeRolesCount = work_history_entries
    .filter((e) => e.employment_type?.value === "full_time")
    .length;

  const reasoning = isPassed
    ? `${verifiedYears} yrs verified full-time experience across ${fullTimeRolesCount} roles.`
    : `Only ${verifiedYears} yrs verified full-time experience (requires ${minYears} yrs).`;

  return {
    id: "req_exp",
    category: "experience",
    label: `${minYears}+ Yrs Exp`,
    blocking: isBlocking,
    status,
    evidence_span: work_history_entries[0]?.raw_description || null,
    reasoning,
    verifiedYears,
  };
}

