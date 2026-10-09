"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CandidateReviewItem } from "../../types";
import type { ReviewDecision } from "@/entities/review";
import { classifyDecisionIntent, findNextUndecidedIndex } from "../utils/decisionNavigation";
import type { SnackbarState } from "../components/feedback/DecisionSnackbar";

export interface UndoStackEntry {
  candidateId: string;
  candidateName: string;
  previousDecision: ReviewDecision;
  previousDecidedAt?: string | null;
  targetDecision: ReviewDecision;
  index: number;
}

export interface UseDecisionFeedbackProps {
  onDomainDecision: (candidateId: string, decision: ReviewDecision) => Promise<boolean>;
  setActiveIndex: (index: number) => void;
  queue: CandidateReviewItem[];
  commitBeatDurationMs?: number;
}

export interface UseDecisionFeedbackReturn {
  committingCandidateId: string | null;
  commitDecision: ReviewDecision | null;
  isCommitting: boolean;
  snackbarState: SnackbarState | null;
  canUndo: boolean;
  dismissSnackbar: () => void;
  applyDecision: (
    candidateItem: CandidateReviewItem,
    newDecision: ReviewDecision,
    currentIndex: number,
    onAfterAdvance?: (direction: "next" | "prev") => void
  ) => void;
  handleUndo: () => void;
  handleClearCurrent: (candidateItem: CandidateReviewItem, currentIndex: number) => void;
  handleNextUndecided: (currentIndex: number) => void;
  flushCommitBeat: () => void;
}

