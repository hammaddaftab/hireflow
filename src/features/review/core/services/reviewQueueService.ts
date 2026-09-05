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
  job: Job
): CandidateReviewItem[] {
  const items: CandidateReviewItem[] = candidates.map((candidate) => {
    // 1. Experience Evaluation
    const experience = evaluateExperience({
      experience_requirement: job.min_experience || null,
      work_history_entries: candidate.work_history.entries,
    });

    // 2. Skills Evaluation
    const skills = evaluateSkills({
      skills_required: job.skills_required,
      skills_preferred: job.skills_preferred,
      skills_demonstrated: candidate.skills_demonstrated.skills,
      skills_declared: candidate.skills_declared.skills_declared,
    });

    // 3. Education Evaluation
    const education = evaluateEducation({
      education_requirement: job.education_min || null,
      education_entries: candidate.education.entries,
      id: "req_edu",
    });

    // 4. Logistics Evaluation (compensation, notice, work mode, location)
    const logistics = evaluateLogistics({
      compensation_requirement: job.compensation_band || null,
      salary_expectation: candidate.logistics.salary_expectation,
      notice_period_requirement: job.max_notice_period || null,
      notice_period: candidate.logistics.notice_period,
      work_mode_requirement: job.work_mode || null,
      stated_relocation_willingness: candidate.logistics.stated_relocation_willingness,
      location_requirement: job.location_requirement || null,
      normalized_location: candidate.identity.location,
    });

    const evaluations: EvaluatedRequirement[] = [
      experience,
      ...skills.evaluations,
      education,
      ...logistics.evaluations,
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

    const verifiedYears = experience.verifiedYears;

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
