import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { CandidateReviewItem, EvaluatedRequirement } from "../../types";
import { evaluateExperience } from "../evaluators/experienceEvaluator";
import { evaluateSkills } from "../evaluators/skillEvaluator";
import { evaluateEducation } from "../evaluators/educationEvaluator";
import { evaluateLogistics } from "../evaluators/logisticsEvaluator";
import { sortReviewQueue, getCityDistribution } from "../utils/queueCalculations";

export { getCityDistribution };

/**
 * Builds review queue items from candidate profiles and job requirements,
 * evaluating requirements with modular domain evaluators.
 */
export function buildReviewQueue(
  candidates: ParsedCandidateProfile[],
  rawJob: Job
): CandidateReviewItem[] {
  const job: Job = {
    ...rawJob,
    skills_required: (rawJob.skills_required || []).map((s) =>
      s.active === false
        ? { ...s, active: false as const }
        : {
            ...s,
            active: true as const,
            skill: "skill" in s && typeof s.skill === "string" ? s.skill : "",
            blocking: s.blocking ?? true,
          }
    ),
    skills_preferred: (rawJob.skills_preferred || []).map((s) =>
      s.active === false
        ? { ...s, active: false as const }
        : {
            ...s,
            active: true as const,
            skill: "skill" in s && typeof s.skill === "string" ? s.skill : "",
            blocking: s.blocking ?? false,
          }
    ),
    min_experience: rawJob.min_experience
      ? (rawJob.min_experience.active === false ? { active: false as const, blocking: rawJob.min_experience.blocking } : { ...rawJob.min_experience, active: true as const })
      : { active: false as const, blocking: false },
    education_min: rawJob.education_min
      ? (rawJob.education_min.active === false ? { active: false as const, blocking: rawJob.education_min.blocking } : { ...rawJob.education_min, active: true as const })
      : { active: false as const, blocking: false },
    location_requirement: rawJob.location_requirement
      ? (rawJob.location_requirement.active === false ? { active: false as const, blocking: rawJob.location_requirement.blocking } : { ...rawJob.location_requirement, active: true as const })
      : { active: false as const, blocking: false },
    work_mode: rawJob.work_mode
      ? (rawJob.work_mode.active === false ? { active: false as const, blocking: rawJob.work_mode.blocking } : { ...rawJob.work_mode, active: true as const })
      : { active: false as const, blocking: false },
    compensation_band: rawJob.compensation_band
      ? (rawJob.compensation_band.active === false ? { active: false as const, blocking: rawJob.compensation_band.blocking } : { ...rawJob.compensation_band, active: true as const })
      : { active: false as const, blocking: false },
    max_notice_period: rawJob.max_notice_period
      ? (rawJob.max_notice_period.active === false ? { active: false as const, blocking: rawJob.max_notice_period.blocking } : { ...rawJob.max_notice_period, active: true as const })
      : { active: false as const, blocking: false },
  };

  const items: CandidateReviewItem[] = candidates.map((candidate) => {
    // 1. Experience Evaluation
    const experience = evaluateExperience({
      requirement: job.min_experience,
      candidate: candidate.work_history.entries,
    });

    // 2. Skills Evaluation
    const candidateSkillsContext = {
      demonstrated: candidate.skills_demonstrated.skills,
      declared: candidate.skills_declared.skills_declared,
    };

    const hasActiveRequired = (job.skills_required || []).some((s) => s.active !== false);
    const hasActivePreferred = (job.skills_preferred || []).some((s) => s.active !== false);

    const skills = evaluateSkills({
      requiredSkills: {
        requirement: hasActiveRequired
          ? {
              active: true,
              blocking: true,
              items: job.skills_required.filter((s) => s.active !== false),
            }
          : { active: false },
        candidate: candidateSkillsContext,
      },
      preferredSkills: {
        requirement: hasActivePreferred
          ? {
              active: true,
              blocking: false,
              items: job.skills_preferred.filter((s) => s.active !== false),
            }
          : { active: false },
        candidate: candidateSkillsContext,
      },
    });

    // 3. Education Evaluation
    const education = evaluateEducation(
      {
        requirement: job.education_min,
        candidate: candidate.education.entries,
      },
      "req_edu"
    );

    // 4. Logistics Evaluation (compensation, notice, work mode, location)
    const logistics = evaluateLogistics({
      compensation: {
        requirement: job.compensation_band,
        candidate: candidate.logistics.salary_expectation,
      },
      noticePeriod: {
        requirement: job.max_notice_period,
        candidate: candidate.logistics.notice_period,
      },
      location: {
        requirement: job.location_requirement,
        candidate: {
          normalized_location: candidate.identity.location,
          stated_relocation_willingness: candidate.logistics.stated_relocation_willingness,
        },
      },
      workMode: {
        requirement: job.work_mode,
        candidate: {
          normalized_location: candidate.identity.location,
          stated_relocation_willingness: candidate.logistics.stated_relocation_willingness,
          target_location: job.location_requirement,
        },
      },
    });

    const evaluations: EvaluatedRequirement[] = [
      ...(experience ? [experience] : []),
      ...(skills ? skills.evaluations : []),
      ...(education ? [education] : []),
      ...(logistics ? logistics.evaluations : []),
    ];

    // 5. Knockout sorting metrics
    const blockingItems = evaluations.filter((e) => e.blocking);
    const isAllBlockingConfirmed =
      blockingItems.length > 0
        ? blockingItems.every((b) => b.status === "confirmed")
        : true;
    const hasContradicted = blockingItems.some((b) => b.status === "contradicted");
    const hasAmbiguous = blockingItems.some(
      (b) => b.status === "ambiguous" || b.status === "not_stated"
    );

    const verifiedYears = experience?.verifiedYears ?? 0;

    return {
      candidate,
      jobId: job.id,
      evaluations,
      experience,
      skills,
      education,
      logistics,
      decision: "pending",

      // Queue metrics and sort metadata
      blockingItems,
      isAllBlockingConfirmed,
      hasContradicted,
      hasAmbiguous,
      verifiedYearsExperience: verifiedYears,
      compensationBand: job.compensation_band || null,
    };
  });

  return sortReviewQueue(items);
}
