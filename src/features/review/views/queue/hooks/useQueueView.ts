"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CandidateReviewItem, QueryGroup } from "../../../types";
import type { QueueFilterTab, ReviewDecision } from "@/entities/review";
import {
  filterReviewQueue,
  calculateTabCounts,
  calculateExperienceBounds,
  calculateSalaryBounds,
  type TabCounts,
  type QueueSortOption,
} from "../../../core/utils/queueCalculations";
import {
  buildReviewQueryString,
  DEFAULT_GROUP_ID,
  isDefaultGroup,
} from "../../../core/utils/reviewQueryParams";
import { useDecisionFeedback } from "../../../core/hooks/useDecisionFeedback";
import type { SnackbarState } from "../../../core/components/feedback/DecisionSnackbar";

export interface UseQueueViewProps {
  queue: CandidateReviewItem[];
  queryGroups?: QueryGroup[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialUniversity?: string | null;
  initialGroupId?: string | null;
  initialSort?: QueueSortOption;
  targetDegreeLevel?: string | null;
  candidateIds?: string[] | null;
  onDecision: (candidateId: string, decision: ReviewDecision) => Promise<boolean>;
}

export interface UseQueueViewReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  activeTab: QueueFilterTab;
  setActiveTab: (tab: QueueFilterTab) => void;
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  selectedUniversity: string | null;
  setSelectedUniversity: (uni: string | null) => void;
  selectedGroupId: string;
  setSelectedGroupId: (groupId: string) => void;
  sortBy: QueueSortOption;
  setSortBy: (sort: QueueSortOption) => void;
  isFilterPaneOpen: boolean;
  setIsFilterPaneOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  experienceRange: [number, number];
  setExperienceRange: (range: [number, number]) => void;
  experienceBounds: { min: number; max: number; step: number };
  salaryRange: [number, number];
  setSalaryRange: (range: [number, number]) => void;
  salaryBounds: { min: number; max: number; step: number; currency: string };
  includeUnstatedSalary: boolean;
  toggleIncludeUnstatedSalary: () => void;
  hasActiveFilters: boolean;
  filteredQueue: CandidateReviewItem[];
  activeItem: CandidateReviewItem | null;
  tabCounts: TabCounts;
  handleNext: () => void;
  handlePrev: () => void;
  handleDecision: (decision: ReviewDecision) => void;
  handleEnterFocusMode: () => void;
  resetFilters: () => void;
  // Decision Feedback additions
  committingCandidateId: string | null;
  commitDecision: ReviewDecision | null;
  isCommitting: boolean;
  snackbarState: SnackbarState | null;
  canUndo: boolean;
  dismissSnackbar: () => void;
  handleUndo: () => void;
  handleClearCurrent: () => void;
  handleNextUndecided: () => void;
  flushCommitBeat: () => void;
}

