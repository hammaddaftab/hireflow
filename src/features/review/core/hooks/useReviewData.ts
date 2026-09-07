import { useState, useCallback, useMemo, useRef } from "react";
import type { CandidateReviewItem, QueryGroup } from "../../types";
import type { ReviewDecision } from "@/entities/review";
import type { PersistedGroupWithMembers } from "@/features/groups";
import {
  calculateReviewStats,
  getCityDistribution,
  type ReviewStats,
} from "../utils/queueCalculations";
import { DEFAULT_GROUP_ID } from "../utils/reviewQueryParams";

export interface UseReviewDataReturn {
  queue: CandidateReviewItem[];
  setQueue: React.Dispatch<React.SetStateAction<CandidateReviewItem[]>>;
  handleDecision: (candidateId: string, decision: ReviewDecision) => void;
  stats: ReviewStats;
  queryGroups: QueryGroup[];
  cityDistribution: Array<{ city: string; count: number }>;
  persistedGroups: PersistedGroupWithMembers[];
  createGroup: (name: string, candidateIds: string[], parentId?: string | null) => Promise<PersistedGroupWithMembers>;
}

// Headless domain hook managing candidate records, evaluation mutations, query groups, and review stats
export function useReviewData(
  initialQueue: CandidateReviewItem[],
  initialPersistedGroups: PersistedGroupWithMembers[] = []
): UseReviewDataReturn {
  const [queue, setQueue] = useState<CandidateReviewItem[]>(initialQueue);
  const [persistedGroups, setPersistedGroups] = useState<PersistedGroupWithMembers[]>(initialPersistedGroups);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const createGroup = useCallback(
    async (name: string, candidateIds: string[], parentId?: string | null) => {
      const jobId = queueRef.current[0]?.jobId;
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, name, parentId: parentId || null, candidateIds }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create group");
      }
      const newGroup: PersistedGroupWithMembers = json.data;
      setPersistedGroups((prev) => [newGroup, ...prev]);
      return newGroup;
    },
    []
  );

  const handleDecision = useCallback(
    (candidateId: string, decision: ReviewDecision) => {
      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.candidate.id === candidateId ? { ...item, decision } : item
        )
      );

      const targetItem = queueRef.current.find(
        (item) => item.candidate.id === candidateId
      );
      const jobId = targetItem?.jobId;

      if (jobId) {
        fetch(`/api/candidates/${candidateId}/decision`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId, decision }),
        }).catch((err) => {
          console.error("Failed to persist decision:", err);
        });
      }
    },
    []
  );

  // Recruiter query groups: default root pool and persisted groups
  const queryGroups: QueryGroup[] = useMemo(() => {
    const defaultRootGroup: QueryGroup = {
      id: DEFAULT_GROUP_ID,
      name: "All Applicants (Default)",
      candidateIds: queue.map((c) => c.candidate.id),
    };

    const persistedMapped: QueryGroup[] = persistedGroups.map((g) => ({
      id: g.id,
      name: g.parentId ? `Sub: ${g.name}` : g.name,
      candidateIds: g.candidateIds,
    }));

    return [defaultRootGroup, ...persistedMapped];
  }, [queue, persistedGroups]);

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
    persistedGroups,
    createGroup,
  };
}

