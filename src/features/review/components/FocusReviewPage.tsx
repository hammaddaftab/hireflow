"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Minimize2, Filter } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { CandidateCard } from "./CandidateCard";
import { CircularRingCardHint } from "./CircularRingCardHint";
import { CircularRingTrack } from "./CircularRingTrack";
import { FocusCommandBar } from "./FocusCommandBar";
import { ReviewFilterPane } from "./ReviewFilterPane";
import { useReviewQueue } from "../hooks/useReviewQueue";
import { CandidateReviewItem, QueueFilterTab } from "../types";
import type { Job } from "@/entities/job";

export interface FocusReviewPageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
}

export function FocusReviewPage({
  initialJob,
  initialQueue,
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
}: FocusReviewPageProps) {
  const router = useRouter();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  const handleExitFocus = useCallback(() => {
    const params = new URLSearchParams();
    if (activeIndex > 0) params.set("candidateIndex", String(activeIndex));
    if (activeTab !== "all") params.set("tab", activeTab);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedGroupId && selectedGroupId !== "grp_all") params.set("group", selectedGroupId);
    const q = params.toString();
    router.push(q ? `/review?${q}` : "/review");
  }, [router]);

  const {
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    selectedCity,
    setSelectedCity,
    selectedGroupId,
    setSelectedGroupId,
    filteredQueue,
    scopedActiveItem,
    lastNavigationDirection,
    handleNext,
    handlePrev,
    handleDecision,
    resetFilters,
    queryGroups,
    cityDistribution,
    isGroupsOpen,
    setIsGroupsOpen,
    isLocationOpen,
    setIsLocationOpen,
    stats,
    queue,
  } = useReviewQueue({
    initialJob,
    initialQueue,
    initialIndex,
    initialTab,
    initialCity,
    initialGroupId,
    onExitFocus: handleExitFocus,
  });

  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);

  const hasActiveFilters =
    selectedGroupId !== null ||
    selectedCity !== null ||
    activeTab !== "all";

  const [direction, setDirection] = useState<"next" | "prev" | "none">("none");
  const [animKey, setAnimKey] = useState(0);
  const [pulsingHint, setPulsingHint] = useState<"left" | "right" | null>(null);

  const prevIndexRef = useRef(activeIndex);
  const prevCandidateIdRef = useRef<string | null>(scopedActiveItem?.candidate.id || null);

  // Sync URL search params with active candidate index so refresh preserves position
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

  // Keyboard shortcuts: Evidence (E), Filters (Q), Close (Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsEvidenceOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "q") {
        e.preventDefault();
        setIsFilterPaneOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isFilterPaneOpen) {
          e.preventDefault();
          setIsFilterPaneOpen(false);
        } else if (isEvidenceOpen) {
          e.preventDefault();
          setIsEvidenceOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFilterPaneOpen, isEvidenceOpen]);

  const totalCandidates = filteredQueue.length;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < totalCandidates - 1;

  const handleManualNext = useCallback(() => {
    setDirection("next");
    handleNext();
  }, [handleNext]);

  const handleManualPrev = useCallback(() => {
    setDirection("prev");
    handlePrev();
  }, [handlePrev]);

  return (
    <div className="relative h-screen w-screen flex flex-col justify-between overflow-hidden bg-background text-on-surface select-none">
      {/* Top-Left HUD Controls: Job Context + Queue Filters Trigger */}
      <div className="absolute top-5 left-6 z-40 flex items-center gap-3 select-none">
        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
            HireFlow Focus
          </span>
          <span className="text-xs font-bold text-on-surface truncate max-w-[200px]">
            {initialJob.title}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsFilterPaneOpen(!isFilterPaneOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isFilterPaneOpen
              ? "bg-primary text-on-primary border-primary shadow-xs"
              : hasActiveFilters
              ? "bg-primary/15 text-primary border-primary/40 hover:bg-primary/20"
              : "bg-surface-container-high/70 hover:bg-surface-container-high text-on-surface border-outline-variant/30"
          }`}
          title="Toggle Queue Filters (Q)"
          aria-label="Toggle Queue Filters"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
          <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-surface/40 font-mono text-[10px] opacity-75">
            Q
          </kbd>
        </button>
      </div>

      {/* Top-Right Position Indicator (n/m), Decision Counts, and Discreet Exit */}
      <div className="absolute top-5 right-6 z-40 flex items-start gap-3 select-none">
        <div className="flex flex-col items-end gap-1">
          <Typography variant="title-large" className="text-on-surface text-2xl sm:text-3xl leading-none">
            {totalCandidates > 0 ? `${activeIndex + 1} / ${totalCandidates}` : "0 / 0"}
          </Typography>
          <div className="flex flex-col gap-0.5 w-24 text-[11px] text-on-surface-variant font-medium">
            <div className="flex items-center justify-between">
              <span>Keep:</span>
              <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">{stats.keptCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Flagged:</span>
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400">{stats.flaggedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Passed:</span>
              <span className="font-mono font-medium text-rose-700 dark:text-rose-400">{stats.passedCount}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExitFocus}
          className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer mt-0.5"
          title="Exit focus mode (Esc)"
          aria-label="Exit focus mode"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Center Field: Circular Ring Deck Stage (Apex Card + Circumference Hints) */}
      <main
        className={`relative flex-1 min-h-0 w-full flex justify-center overflow-hidden transition-all duration-300 ${
          isEvidenceOpen ? "py-0 items-stretch" : "py-4 items-center"
        }`}
      >
        {/* Background Circumference Arc Track & Position Pips */}
        <CircularRingTrack
          activeIndex={activeIndex}
          totalCandidates={totalCandidates}
        />

        {/* Left Card entering along circumference angle */}
        <CircularRingCardHint
          direction="left"
          onClick={handleManualPrev}
          isPulsing={pulsingHint === "left"}
          disabled={!hasPrev}
        />

        {/* Center Active Focused Card (Sits at apex of circular ring) */}
        {scopedActiveItem ? (
          <div
            key={`${scopedActiveItem.candidate.id}-${animKey}`}
            className={`relative z-20 w-full max-w-2xl lg:max-w-3xl transition-all duration-300 ${
              isEvidenceOpen ? "h-full flex flex-col" : "shadow-2xl"
            } ${
              direction === "next"
                ? "animate-arc-enter-right"
                : direction === "prev"
                ? "animate-arc-enter-left"
                : ""
            }`}
          >
            <CandidateCard
              item={scopedActiveItem}
              isActive={true}
              onDecision={handleDecision}
              hideActionButtons={true}
              isLayer2Expanded={isEvidenceOpen}
              onToggleLayer2={() => setIsEvidenceOpen(!isEvidenceOpen)}
              expandedFullHeight={isEvidenceOpen}
            />
          </div>
        ) : (
          <div className="relative z-20 p-8 rounded-2xl bg-surface-container text-center self-center">
            <span className="text-sm font-semibold text-on-surface">No candidates in queue.</span>
          </div>
        )}

        {/* Right Card entering along circumference angle */}
        <CircularRingCardHint
          direction="right"
          onClick={handleManualNext}
          isPulsing={pulsingHint === "right"}
          disabled={!hasNext}
        />
      </main>

      {/* Fixed Background Simple Rectangle Bottom Bar with A, F, R, E Minimalistic Controls */}
      <FocusCommandBar
        currentDecision={scopedActiveItem?.decision}
        isEvidenceOpen={isEvidenceOpen}
        onDecision={handleDecision}
        onToggleEvidence={() => setIsEvidenceOpen(!isEvidenceOpen)}
      />

      {/* Integrated Queue Filters HUD Drawer */}
      <ReviewFilterPane
        variant="overlay"
        isOpen={isFilterPaneOpen}
        onClose={() => setIsFilterPaneOpen(false)}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(id) => {
          setSelectedGroupId(id);
          setActiveIndex(0);
        }}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setActiveIndex(0);
        }}
        isGroupsOpen={isGroupsOpen}
        onToggleGroups={() => setIsGroupsOpen(!isGroupsOpen)}
        isLocationOpen={isLocationOpen}
        onToggleLocation={() => setIsLocationOpen(!isLocationOpen)}
        queryGroups={queryGroups}
        cityDistribution={cityDistribution}
        totalCandidates={queue.length}
        onResetFilters={resetFilters}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setActiveIndex(0);
        }}
        tabCounts={{
          all: queue.length,
          fastClear: stats.fastClearCount,
          needsAttention: queue.filter((i) => !i.isAllBlockingConfirmed && !i.hasContradicted).length,
          contradicted: queue.filter((i) => i.hasContradicted).length,
        }}
      />
    </div>
  );
}
