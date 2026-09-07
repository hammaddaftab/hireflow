// Centralized application feature flags
export const FEATURES = {
  // When false, candidate grouping has zero visual or interactive presence across the application
  CANDIDATE_GROUPS: false,
  // When false, AI evaluation/stress-test bench is completely hidden from the client UI
  AI_EVALS:
    process.env.NEXT_PUBLIC_ENABLE_AI_EVALS === "true" ||
    process.env.ENABLE_AI_EVALS === "true",
} as const;
