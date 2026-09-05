import type { CandidateReviewItem, QueryGroup } from "../../types";
import type { QueueFilterTab } from "@/entities/review";

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

/**
 * Pure filter function applying query groups, normalized city, and queue status tabs.
 */
export function filterReviewQueue(
  queue: CandidateReviewItem[],
  options: QueueFilterOptions
): CandidateReviewItem[] {
  const {
    selectedGroupId = null,
    selectedCity = null,
    activeTab = "all",
    queryGroups = [],
  } = options;

  return queue.filter((item) => {
    // 1. Group filter
    if (selectedGroupId && selectedGroupId !== "grp_all") {
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
        return item.isAllBlockingConfirmed;
      case "needs_attention":
        return !item.isAllBlockingConfirmed && !item.hasContradicted;
      case "contradicted":
        return item.hasContradicted;
      case "all":
      default:
        return true;
    }
  });
}

