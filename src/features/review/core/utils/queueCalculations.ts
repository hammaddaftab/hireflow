import type { CandidateReviewItem, QueryGroup } from "../../types";
import type { QueueFilterTab } from "@/entities/review";
import { isDefaultGroup } from "./reviewQueryParams";

export interface ReviewStats {
  totalCount: number;
  decisionsMade: number;
  keptCount: number;
  flaggedCount: number;
  passedCount: number;
  fastClearCount: number;
}

export interface TabCounts {
  all: number;
  fastClear: number;
  needsAttention: number;
  contradicted: number;
}

export interface QueueFilterOptions {
  selectedGroupId?: string | null;
  selectedCity?: string | null;
  activeTab?: QueueFilterTab;
  queryGroups?: QueryGroup[];
  experienceRange?: [number, number] | null;
  salaryRange?: [number, number] | null;
  includeUnstatedSalary?: boolean;
  targetCurrency?: string;
}

// Formats compact monetary values (e.g. 50k, 500k, 1M)
export function formatSalaryNumber(num: number): string {
  if (num >= 1000000) {
    const val = (num / 1000000).toFixed(1).replace(/\.0$/, "");
    return `${val}M`;
  }
  if (num >= 1000) {
    const val = (num / 1000).toFixed(0);
    return `${val}k`;
  }
  return num.toLocaleString();
}

// Calculates verified or inferred total years of full-time experience for candidate
export function getCandidateExperienceYears(item: CandidateReviewItem): number {
  if (item.verifiedYearsExperience != null && item.verifiedYearsExperience > 0) {
    return item.verifiedYearsExperience;
  }
  const entries = item.candidate.work_history?.entries || [];
  const totalMonths = entries.reduce((acc, entry) => {
    const start = new Date(entry.start_date).getTime();
    const end = entry.end_date ? new Date(entry.end_date).getTime() : Date.now();
    if (isNaN(start)) return acc;
    const validEnd = isNaN(end) ? Date.now() : end;
    const months = Math.max(1, Math.round((validEnd - start) / (1000 * 60 * 60 * 24 * 30.4375)));
    return acc + months;
  }, 0);
  return totalMonths > 0 ? Math.round((totalMonths / 12) * 10) / 10 : 0;
}

// Normalizes candidate salary expectation into target currency (default PKR, rate 278)
export function getCandidateNormalizedSalary(
  item: CandidateReviewItem,
  targetCurrency = "PKR"
): { min: number; max: number; isStated: boolean } {
  const norm = item.candidate.logistics?.salary_expectation?.normalized;
  if (!norm || (norm.min === null && norm.max === null)) {
    return { min: 0, max: 0, isStated: false };
  }
  const curr = norm.currency || targetCurrency;
  const rate =
    curr === "USD" && targetCurrency === "PKR"
      ? 278
      : curr === "PKR" && targetCurrency === "USD"
      ? 1 / 278
      : 1;
  const minVal = (norm.min ?? norm.max!) * rate;
  const maxVal = (norm.max ?? norm.min!) * rate;
  return {
    min: Math.round(minVal),
    max: Math.round(maxVal),
    isStated: true,
  };
}

// Determines experience range bounds across candidate items
export function calculateExperienceBounds(
  items: CandidateReviewItem[]
): { min: number; max: number; step: number } {
  let highest = 15;
  items.forEach((item) => {
    const exp = getCandidateExperienceYears(item);
    if (exp > highest) highest = Math.ceil(exp);
  });
  return {
    min: 0,
    max: Math.max(15, highest),
    step: 1,
  };
}

// Determines salary range bounds across candidate items and active job
export function calculateSalaryBounds(
  items: CandidateReviewItem[],
  targetCurrency = "PKR"
): { min: number; max: number; step: number; currency: string } {
  const isUSD = targetCurrency === "USD";
  const defaultMax = isUSD ? 250000 : 1000000;
  const defaultStep = isUSD ? 5000 : 25000;

  let highest = defaultMax;
  items.forEach((item) => {
    const { max } = getCandidateNormalizedSalary(item, targetCurrency);
    if (max > highest) highest = max;
  });

  const roundedMax = Math.ceil(highest / defaultStep) * defaultStep;
  return {
    min: 0,
    max: roundedMax,
    step: defaultStep,
    currency: targetCurrency,
  };
}


/**
 * Calculates distinct normalized cities present in candidate pool,
 * sorted descending by count, with nulls grouped into "Unspecified".
 */
