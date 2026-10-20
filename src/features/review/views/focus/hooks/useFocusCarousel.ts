"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { CandidateReviewItem, QueryGroup } from "../../../types";
import type { QueueFilterTab, ReviewDecision } from "@/entities/review";
import {
  filterReviewQueue,
  calculateExperienceBounds,
  calculateSalaryBounds,
  type QueueSortOption,
} from "../../../core/utils/queueCalculations";
import {
  DEFAULT_GROUP_ID,
  isDefaultGroup,
} from "../../../core/utils/reviewQueryParams";
import { FEATURES } from "@/config/features";
import { useDecisionFeedback } from "../../../core/hooks/useDecisionFeedback";
import type { SnackbarState } from "../../../core/components/feedback/DecisionSnackbar";

export interface UseFocusCarouselProps {
  queue: CandidateReviewItem[];
  queryGroups: QueryGroup[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialUniversity?: string | null;
  initialGroupId?: string | null;
  initialSort?: QueueSortOption;
  targetDegreeLevel?: string | null;
  onDecision: (candidateId: string, decision: ReviewDecision) => Promise<boolean>;
  onExitFocus?: () => void;
  onToggleEvidence?: () => void;
}

export interface UseFocusCarouselReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  activeTab: QueueFilterTab;
  setActiveTab: (tab: QueueFilterTab) => void;
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  selectedUniversity: string | null;
  setSelectedUniversity: (uni: string | null) => void;
  selectedGroupId: string;
  setSelectedGroupId: (id: string | null) => void;
  sortBy: QueueSortOption;
  setSortBy: (sort: QueueSortOption) => void;
  isFilterPaneOpen: boolean;
  setIsFilterPaneOpen: (open: boolean) => void;
  isGroupModalOpen: boolean;
  setIsGroupModalOpen: (open: boolean) => void;
  isGroupsOpen: boolean;
  setIsGroupsOpen: (open: boolean) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  isUniversityOpen: boolean;
  setIsUniversityOpen: (open: boolean) => void;
  experienceRange: [number, number];
  setExperienceRange: (range: [number, number]) => void;
  experienceBounds: { min: number; max: number; step: number };
  salaryRange: [number, number];
  setSalaryRange: (range: [number, number]) => void;
  salaryBounds: { min: number; max: number; step: number; currency: string };
  includeUnstatedSalary: boolean;
  toggleIncludeUnstatedSalary: () => void;
  filteredQueue: CandidateReviewItem[];
  scopedActiveItem: CandidateReviewItem | null;
  hasNext: boolean;
  hasPrev: boolean;
  direction: "next" | "prev" | "none";
  animKey?: number;
  pulsingHint?: "left" | "right" | null;
  hasActiveFilters: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleDecision: (decision: ReviewDecision) => void;
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

// Tier 2 Focus Viewport Controller Hook:
// Manages spatial deck carousel navigation, HUD filter pane states, and keyboard shortcut event listeners.
export function useFocusCarousel({
  queue,
  queryGroups,
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialUniversity = null,
  initialGroupId = null,
  initialSort = "latest",
  targetDegreeLevel = null,
  onDecision,
  onExitFocus,
  onToggleEvidence,
}: UseFocusCarouselProps): UseFocusCarouselReturn {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<QueueFilterTab>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(initialUniversity);
  const [selectedGroupId, setSelectedGroupIdState] = useState<string>(
    !isDefaultGroup(initialGroupId) ? initialGroupId! : DEFAULT_GROUP_ID
  );
  const [sortBy, setSortByState] = useState<QueueSortOption>(initialSort || "latest");
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isUniversityOpen, setIsUniversityOpen] = useState(true);

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

  const setSelectedGroupId = useCallback((id: string | null) => {
    setSelectedGroupIdState(isDefaultGroup(id) ? DEFAULT_GROUP_ID : id!);
    setActiveIndex(0);
  }, []);

  const [direction, setDirection] = useState<"next" | "prev" | "none">("none");
  const [animKey, setAnimKey] = useState(0);
  const [pulsingHint, setPulsingHint] = useState<"left" | "right" | null>(null);

  const filteredQueue = useMemo(() => {
    return filterReviewQueue(queue, {
      selectedGroupId,
      selectedCity,
      selectedUniversity,
      activeTab,
      queryGroups,
      experienceRange,
      salaryRange,
      includeUnstatedSalary,
      targetCurrency: salaryBounds.currency,
      sortBy,
      targetDegreeLevel,
    });
  }, [
    queue,
    selectedGroupId,
    selectedCity,
    selectedUniversity,
    activeTab,
    queryGroups,
    experienceRange,
    salaryRange,
    includeUnstatedSalary,
    salaryBounds.currency,
    sortBy,
    targetDegreeLevel,
  ]);