export function useDecisionFeedback({
  onDomainDecision,
  setActiveIndex,
  queue,
  commitBeatDurationMs = 420,
}: UseDecisionFeedbackProps): UseDecisionFeedbackReturn {
  const [committingCandidateId, setCommittingCandidateId] = useState<string | null>(null);
  const [commitDecision, setCommitDecision] = useState<ReviewDecision | null>(null);
  const [snackbarState, setSnackbarState] = useState<SnackbarState | null>(null);
  const [undoStack, setUndoStack] = useState<UndoStackEntry[]>([]);

  const commitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingAdvanceRef = useRef<(() => void) | null>(null);

  // Flushes any ongoing commit animation instantly to guarantee responsiveness
  const flushCommitBeat = useCallback(() => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    if (pendingAdvanceRef.current) {
      const adv = pendingAdvanceRef.current;
      pendingAdvanceRef.current = null;
      adv();
    }
    setCommittingCandidateId(null);
    setCommitDecision(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, []);

  const dismissSnackbar = useCallback(() => {
    setSnackbarState(null);
  }, []);

  const applyDecision = useCallback(
    (
      candidateItem: CandidateReviewItem,
      newDecision: ReviewDecision,
      currentIndex: number,
      onAfterAdvance?: (direction: "next" | "prev") => void
    ) => {
      // 1. Flush any active commit beat first
      flushCommitBeat();

      const { candidate } = candidateItem;
      const priorDecision = candidateItem.decision;
      const intent = classifyDecisionIntent(priorDecision, newDecision);

      // Handle Repeat: candidate is already in this state
      if (intent === "repeat") {
        const nextUndecided = findNextUndecidedIndex(queue, currentIndex);
        setSnackbarState({
          id: `repeat-${candidate.id}-${Date.now()}`,
          type: "repeat",
          candidateId: candidate.id,
          candidateName: candidate.identity.name,
          decision: newDecision,
          canUndo: false,
        });

        if (nextUndecided !== null && nextUndecided !== currentIndex) {
          onAfterAdvance?.(nextUndecided > currentIndex ? "next" : "prev");
          setActiveIndex(nextUndecided);
        }
        return;
      }

      // Handle Clear: reset to pending
      if (intent === "clear") {
        setUndoStack((prev) => [
          {
            candidateId: candidate.id,
            candidateName: candidate.identity.name,
            previousDecision: priorDecision,
            previousDecidedAt: candidateItem.decidedAt,
            targetDecision: "pending",
            index: currentIndex,
          },
          ...prev.slice(0, 19),
        ]);

        onDomainDecision(candidate.id, "pending");
        setSnackbarState({
          id: `clear-${candidate.id}-${Date.now()}`,
          type: "clear",
          candidateId: candidate.id,
          candidateName: candidate.identity.name,
          canUndo: true,
        });
        return;
      }

      // Handle Change: in-place update without jumping
      if (intent === "change") {
        setUndoStack((prev) => [
          {
            candidateId: candidate.id,
            candidateName: candidate.identity.name,
            previousDecision: priorDecision,
            previousDecidedAt: candidateItem.decidedAt,
            targetDecision: newDecision,
            index: currentIndex,
          },
          ...prev.slice(0, 19),
        ]);

        onDomainDecision(candidate.id, newDecision);
        setSnackbarState({
          id: `change-${candidate.id}-${Date.now()}`,
          type: "change",
          candidateId: candidate.id,
          candidateName: candidate.identity.name,
          decision: newDecision,
          previousDecision: priorDecision,
          canUndo: true,
        });
        return;
      }

      // Handle First decision: commit beat confirmation + advance to next undecided
      setUndoStack((prev) => [
        {
          candidateId: candidate.id,
          candidateName: candidate.identity.name,
          previousDecision: "pending",
          previousDecidedAt: null,
          targetDecision: newDecision,
          index: currentIndex,
        },
        ...prev.slice(0, 19),
      ]);

      // Optimistic persistence dispatch
      onDomainDecision(candidate.id, newDecision);

      // Start commit beat animation on this card
      setCommittingCandidateId(candidate.id);
      setCommitDecision(newDecision);

      setSnackbarState({
        id: `decide-${candidate.id}-${Date.now()}`,
        type: "decision",
        candidateId: candidate.id,
        candidateName: candidate.identity.name,
        decision: newDecision,
        canUndo: true,
      });

      const nextUndecided = findNextUndecidedIndex(queue, currentIndex);

      if (nextUndecided !== null && nextUndecided !== currentIndex) {
        pendingAdvanceRef.current = () => {
          onAfterAdvance?.(nextUndecided > currentIndex ? "next" : "prev");
          setActiveIndex(nextUndecided);
        };

        commitTimerRef.current = setTimeout(() => {
          commitTimerRef.current = null;
          if (pendingAdvanceRef.current) {
            const adv = pendingAdvanceRef.current;
            pendingAdvanceRef.current = null;
            adv();
          }
          setCommittingCandidateId(null);
          setCommitDecision(null);
        }, commitBeatDurationMs);
      } else {
        // Queue is completely decided or only one item remains
        commitTimerRef.current = setTimeout(() => {
          commitTimerRef.current = null;
          setCommittingCandidateId(null);
          setCommitDecision(null);
        }, commitBeatDurationMs);
      }
    },
    [flushCommitBeat, queue, commitBeatDurationMs, onDomainDecision, setActiveIndex]
  );

  const handleUndo = useCallback(() => {
    flushCommitBeat();

    if (undoStack.length === 0) return;

    const [top, ...rest] = undoStack;
    setUndoStack(rest);

    // Revert candidate decision in domain state
    onDomainDecision(top.candidateId, top.previousDecision);

    // Jump viewport back to that candidate
    setActiveIndex(top.index);

    setSnackbarState({
      id: `undo-${top.candidateId}-${Date.now()}`,
      type: "restored",
      candidateId: top.candidateId,
      candidateName: top.candidateName,
      decision: top.previousDecision,
      canUndo: false,
    });
  }, [flushCommitBeat, undoStack, onDomainDecision, setActiveIndex]);

  const handleClearCurrent = useCallback(
    (candidateItem: CandidateReviewItem, currentIndex: number) => {
      applyDecision(candidateItem, "pending", currentIndex);
    },
    [applyDecision]
  );

  const handleNextUndecided = useCallback(
    (currentIndex: number) => {
      flushCommitBeat();
      const nextIndex = findNextUndecidedIndex(queue, currentIndex);
      if (nextIndex !== null) {
        setActiveIndex(nextIndex);
      }
    },
    [flushCommitBeat, queue, setActiveIndex]
  );

  return {
    committingCandidateId,
    commitDecision,
    isCommitting: committingCandidateId !== null,
    snackbarState,
    canUndo: undoStack.length > 0,
    dismissSnackbar,
    applyDecision,
    handleUndo,
    handleClearCurrent,
    handleNextUndecided,
    flushCommitBeat,
  };
}