export function getCityDistribution(
  items: CandidateReviewItem[]
): Array<{ city: string; count: number }> {
  const counts: Record<string, number> = {};

  items.forEach((item) => {
    const city = item.candidate.identity.location.normalized?.city || "Unspecified";
    counts[city] = (counts[city] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Contiguous all-blocking-confirmed cards first for fast clearance,
 * followed by cards without contradictions, then contradicted cards.
 */
export function sortReviewQueue(items: CandidateReviewItem[]): CandidateReviewItem[] {
  return [...items].sort((a, b) => {
    if (a.isAllBlockingConfirmed && !b.isAllBlockingConfirmed) return -1;
    if (!a.isAllBlockingConfirmed && b.isAllBlockingConfirmed) return 1;
    if (!a.hasContradicted && b.hasContradicted) return -1;
    if (a.hasContradicted && !b.hasContradicted) return 1;
    return 0;
  });
}

/**
 * Calculates aggregate review decision metrics across the entire queue.
 */
export function calculateReviewStats(queue: CandidateReviewItem[]): ReviewStats {
  const totalCount = queue.length;
  const decisionsMade = queue.filter((i) => i.decision !== "pending").length;
  const keptCount = queue.filter((i) => i.decision === "keep").length;
  const flaggedCount = queue.filter((i) => i.decision === "flag").length;
  const passedCount = queue.filter((i) => i.decision === "pass").length;
  const fastClearCount = queue.filter((i) => i.isAllBlockingConfirmed).length;

  return {
    totalCount,
    decisionsMade,
    keptCount,
    flaggedCount,
    passedCount,
    fastClearCount,
  };
}

/**
 * Calculates item counts for each queue filter tab.
 */
export function calculateTabCounts(
  queue: CandidateReviewItem[],
  filteredCount?: number
): TabCounts {
  return {
    all: filteredCount !== undefined ? filteredCount : queue.length,
    fastClear: queue.filter((i) => i.isAllBlockingConfirmed).length,
    needsAttention: queue.filter(
      (i) => !i.isAllBlockingConfirmed && !i.hasContradicted
    ).length,
    contradicted: queue.filter((i) => i.hasContradicted).length,
  };
}

// Pure filter function applying query groups, normalized city, queue status tabs, experience, and salary filters
export function filterReviewQueue(
  queue: CandidateReviewItem[],
  options: QueueFilterOptions
): CandidateReviewItem[] {
  const {
    selectedGroupId = null,
    selectedCity = null,
    activeTab = "all",
    queryGroups = [],
    experienceRange = null,
    salaryRange = null,
    includeUnstatedSalary = true,
    targetCurrency = "PKR",
  } = options;

  return queue.filter((item) => {
    // 1. Group filter (active group always enforced; default group encompasses all candidates)
    if (!isDefaultGroup(selectedGroupId)) {
      const group = queryGroups.find((g) => g.id === selectedGroupId);
      if (group && !group.candidateIds.includes(item.candidate.id)) {
        return false;
      }
    }

    // 2. Location filter
    if (selectedCity !== null) {
      const candidateCity = item.candidate.identity.location.normalized?.city;
      if (selectedCity === "Unspecified") {
        if (candidateCity !== null && candidateCity !== undefined) return false;
      } else {
        if (candidateCity !== selectedCity) return false;
      }
    }

    // 3. Status Tab filter
    switch (activeTab) {
      case "fast_clear":
        if (!item.isAllBlockingConfirmed) return false;
        break;
      case "needs_attention":
        if (item.isAllBlockingConfirmed || item.hasContradicted) return false;
        break;
      case "contradicted":
        if (!item.hasContradicted) return false;
        break;
      case "all":
      default:
        break;
    }

    // 4. Experience Range filter
    if (experienceRange) {
      const [filterMinExp, filterMaxExp] = experienceRange;
      const candExp = getCandidateExperienceYears(item);
      if (candExp < filterMinExp) return false;
      // When upper bound is 15+, it functions as open-ended
      if (filterMaxExp < 15 && candExp > filterMaxExp) return false;
    }

    // 5. Salary Range filter
    if (salaryRange) {
      const [filterMinSal, filterMaxSal] = salaryRange;
      const { min: candMinSal, max: candMaxSal, isStated } = getCandidateNormalizedSalary(
        item,
        targetCurrency
      );

      if (!isStated) {
        if (!includeUnstatedSalary) {
          return false;
        }
      } else {
        // Candidate expected salary range [candMinSal, candMaxSal] must overlap with filter range [filterMinSal, filterMaxSal]
        if (candMinSal > filterMaxSal || candMaxSal < filterMinSal) {
          return false;
        }
      }
    }

    return true;
  });
}