  const scopedActiveItem = filteredQueue[activeIndex] || filteredQueue[0] || null;
  const hasNext = activeIndex < filteredQueue.length - 1;
  const hasPrev = activeIndex > 0;

  const isExpFiltered =
    experienceRange[0] > experienceBounds.min ||
    experienceRange[1] < experienceBounds.max;

  const isSalaryFiltered =
    salaryRange[0] > salaryBounds.min ||
    salaryRange[1] < salaryBounds.max ||
    !includeUnstatedSalary;

  const hasActiveFilters =
    (FEATURES.CANDIDATE_GROUPS && !isDefaultGroup(selectedGroupId)) ||
    selectedCity !== null ||
    selectedUniversity !== null ||
    activeTab !== "all" ||
    isExpFiltered ||
    isSalaryFiltered;

  // Integrated decision feedback engine with spatial slide coordination
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
    commitBeatDurationMs: 400,
  });

  // Sync URL search params with active candidate index, group, and university (debounced to avoid blocking rapid keystrokes)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("candidateIndex", String(activeIndex));
      if (FEATURES.CANDIDATE_GROUPS && !isDefaultGroup(selectedGroupId)) {
        params.set("group", selectedGroupId);
      } else {
        params.delete("group");
      }
      if (selectedUniversity) {
        params.set("university", selectedUniversity);
      } else {
        params.delete("university");
      }
      if (sortBy === "oldest") {
        params.set("sort", sortBy);
      } else {
        params.delete("sort");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }, 200);

    return () => clearTimeout(timer);
  }, [activeIndex, selectedGroupId, selectedUniversity, sortBy]);

  const handleNext = useCallback(() => {
    flushCommitBeat();
    if (hasNext) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [hasNext, flushCommitBeat]);

  const handlePrev = useCallback(() => {
    flushCommitBeat();
    if (hasPrev) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [hasPrev, flushCommitBeat]);

  const handleDecision = useCallback(
    (decision: ReviewDecision) => {
      if (!scopedActiveItem) return;
      applyDecision(scopedActiveItem, decision, activeIndex);
    },
    [scopedActiveItem, activeIndex, applyDecision]
  );

  const handleClearCurrent = useCallback(() => {
    if (!scopedActiveItem) return;
    clearCandidate(scopedActiveItem, activeIndex);
  }, [scopedActiveItem, activeIndex, clearCandidate]);

  const handleNextUndecided = useCallback(() => {
    jumpNextUndecided(activeIndex);
  }, [activeIndex, jumpNextUndecided]);

  const resetFilters = useCallback(() => {
    flushCommitBeat();
    setSelectedGroupId(DEFAULT_GROUP_ID);
    setSelectedCity(null);
    setSelectedUniversity(null);
    setActiveTab("all");
    setExperienceRangeState([experienceBounds.min, experienceBounds.max]);
    setSalaryRangeState([salaryBounds.min, salaryBounds.max]);
    setIncludeUnstatedSalary(true);
    setActiveIndex(0);
  }, [setSelectedGroupId, experienceBounds, salaryBounds, flushCommitBeat]);

  // Focus View Keyboard Shortcuts: [A] Keep, [F] Flag, [R] Pass, [Z] Undo, [U] Clear, [N] Next, [E] Evidence, [Q] Filters, [Esc] Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Allow GroupsCanvas to exclusively capture keyboard navigation when modal is open
      if (isGroupModalOpen) {
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
        case " ":
        case "arrowright":
          e.preventDefault();
          handleNext();
          break;
        case "arrowleft":
          e.preventDefault();
          handlePrev();
          break;
        case "e":
          e.preventDefault();
          onToggleEvidence?.();
          break;
        case "q":
          e.preventDefault();
          setIsFilterPaneOpen((prev) => !prev);
          break;
        case "g":
          if (FEATURES.CANDIDATE_GROUPS) {
            e.preventDefault();
            setIsGroupModalOpen((prev) => !prev);
          }
          break;
        case "escape":
          e.preventDefault();
          if (isFilterPaneOpen) {
            setIsFilterPaneOpen(false);
          } else {
            onExitFocus?.();
          }
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
    onToggleEvidence,
    onExitFocus,
    isFilterPaneOpen,
    isGroupModalOpen,
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
    isGroupModalOpen,
    setIsGroupModalOpen,
    isGroupsOpen,
    setIsGroupsOpen,
    isLocationOpen,
    setIsLocationOpen,
    isUniversityOpen,
    setIsUniversityOpen,
    experienceRange,
    setExperienceRange,
    experienceBounds,
    salaryRange,
    setSalaryRange,
    salaryBounds,
    includeUnstatedSalary,
    toggleIncludeUnstatedSalary,
    filteredQueue,
    scopedActiveItem,
    hasNext,
    hasPrev,
    direction,
    animKey,
    pulsingHint,
    hasActiveFilters,
    handleNext,
    handlePrev,
    handleDecision,
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