export function useQueueView({
  queue,
  queryGroups = [],
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialUniversity = null,
  initialGroupId = null,
  initialSort = "latest",
  targetDegreeLevel = null,
  candidateIds = null,
  onDecision,
}: UseQueueViewProps): UseQueueViewReturn {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<QueueFilterTab>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(initialUniversity);
  const [selectedGroupId, setSelectedGroupIdState] = useState<string>(
    !isDefaultGroup(initialGroupId) ? initialGroupId! : DEFAULT_GROUP_ID
  );
  const [sortBy, setSortByState] = useState<QueueSortOption>(initialSort || "latest");
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);

  const setSortBy = useCallback((sort: QueueSortOption) => {
    setSortByState(sort);
    setActiveIndex(0);
  }, []);

  // Dynamic bounds calculated from queue candidates
  const experienceBounds = useMemo(() => calculateExperienceBounds(queue), [queue]);
  const salaryBounds = useMemo(() => calculateSalaryBounds(queue), [queue]);

  const [experienceRange, setExperienceRangeState] = useState<[number, number]>([
    experienceBounds.min,
    experienceBounds.max,
  ]);
  const [salaryRange, setSalaryRangeState] = useState<[number, number]>([
    salaryBounds.min,
    salaryBounds.max,
  ]);
  const [includeUnstatedSalary, setIncludeUnstatedSalary] = useState(true);

  const setExperienceRange = useCallback((range: [number, number]) => {
    setExperienceRangeState(range);
    setActiveIndex(0);
  }, []);

  const setSalaryRange = useCallback((range: [number, number]) => {
    setSalaryRangeState(range);
    setActiveIndex(0);
  }, []);

  const toggleIncludeUnstatedSalary = useCallback(() => {
    setIncludeUnstatedSalary((prev) => !prev);
    setActiveIndex(0);
  }, []);

  const setSelectedGroupId = useCallback((id: string | null | undefined) => {
    setSelectedGroupIdState(isDefaultGroup(id) ? DEFAULT_GROUP_ID : id!);
    setActiveIndex(0);
  }, []);

  const filteredQueue = useMemo(() => {
    return filterReviewQueue(queue, {
      activeTab,
      selectedGroupId,
      queryGroups,
      selectedCity,
      selectedUniversity,
      experienceRange,
      salaryRange,
      includeUnstatedSalary,
      targetCurrency: salaryBounds.currency,
      sortBy,
      targetDegreeLevel,
      candidateIds,
    });
  }, [
    queue,
    activeTab,
    selectedGroupId,
    queryGroups,
    selectedCity,
    selectedUniversity,
    experienceRange,
    salaryRange,
    includeUnstatedSalary,
    salaryBounds.currency,
    sortBy,
    targetDegreeLevel,
    candidateIds,
  ]);

  const activeItem = filteredQueue[activeIndex] || filteredQueue[0] || null;

  const tabCounts = useMemo(() => {
    return calculateTabCounts(queue, filteredQueue.length);
  }, [queue, filteredQueue.length]);

  const isExpFiltered =
    experienceRange[0] > experienceBounds.min ||
    experienceRange[1] < experienceBounds.max;

  const isSalaryFiltered =
    salaryRange[0] > salaryBounds.min ||
    salaryRange[1] < salaryBounds.max ||
    !includeUnstatedSalary;

  const hasActiveFilters =
    !isDefaultGroup(selectedGroupId) ||
    selectedCity !== null ||
    selectedUniversity !== null ||
    activeTab !== "all" ||
    isExpFiltered ||
    isSalaryFiltered;

  // Integrated decision feedback engine with commit beat, undo, and next-undecided jump
  const {
    committingCandidateId,
    commitDecision,
    isCommitting,
    snackbarState,
    canUndo,
    dismissSnackbar,
    applyDecision,
    handleUndo,
    handleClearCurrent: clearCandidate,
    handleNextUndecided: jumpNextUndecided,
    flushCommitBeat,
  } = useDecisionFeedback({
    onDomainDecision: onDecision,
    setActiveIndex,
    queue: filteredQueue,
    commitBeatDurationMs: 420,
  });

  const handleNext = useCallback(() => {
    flushCommitBeat();
    if (activeIndex < filteredQueue.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, filteredQueue.length, flushCommitBeat]);

  const handlePrev = useCallback(() => {
    flushCommitBeat();
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex, flushCommitBeat]);

  const handleDecision = useCallback(
    (decision: ReviewDecision) => {
      if (!activeItem) return;
      applyDecision(activeItem, decision, activeIndex);
    },
    [activeItem, activeIndex, applyDecision]
  );

  const handleClearCurrent = useCallback(() => {
    if (!activeItem) return;
    clearCandidate(activeItem, activeIndex);
  }, [activeItem, activeIndex, clearCandidate]);

  const handleNextUndecided = useCallback(() => {
    jumpNextUndecided(activeIndex);
  }, [activeIndex, jumpNextUndecided]);

  const handleEnterFocusMode = useCallback(() => {
    flushCommitBeat();
    const q = buildReviewQueryString({
      jobId: queue[0]?.jobId || null,
      candidateIndex: activeIndex,
      tab: activeTab,
      city: selectedCity,
      university: selectedUniversity,
      group: selectedGroupId,
      sort: sortBy,
    });
    router.push(q ? `/review/focus?${q}` : "/review/focus");
  }, [queue, activeIndex, activeTab, selectedCity, selectedUniversity, selectedGroupId, sortBy, router, flushCommitBeat]);

  const resetFilters = useCallback(() => {
    flushCommitBeat();
    setSelectedGroupIdState(DEFAULT_GROUP_ID);
    setSelectedCity(null);
    setSelectedUniversity(null);
    setActiveTab("all");
    setExperienceRangeState([experienceBounds.min, experienceBounds.max]);
    setSalaryRangeState([salaryBounds.min, salaryBounds.max]);
    setIncludeUnstatedSalary(true);
    setActiveIndex(0);
  }, [experienceBounds, salaryBounds, flushCommitBeat]);

  // Keyboard navigation for triage queue: [A]/[Space] Keep, [F] Flag, [R] Pass, [Z] Undo, [U] Clear, [N] Next undecided
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Check undo key (Z or Ctrl/Cmd+Z)
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Check clear key (U)
      if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        handleClearCurrent();
        return;
      }

      // Check jump to next undecided key (N)
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNextUndecided();
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
        case " ":
          e.preventDefault();
          handleDecision("keep");
          break;
        case "f":
          e.preventDefault();
          handleDecision("flag");
          break;
        case "r":
          e.preventDefault();
          handleDecision("pass");
          break;
        case "arrowright":
          e.preventDefault();
          handleNext();
          break;
        case "arrowleft":
          e.preventDefault();
          handlePrev();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleDecision,
    handleNext,
    handlePrev,
    handleUndo,
    handleClearCurrent,
    handleNextUndecided,
  ]);

  return {
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    selectedCity,
    setSelectedCity,
    selectedUniversity,
    setSelectedUniversity,
    selectedGroupId,
    setSelectedGroupId,
    sortBy,
    setSortBy,
    isFilterPaneOpen,
    setIsFilterPaneOpen,
    experienceRange,
    setExperienceRange,
    experienceBounds,
    salaryRange,
    setSalaryRange,
    salaryBounds,
    includeUnstatedSalary,
    toggleIncludeUnstatedSalary,
    hasActiveFilters,
    filteredQueue,
    activeItem,
    tabCounts,
    handleNext,
    handlePrev,
    handleDecision,
    handleEnterFocusMode,
    resetFilters,
    committingCandidateId,
    commitDecision,
    isCommitting,
    snackbarState,
    canUndo,
    dismissSnackbar,
    handleUndo,
    handleClearCurrent,
    handleNextUndecided,
    flushCommitBeat,
  };
}
