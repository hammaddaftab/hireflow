import { useState, useCallback, useMemo } from "react";
import type { CandidateReviewItem, QueryGroup } from "../../types";
import type { ReviewDecision } from "@/entities/review";
import {
  calculateReviewStats,
  getCityDistribution,
  type ReviewStats,
} from "../utils/queueCalculations";

export interface UseReviewDataReturn {
  queue: CandidateReviewItem[];
  setQueue: React.Dispatch<React.SetStateAction<CandidateReviewItem[]>>;
  handleDecision: (candidateId: string, decision: ReviewDecision) => void;
  stats: ReviewStats;
  queryGroups: QueryGroup[];
  cityDistribution: Array<{ city: string; count: number }>;
}

/**
 * Tier 1 Headless Domain Hook:
 * Manages candidate records, evaluation mutations, query group definitions, and review stats.
 * Completely decoupled from viewport mechanics, 3D math, and pagination.
 */
export function useReviewData(
  initialQueue: CandidateReviewItem[]
): UseReviewDataReturn {
  const [queue, setQueue] = useState<CandidateReviewItem[]>(initialQueue);

  const handleDecision = useCallback(
    (candidateId: string, decision: ReviewDecision) => {
      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.candidate.id === candidateId ? { ...item, decision } : item
        )
      );
    },
    []
  );

  // Pre-defined recruiter query filter groups
  const queryGroups: QueryGroup[] = useMemo(
    () => [
      {
        id: "grp_all",
        name: "All Candidates",
        candidateIds: queue.map((c) => c.candidate.id),
      },
      {
        id: "grp_python",
        name: "Strong Python match",
        candidateIds: queue
          .filter((c) =>
            c.candidate.skills_demonstrated.skills.some(
              (s) =>
                s.skill.toLowerCase() === "python" &&
                s.evidence_status === "confirmed"
            )
          )
          .map((c) => c.candidate.id),
      },
      {
        id: "grp_backend",
        name: "Backend Systems",
        candidateIds: queue
          .filter((c) =>
            c.candidate.skills_demonstrated.skills.some((s) =>
              ["node.js", "go", "postgresql", "system design", "kafka", "redis"].includes(
                s.skill.toLowerCase()
              )
            )
          )
          .map((c) => c.candidate.id),
      },
      {
        id: "grp_entrepreneurial",
        name: "Entrepreneurial background",
        candidateIds: queue
          .filter((c) =>
            c.candidate.work_history.entries.some(
              (w) =>
                w.raw_description.toLowerCase().includes("founder") ||
                w.raw_description.toLowerCase().includes("lead") ||
                w.raw_description.toLowerCase().includes("championed") ||
                w.raw_description.toLowerCase().includes("mentorship")
            )
          )
          .map((c) => c.candidate.id),
      },
    ],
    [queue]
  );

  const cityDistribution = useMemo(() => {
    return getCityDistribution(queue);
  }, [queue]);

  const stats = useMemo(() => {
    return calculateReviewStats(queue);
  }, [queue]);

  return {
    queue,
    setQueue,
    handleDecision,
    stats,
    queryGroups,
    cityDistribution,
  };
}

