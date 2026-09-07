"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { CandidateReviewItem, QueryGroup } from "../../../types";
import type { QueueFilterTab, ReviewDecision } from "@/entities/review";
import { filterReviewQueue } from "../../../core/utils/queueCalculations";
import {
  DEFAULT_GROUP_ID,
  isDefaultGroup,
} from "../../../core/utils/reviewQueryParams";
import { FEATURES } from "@/config/features";

export interface UseFocusCarouselProps {
  queue: CandidateReviewItem[];
  queryGroups: QueryGroup[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
  onDecision: (candidateId: string, decision: ReviewDecision) => void;
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
  selectedGroupId: string;
  setSelectedGroupId: (id: string | null) => void;
  isFilterPaneOpen: boolean;
  setIsFilterPaneOpen: (open: boolean) => void;
  isGroupModalOpen: boolean;
  setIsGroupModalOpen: (open: boolean) => void;
  isGroupsOpen: boolean;
  setIsGroupsOpen: (open: boolean) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
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
}

// Tier 2 Focus Viewport Controller Hook:
// Manages spatial deck carousel navigation, HUD filter pane states, and keyboard shortcut event listeners.
export function useFocusCarousel({
  queue,
  queryGroups,
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
  onDecision,
  onExitFocus,
  onToggleEvidence,
}: UseFocusCarouselProps): UseFocusCarouselReturn {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<QueueFilterTab>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedGroupId, setSelectedGroupIdState] = useState<string>(
    !isDefaultGroup(initialGroupId) ? initialGroupId! : DEFAULT_GROUP_ID
  );
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);

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
      activeTab,
      queryGroups,
    });
  }, [queue, selectedGroupId, selectedCity, activeTab, queryGroups]);

  const scopedActiveItem = filteredQueue[activeIndex] || filteredQueue[0] || null;
  const hasNext = activeIndex < filteredQueue.length - 1;
  const hasPrev = activeIndex > 0;

  const hasActiveFilters =
    (FEATURES.CANDIDATE_GROUPS && !isDefaultGroup(selectedGroupId)) ||
    selectedCity !== null ||
    activeTab !== "all";

  // Sync URL search params with active candidate index and active group
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("candidateIndex", String(activeIndex));
    if (FEATURES.CANDIDATE_GROUPS && !isDefaultGroup(selectedGroupId)) {
      params.set("group", selectedGroupId);
    } else {
      params.delete("group");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [activeIndex, selectedGroupId]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setDirection("next");
      setAnimKey((k) => k + 1);
      setPulsingHint("right");
      setActiveIndex((prev) => prev + 1);
      setTimeout(() => setPulsingHint(null), 400);
    }
  }, [hasNext]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setDirection("prev");
      setAnimKey((k) => k + 1);
      setPulsingHint("left");
      setActiveIndex((prev) => prev - 1);
      setTimeout(() => setPulsingHint(null), 400);
    }
  }, [hasPrev]);

  const handleDecision = useCallback(
    (decision: ReviewDecision) => {
      if (!scopedActiveItem) return;
      onDecision(scopedActiveItem.candidate.id, decision);

      if (hasNext) {
        setDirection("next");
        setAnimKey((k) => k + 1);
        setPulsingHint("right");
        setActiveIndex((prev) => prev + 1);
        setTimeout(() => setPulsingHint(null), 400);
      }
    },
    [scopedActiveItem, hasNext, onDecision]
  );

  const resetFilters = useCallback(() => {
    setSelectedGroupId(DEFAULT_GROUP_ID);
    setSelectedCity(null);
    setActiveTab("all");
    setActiveIndex(0);
  }, [setSelectedGroupId]);

  // Focus View Keyboard Shortcuts: [A] Keep, [F] Flag, [R] Pass, [E] Evidence, [Q] Filters, [Esc] Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Allow GroupsCanvas to exclusively capture keyboard navigation when modal is open
      if (isGroupModalOpen) {
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
    selectedGroupId,
    setSelectedGroupId,
    isFilterPaneOpen,
    setIsFilterPaneOpen,
    isGroupModalOpen,
    setIsGroupModalOpen,
    isGroupsOpen,
    setIsGroupsOpen,
    isLocationOpen,
    setIsLocationOpen,
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
  };
}

