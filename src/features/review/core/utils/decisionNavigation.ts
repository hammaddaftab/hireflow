// Pure navigation calculations for candidate review queue decisions

import type { CandidateReviewItem } from "../../types";
import type { ReviewDecision } from "@/entities/review";

export type DecisionIntent = "first" | "repeat" | "change" | "clear";

// Classifies the recruiter interaction intent based on previous and new decision values
export function classifyDecisionIntent(
  prevDecision: ReviewDecision = "pending",
  newDecision: ReviewDecision
): DecisionIntent {
  if (newDecision === "pending") return "clear";
  if (prevDecision === "pending") return "first";
  if (prevDecision === newDecision) return "repeat";
  return "change";
}

// Finds the next undecided candidate index starting after currentIndex, with wrap-around
export function findNextUndecidedIndex(
  items: CandidateReviewItem[],
  currentIndex: number
): number | null {
  const total = items.length;
  if (total === 0) return null;

  // 1. Search forward from currentIndex + 1 to end
  for (let i = currentIndex + 1; i < total; i++) {
    if (items[i].decision === "pending") {
      return i;
    }
  }

  // 2. Wrap around from 0 to currentIndex - 1
  for (let i = 0; i < currentIndex; i++) {
    if (items[i].decision === "pending") {
      return i;
    }
  }

  return null;
}

// Checks if all items in the queue currently have a decision
export function isQueueFullyDecided(items: CandidateReviewItem[]): boolean {
  if (items.length === 0) return false;
  return items.every((item) => item.decision !== "pending");
}
