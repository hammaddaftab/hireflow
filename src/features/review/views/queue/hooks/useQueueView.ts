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
} from "../../../core/utils/queueCalculations";
import {
  buildReviewQueryString,
  DEFAULT_GROUP_ID,
  isDefaultGroup,
} from "../../../core/utils/reviewQueryParams";

export interface UseQueueViewProps {
  queue: CandidateReviewItem[];
  queryGroups?: QueryGroup[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
  onDecision: (candidateId: string, decision: ReviewDecision) => void;
}

export interface UseQueueViewReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  activeTab: QueueFilterTab;
  setActiveTab: (tab: QueueFilterTab) => void;
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  selectedGroupId: string;
  setSelectedGroupId: (groupId: string) => void;
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
}

export function useQueueView({
  queue,
  queryGroups = [],
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
  onDecision,
}: UseQueueViewProps): UseQueueViewReturn {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<QueueFilterTab>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedGroupId, setSelectedGroupIdState] = useState<string>(
    !isDefaultGroup(initialGroupId) ? initialGroupId! : DEFAULT_GROUP_ID
  );
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);

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
      experienceRange,
      salaryRange,
      includeUnstatedSalary,
      targetCurrency: salaryBounds.currency,
    });
  }, [
    queue,
    activeTab,
    selectedGroupId,
    queryGroups,
    selectedCity,
    experienceRange,
    salaryRange,
    includeUnstatedSalary,
    salaryBounds.currency,
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
    activeTab !== "all" ||
    isExpFiltered ||
    isSalaryFiltered;

  const handleNext = useCallback(() => {
    if (activeIndex < filteredQueue.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, filteredQueue.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  const handleDecision = useCallback(
    (decision: ReviewDecision) => {
      if (!activeItem) return;
      onDecision(activeItem.candidate.id, decision);

      if (activeIndex < filteredQueue.length - 1) {
        setActiveIndex((prev) => prev + 1);
      }
    },
    [activeItem, activeIndex, filteredQueue.length, onDecision]
  );

  const handleEnterFocusMode = useCallback(() => {
    const q = buildReviewQueryString({
      candidateIndex: activeIndex,
      tab: activeTab,
      city: selectedCity,
      group: selectedGroupId,
    });
    router.push(q ? `/review/focus?${q}` : "/review/focus");
  }, [activeIndex, activeTab, selectedCity, selectedGroupId, router]);

  const resetFilters = useCallback(() => {
    setSelectedGroupIdState(DEFAULT_GROUP_ID);
    setSelectedCity(null);
    setActiveTab("all");
    setExperienceRangeState([experienceBounds.min, experienceBounds.max]);
    setSalaryRangeState([salaryBounds.min, salaryBounds.max]);
    setIncludeUnstatedSalary(true);
    setActiveIndex(0);
  }, [experienceBounds, salaryBounds]);

  // Keyboard navigation for triage queue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
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
  }, [handleDecision, handleNext, handlePrev]);

  return {
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    selectedCity,
    setSelectedCity,
    selectedGroupId,
    setSelectedGroupId,
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
  };
}
