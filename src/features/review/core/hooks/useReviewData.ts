import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { CandidateReviewItem, QueryGroup } from "../../types";
import type { ReviewDecision } from "@/entities/review";
import type { PersistedGroupWithMembers } from "@/features/groups";
import {
  calculateReviewStats,
  getCityDistribution,
  getUniversityDistribution,
  type ReviewStats,
} from "../utils/queueCalculations";
import { DEFAULT_GROUP_ID } from "../utils/reviewQueryParams";

export interface UseReviewDataReturn {
  queue: CandidateReviewItem[];
  setQueue: React.Dispatch<React.SetStateAction<CandidateReviewItem[]>>;
  handleDecision: (candidateId: string, decision: ReviewDecision) => Promise<boolean>;
  retryDecision: (candidateId: string) => Promise<boolean>;
  stats: ReviewStats;
  queryGroups: QueryGroup[];
  cityDistribution: Array<{ city: string; count: number }>;
  universityDistribution: Array<{ university: string; count: number }>;
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

  // Active abort controllers and write sequence IDs per candidate to prevent out-of-order writes
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const writeSeqRef = useRef<Map<string, number>>(new Map());

  // Warn on tab unload if any unsaved changes or failed syncs are pending
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = queueRef.current.some(
        (item) => item.syncStatus === "saving" || item.syncStatus === "failed"
      );
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

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

  // Core network persistence engine with ordering guarantees and auto-retry
  const persistDecision = useCallback(
    async (candidateId: string, jobId: string, decision: ReviewDecision): Promise<boolean> => {
      // Abort any in-flight request for this candidate
      const prevController = abortControllersRef.current.get(candidateId);
      if (prevController) {
        prevController.abort();
      }

      const controller = new AbortController();
      abortControllersRef.current.set(candidateId, controller);

      const seq = (writeSeqRef.current.get(candidateId) || 0) + 1;
      writeSeqRef.current.set(candidateId, seq);

      const doRequest = async (): Promise<boolean> => {
        const res = await fetch(`/api/candidates/${candidateId}/decision`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId, decision }),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return true;
      };

      try {
        await doRequest();

        // Verify this is still the latest write sequence for this candidate
        if (writeSeqRef.current.get(candidateId) === seq) {
          setQueue((prevQueue) =>
            prevQueue.map((item) =>
              item.candidate.id === candidateId ? { ...item, syncStatus: "saved" } : item
            )
          );
        }
        return true;
      } catch (err: unknown) {
        // If aborted by a newer decision call, ignore quietly
        if (err instanceof Error && err.name === "AbortError") {
          return false;
        }

        // Silent single retry after 1500ms
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (writeSeqRef.current.get(candidateId) === seq) {
            await doRequest();
            if (writeSeqRef.current.get(candidateId) === seq) {
              setQueue((prevQueue) =>
                prevQueue.map((item) =>
                  item.candidate.id === candidateId ? { ...item, syncStatus: "saved" } : item
                )
              );
              return true;
            }
          }
        } catch {
          // Both initial attempt and retry failed
          if (writeSeqRef.current.get(candidateId) === seq) {
            setQueue((prevQueue) =>
              prevQueue.map((item) =>
                item.candidate.id === candidateId ? { ...item, syncStatus: "failed" } : item
              )
            );
          }
        }
        return false;
      }
    },
    []
  );

  const handleDecision = useCallback(
    async (candidateId: string, decision: ReviewDecision): Promise<boolean> => {
      const nowIso = new Date().toISOString();
      const existing = queueRef.current.find((item) => item.candidate.id === candidateId);
      const priorDecision = existing?.decision ?? "pending";
      const jobId = existing?.jobId;

      // Optimistic state update with previousDecision tracking and decidedAt timestamp
      setQueue((prevQueue) =>
        prevQueue.map((item) => {
          if (item.candidate.id === candidateId) {
            return {
              ...item,
              decision,
              previousDecision: priorDecision !== decision ? priorDecision : item.previousDecision,
              decidedAt: decision !== "pending" ? nowIso : null,
              syncStatus: "saving" as const,
            };
          }
          return item;
        })
      );

      if (jobId) {
        return persistDecision(candidateId, jobId, decision);
      }
      return true;
    },
    [persistDecision]
  );

  const retryDecision = useCallback(
    async (candidateId: string): Promise<boolean> => {
      const targetItem = queueRef.current.find((item) => item.candidate.id === candidateId);
      if (!targetItem || !targetItem.jobId) return false;

      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.candidate.id === candidateId ? { ...item, syncStatus: "saving" } : item
        )
      );

      return persistDecision(candidateId, targetItem.jobId, targetItem.decision);
    },
    [persistDecision]
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

  const universityDistribution = useMemo(() => {
    return getUniversityDistribution(queue);
  }, [queue]);

  const stats = useMemo(() => {
    return calculateReviewStats(queue);
  }, [queue]);

  return {
    queue,
    setQueue,
    handleDecision,
    retryDecision,
    stats,
    queryGroups,
    cityDistribution,
    universityDistribution,
    persistedGroups,
    createGroup,
  };
}
