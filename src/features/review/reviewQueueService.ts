import { Job } from "../jobs/types";
import { ParsedCandidateProfile } from "../candidates/types";
import { BlockingRequirementItem, CandidateReviewItem } from "./types";

const DEGREE_LEVEL_RANKS: Record<string, number> = {
  high_school: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

function noticeToDays(value: number | null, unit: string | null): number | null {
  if (value === null || !unit) return null;
  switch (unit) {
    case "days":
      return value;
    case "weeks":
      return value * 7;
    case "months":
      return value * 30;
    default:
      return value;
  }
}

/**
 * Builds review queue items from candidate profiles and job requirements,
 * with real deterministic checks for skills, experience, compensation band,
 * notice period, and education tier as specified in ui-local.md.
 */
export function buildReviewQueue(
  candidates: ParsedCandidateProfile[],
  job: Job
): CandidateReviewItem[] {
  const items: CandidateReviewItem[] = candidates.map((candidate) => {
    const blockingItems: BlockingRequirementItem[] = [];

    // 1. Min Experience Knockout
    const totalMonths = candidate.work_history.entries
      .filter((e) => e.employment_type.value === "full_time")
      .reduce((acc, entry) => {
        const start = new Date(entry.start_date).getTime();
        const end = entry.end_date ? new Date(entry.end_date).getTime() : Date.now();
        const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.4375)));
        return acc + months;
      }, 0);
    const verifiedYears = Math.round((totalMonths / 12) * 10) / 10;
    const minExpRequired = job.hardCriteria.minYearsExperience || 0;
    const expPassed = verifiedYears >= minExpRequired;

    blockingItems.push({
      id: "req_exp",
      label: `${minExpRequired}+ Yrs Exp`,
      category: "experience",
      status: expPassed ? "confirmed" : "contradicted",
      evidence_span: candidate.work_history.entries[0]?.raw_description || null,
      reasoning: expPassed
        ? `${verifiedYears} yrs verified full-time experience across ${candidate.work_history.entries.length} roles.`
        : `Only ${verifiedYears} yrs verified full-time experience (requires ${minExpRequired} yrs).`,
    });

    // 2. Mandatory Skills Knockouts
    job.hardCriteria.mandatorySkills.forEach((skillName, idx) => {
      const demonstrated = candidate.skills_demonstrated.skills.find(
        (s) => s.skill.toLowerCase() === skillName.toLowerCase()
      );

      if (demonstrated) {
        blockingItems.push({
          id: `req_skill_${idx}`,
          label: skillName,
          category: "skill",
          status: demonstrated.evidence_status,
          evidence_span: demonstrated.evidence_span,
          reasoning: `Demonstrated with ${demonstrated.syntactic_tier.replace("_", " ")} evidence: "${demonstrated.evidence_span}".`,
        });
      } else {
        const isDeclared = candidate.skills_declared.skills_declared.some(
          (s) => s.toLowerCase() === skillName.toLowerCase()
        );

        blockingItems.push({
          id: `req_skill_${idx}`,
          label: skillName,
          category: "skill",
          status: isDeclared ? "ambiguous" : "not_stated",
          evidence_span: null,
          reasoning: isDeclared
            ? `Declared in skill section, but zero verified action-verbs in work history (orphan claim).`
            : `Skill was never mentioned anywhere in the document.`,
        });
      }
    });

    // 3. Dealbreaker Custom Requirements
    job.customRequirements
      .filter((r) => r.isDealbreaker)
      .forEach((dealbreaker) => {
        const match = candidate.skills_demonstrated.skills.find(
          (s) =>
            s.skill.toLowerCase().includes(dealbreaker.category.toLowerCase()) ||
            dealbreaker.description.toLowerCase().includes(s.skill.toLowerCase())
        );

        if (match) {
          blockingItems.push({
            id: dealbreaker.id,
            label: dealbreaker.category,
            category: "dealbreaker",
            status: match.evidence_status,
            evidence_span: match.evidence_span,
            reasoning: `Demonstrated in work experience: "${match.skill}".`,
          });
        } else {
          blockingItems.push({
            id: dealbreaker.id,
            label: dealbreaker.category,
            category: "dealbreaker",
            status: "not_stated",
            evidence_span: null,
            reasoning: `No evidence found in candidate profile for dealbreaker requirement.`,
          });
        }
      });

    // 4. Deterministic Compensation Band Knockout (Layer 1 Upgrade)
    if (job.compensation_band?.blocking && job.compensation_band.max !== null) {
      const candSalary = candidate.logistics.salary_expectation.normalized;
      let salaryStatus: "confirmed" | "contradicted" | "not_stated" = "not_stated";
      let reasoning = "Candidate did not state a compensation expectation.";

      if (candSalary && candSalary.min !== null) {
        // Approximate currency alignment for comparison if needed
        let candMinInJobCurrency = candSalary.min;
        if (candSalary.currency === "USD" && job.compensation_band.currency === "PKR") {
          candMinInJobCurrency = candSalary.min * 278; // Conversion rate approx
        }

        if (candMinInJobCurrency <= job.compensation_band.max) {
          salaryStatus = "confirmed";
          reasoning = `Salary expectation (${candSalary.min} ${candSalary.currency}) is within budget ceiling (${job.compensation_band.max} ${job.compensation_band.currency}).`;
        } else {
          salaryStatus = "contradicted";
          reasoning = `Salary expectation (${candSalary.min} ${candSalary.currency}) exceeds budget ceiling (${job.compensation_band.max} ${job.compensation_band.currency}).`;
        }
      }

      blockingItems.push({
        id: "req_comp",
        label: `Max ${job.compensation_band.max.toLocaleString()} ${job.compensation_band.currency}`,
        category: "dealbreaker",
        status: salaryStatus,
        evidence_span: candidate.logistics.salary_expectation.raw,
        reasoning,
      });
    }

    // 5. Deterministic Notice Period Knockout (Layer 1 Upgrade)
    if (job.max_notice_period?.blocking && job.max_notice_period.value !== null) {
      const candNotice = candidate.logistics.notice_period.normalized;
      const jobMaxDays = noticeToDays(job.max_notice_period.value, job.max_notice_period.unit);
      let noticeStatus: "confirmed" | "contradicted" | "not_stated" = "not_stated";
      let reasoning = "Candidate did not state a notice period.";

      if (candNotice && candNotice.value !== null && jobMaxDays !== null) {
        const candDays = noticeToDays(candNotice.value, candNotice.unit);
        if (candDays !== null && candDays <= jobMaxDays) {
          noticeStatus = "confirmed";
          reasoning = `Notice period (${candNotice.value} ${candNotice.unit}) satisfies max notice requirement (${job.max_notice_period.value} ${job.max_notice_period.unit}).`;
        } else {
          noticeStatus = "contradicted";
          reasoning = `Notice period (${candNotice.value} ${candNotice.unit}) exceeds max requirement (${job.max_notice_period.value} ${job.max_notice_period.unit}).`;
        }
      }

      blockingItems.push({
        id: "req_notice",
        label: `Notice ≤ ${job.max_notice_period.value} ${job.max_notice_period.unit}`,
        category: "dealbreaker",
        status: noticeStatus,
        evidence_span: candidate.logistics.notice_period.raw,
        reasoning,
      });
    }

    // 6. Deterministic Education Minimum Tier Knockout
    if (job.education_min?.blocking && job.education_min.degree_level) {
      const requiredRank = DEGREE_LEVEL_RANKS[job.education_min.degree_level] || 3;
      const completedDegrees = candidate.education.entries.filter((e) => !e.is_current);
      const candHighestDegree = completedDegrees.reduce<number>((highest, entry) => {
        const rank = entry.degree_level.normalized ? DEGREE_LEVEL_RANKS[entry.degree_level.normalized] || 0 : 0;
        return Math.max(highest, rank);
      }, 0);

      let eduStatus: "confirmed" | "contradicted" | "ambiguous" | "not_stated" = "not_stated";
      let reasoning = "No completed degree found matching requirement.";

      if (candHighestDegree >= requiredRank) {
        eduStatus = "confirmed";
        reasoning = `Highest completed degree tier (${completedDegrees[0]?.degree_level.raw}) meets or exceeds required ${job.education_min.degree_level}.`;
      } else if (candidate.education.entries.some((e) => e.is_current)) {
        eduStatus = "ambiguous";
        reasoning = `Candidate is currently enrolled in degree program (in-progress).`;
      } else if (completedDegrees.length > 0) {
        eduStatus = "contradicted";
        reasoning = `Highest completed degree tier is below required ${job.education_min.degree_level}.`;
      }

      blockingItems.push({
        id: "req_edu",
        label: `Degree: ${job.education_min.degree_level}`,
        category: "dealbreaker",
        status: eduStatus,
        evidence_span: candidate.education.entries[0]?.degree_level.raw || null,
        reasoning,
      });
    }

    // Secondary badges: Orphan skills checklist
    const demonstratedNames = new Set(
      candidate.skills_demonstrated.skills.map((s) => s.skill.toLowerCase())
    );
    const orphanSkillsList = candidate.skills_declared.skills_declared.filter(
      (s) => !demonstratedNames.has(s.toLowerCase())
    );

    // Secondary badges: Extended Logistics not_stated checklist
    // stated_relocation_willingness and stated_availability, being unnormalized bare strings,
    // join this checklist as follow-up items rather than blocking strip items.
    const logisticsNotStatedList: string[] = [];
    if (!candidate.logistics.salary_expectation.normalized) {
      logisticsNotStatedList.push("Salary expectation: not stated");
    }
    if (!candidate.logistics.notice_period.normalized) {
      logisticsNotStatedList.push("Notice period: not stated");
    }
    if (
      !candidate.logistics.stated_relocation_willingness ||
      candidate.logistics.stated_relocation_willingness.toLowerCase() === "not_stated"
    ) {
      logisticsNotStatedList.push("Relocation willingness: not stated");
    }
    if (
      !candidate.logistics.stated_availability ||
      candidate.logistics.stated_availability.toLowerCase() === "not_stated"
    ) {
      logisticsNotStatedList.push("Availability: not stated");
    }

    const isAllBlockingConfirmed = blockingItems.every((b) => b.status === "confirmed");
    const hasContradicted = blockingItems.some((b) => b.status === "contradicted");
    const hasAmbiguous = blockingItems.some((b) => b.status === "ambiguous" || b.status === "not_stated");

    return {
      candidate,
      blockingItems,
      isAllBlockingConfirmed,
      hasContradicted,
      hasAmbiguous,
      orphanSkillsCount: orphanSkillsList.length,
      orphanSkillsList,
      logisticsNotStatedCount: logisticsNotStatedList.length,
      logisticsNotStatedList,
      verifiedYearsExperience: verifiedYears,
      decision: "pending",
    };
  });

  // Queue ordering (ui-local.md: Time-minimization lever)
  // Contiguous all-blocking-confirmed cards first for fast clearance,
  // followed by cards with ambiguous/not_stated, then contradicted.
  return items.sort((a, b) => {
    if (a.isAllBlockingConfirmed && !b.isAllBlockingConfirmed) return -1;
    if (!a.isAllBlockingConfirmed && b.isAllBlockingConfirmed) return 1;
    if (!a.hasContradicted && b.hasContradicted) return -1;
    if (a.hasContradicted && !b.hasContradicted) return 1;
    return 0;
  });
}

/**
 * Calculates distinct normalized cities present in candidate pool,
 * sorted descending by count, with nulls grouped into 'Unspecified'.
 */
export function getCityDistribution(items: CandidateReviewItem[]): { city: string; count: number }[] {
  const counts: Record<string, number> = {};

  items.forEach((item) => {
    const city = item.candidate.identity.location.normalized?.city || "Unspecified";
    counts[city] = (counts[city] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}
