"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  CandidateReviewItem, 
  QueueFilterTab, 
  ReviewDecision, 
  QueryGroup 
} from "../types";
import { getCityDistribution } from "../reviewQueueService";
import { Job } from "@/features/jobs/types";

export interface UseReviewQueueProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
  onExitFocus?: () => void;
}

export function useReviewQueue({
  initialJob,
  initialQueue,
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
  onExitFocus,
}: UseReviewQueueProps) {
  const [queue, setQueue] = useState<CandidateReviewItem[]>(initialQueue);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<QueueFilterTab>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId);
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(true);
  const [lastNavigationDirection, setLastNavigationDirection] = useState<"next" | "prev" | null>(null);

  // Left Pane Collapsible Section States
  const [isGroupsOpen, setIsGroupsOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);

  // Pre-defined free-text query groups created by recruiter
  const queryGroups: QueryGroup[] = useMemo(() => [
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
            (s) => s.skill.toLowerCase() === "python" && s.evidence_status === "confirmed"
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
  ], [queue]);

  // Derived location distribution
  const cityDistribution = useMemo(() => {
    return getCityDistribution(queue);
  }, [queue]);

  // Filtered queue based on Group, Location, and Queue Tab
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      // 1. Group filter
      if (selectedGroupId && selectedGroupId !== "grp_all") {
        const group = queryGroups.find((g) => g.id === selectedGroupId);
        if (group && !group.candidateIds.includes(item.candidate.id)) {
          return false;
        }
      }

      // 2. Flat Location filter
      if (selectedCity !== null) {
        const candidateCity = item.candidate.identity.location.normalized?.city;
        if (selectedCity === "Unspecified") {
          if (candidateCity !== null && candidateCity !== undefined) return false;
        } else {
          if (candidateCity !== selectedCity) return false;
        }
      }

      // 3. Status Tab filter
      switch (activeTab) {
        case "fast_clear":
          return item.isAllBlockingConfirmed;
        case "needs_attention":
          return !item.isAllBlockingConfirmed && !item.hasContradicted;
        case "contradicted":
          return item.hasContradicted;
        case "all":
        default:
          return true;
      }
    });
  }, [queue, selectedGroupId, selectedCity, activeTab, queryGroups]);

  // Ensure activeIndex is within bounds of filtered list
  const activeItem = filteredQueue[activeIndex] || filteredQueue[0] || null;

  // Active candidate
  const scopedActiveItem = activeItem;

  // Stepper navigation callbacks
  const handleNext = useCallback(() => {
    if (activeIndex < filteredQueue.length - 1) {
      setLastNavigationDirection("next");
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, filteredQueue.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setLastNavigationDirection("prev");
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  // Decision logging callback
  const handleDecision = useCallback(
    (decision: ReviewDecision) => {
      if (!activeItem) return;

      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.candidate.id === activeItem.candidate.id ? { ...item, decision } : item
        )
      );

      // Auto-advance to next candidate if not at end
      if (activeIndex < filteredQueue.length - 1) {
        setLastNavigationDirection("next");
        setActiveIndex((prev) => prev + 1);
      }
    },
    [activeItem, activeIndex, filteredQueue.length]
  );

  const resetFilters = useCallback(() => {
    setSelectedGroupId(null);
    setSelectedCity(null);
    setActiveTab("all");
    setActiveIndex(0);
  }, []);

  // Keyboard navigation
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
        case "escape":
          if (onExitFocus) {
            e.preventDefault();
            onExitFocus();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDecision, handleNext, handlePrev, onExitFocus]);

  // Review statistics
  const totalCount = queue.length;
  const decisionsMade = queue.filter((i) => i.decision !== "pending").length;
  const keptCount = queue.filter((i) => i.decision === "keep").length;
  const flaggedCount = queue.filter((i) => i.decision === "flag").length;
  const passedCount = queue.filter((i) => i.decision === "pass").length;
  const fastClearCount = queue.filter((i) => i.isAllBlockingConfirmed).length;

  return {
    queue,
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
    queryGroups,
    cityDistribution,
    filteredQueue,
    scopedActiveItem,
    lastNavigationDirection,
    handleNext,
    handlePrev,
    handleDecision,
    resetFilters,
    stats: {
      totalCount,
      decisionsMade,
      keptCount,
      flaggedCount,
      passedCount,
      fastClearCount,
    },
  };
}
