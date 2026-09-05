"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { CandidateReviewItem, QueryGroup } from "../../../types";
import type { QueueFilterTab, ReviewDecision } from "@/entities/review";
import { filterReviewQueue } from "../../../core/utils/queueCalculations";

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
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  isFilterPaneOpen: boolean;
  setIsFilterPaneOpen: (open: boolean) => void;
  isGroupsOpen: boolean;
  setIsGroupsOpen: (open: boolean) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  filteredQueue: CandidateReviewItem[];
  scopedActiveItem: CandidateReviewItem | null;
  hasNext: boolean;
  hasPrev: boolean;
  direction: "next" | "prev" | "none";
  animKey: number;
  pulsingHint: "left" | "right" | null;
  hasActiveFilters: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleDecision: (decision: ReviewDecision) => void;
  resetFilters: () => void;
}

/**
 * Tier 2 Focus Viewport Controller Hook:
 * Manages 3D circular ring carousel navigation, arc transitions, pulse hints,
 * HUD filter pane states, and keyboard shortcut event listeners.
 */
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId);
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);

  const [direction, setDirection] = useState<"next" | "prev" | "none">("none");
  const [animKey, setAnimKey] = useState(0);
  const [pulsingHint, setPulsingHint] = useState<"left" | "right" | null>(null);
  const [lastNavigationDirection, setLastNavigationDirection] = useState<"next" | "prev" | null>(null);

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
    selectedGroupId !== null ||
    selectedCity !== null ||
    activeTab !== "all";

  const prevIndexRef = useRef(activeIndex);
  const prevCandidateIdRef = useRef<string | null>(scopedActiveItem?.candidate.id || null);

  // Sync URL search params with active candidate index
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("candidateIndex", String(activeIndex));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [activeIndex]);

  // Synchronize circumferential arc animation direction when candidate changes
  useEffect(() => {
    const currentId = scopedActiveItem?.candidate.id || null;
    const prevId = prevCandidateIdRef.current;
    const prevIndex = prevIndexRef.current;

    if (currentId && currentId !== prevId) {
      let resolvedDirection: "next" | "prev" = "next";
      if (lastNavigationDirection) {
        resolvedDirection = lastNavigationDirection;
      } else if (activeIndex < prevIndex) {
        resolvedDirection = "prev";
      } else {
        resolvedDirection = "next";
      }

      setDirection(resolvedDirection);
      setAnimKey((k) => k + 1);
      setPulsingHint(resolvedDirection === "next" ? "right" : "left");

      const timer = setTimeout(() => {
        setPulsingHint(null);
      }, 400);

      prevIndexRef.current = activeIndex;
      prevCandidateIdRef.current = currentId;

      return () => clearTimeout(timer);
    } else {
      prevIndexRef.current = activeIndex;
      prevCandidateIdRef.current = currentId;
    }
  }, [activeIndex, scopedActiveItem?.candidate.id, lastNavigationDirection]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setLastNavigationDirection("next");
      setActiveIndex((prev) => prev + 1);
    }
  }, [hasNext]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setLastNavigationDirection("prev");
      setActiveIndex((prev) => prev - 1);
    }
  }, [hasPrev]);

  const handleDecision = useCallback(
    (decision: ReviewDecision) => {
      if (!scopedActiveItem) return;
      onDecision(scopedActiveItem.candidate.id, decision);

      if (hasNext) {
        setLastNavigationDirection("next");
        setActiveIndex((prev) => prev + 1);
      }
    },
    [scopedActiveItem, hasNext, onDecision]
  );

  const resetFilters = useCallback(() => {
    setSelectedGroupId(null);
    setSelectedCity(null);
    setActiveTab("all");
    setActiveIndex(0);
  }, []);

  // Focus View Keyboard Shortcuts: [A] Keep, [F] Flag, [R] Pass, [E] Evidence, [Q] Filters, [Esc] Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
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
  }, [handleDecision, handleNext, handlePrev, onToggleEvidence, onExitFocus, isFilterPaneOpen]);

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

