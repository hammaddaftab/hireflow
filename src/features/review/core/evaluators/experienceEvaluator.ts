import type { MinExperienceRequirement } from "@/entities/job";
import type { WorkHistoryEntry } from "@/entities/extraction/candidate/aspects/workHistory";
import type {
  EvaluatedExperienceRequirement,
  ExperienceStatus,
  EvaluationPair,
} from "./evaluationStatuses";

export type ExperienceEvaluatorInput = EvaluationPair<
  MinExperienceRequirement,
  WorkHistoryEntry[]
>;

export function evaluateExperience(
  input: ExperienceEvaluatorInput,
  id?: string
): EvaluatedExperienceRequirement | null {
  const { requirement: experience_requirement, candidate: work_history_entries } = input;

  // Invariant: If criterion is not active, omit completely
  if (experience_requirement.active === false) {
    return null;
  }

  const minYears = experience_requirement.years ?? 0;
  const isBlocking = Boolean(experience_requirement.blocking);

  // Helper to parse YYYY or YYYY-MM into numeric year and month [1..12]
  const parseDate = (d: string | null | undefined, fallbackMonth = 1) => {
    if (!d) return null;
    const match = d.trim().match(/^(\d{4})(?:-(\d{1,2}))?/);
    if (!match) return null;
    return {
      year: parseInt(match[1], 10),
      month: match[2] ? parseInt(match[2], 10) : fallbackMonth,
    };
  };

  const totalMonths = work_history_entries
    .filter((e) => e.employment_type?.value === "full_time")
    .reduce((acc, entry) => {
      const start = parseDate(entry.start_date, 1);
      if (!start) return acc;

      let end: { year: number; month: number };
      if (entry.is_current || !entry.end_date) {
        const now = new Date();
        end = { year: now.getFullYear(), month: now.getMonth() + 1 };
      } else {
        end = parseDate(entry.end_date, 12) || { year: start.year, month: start.month };
      }

      // Inclusive calendar months: (endYear - startYear) * 12 + (endMonth - startMonth) + 1
      const months = Math.max(1, (end.year - start.year) * 12 + (end.month - start.month) + 1);
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

  const dotType = isPassed ? "confirmed" : "gap";
  const pillText = isPassed
    ? `${verifiedYears} yrs verified experience${minYears > 0 ? ` · needs ${minYears}+` : ""}`
    : `${verifiedYears} / ${minYears} yrs exp`;
  const badgeText = isPassed ? "Confirmed" : "Gap";

  return {
    id: "req_exp",
    category: "experience",
    label: `${minYears}+ Yrs Exp`,
    blocking: isBlocking,
    status,
    evidence_span: work_history_entries[0]?.raw_description || null,
    reasoning,
    verifiedYears,
    minYears,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

