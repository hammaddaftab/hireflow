"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Minimize2, Filter } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import type { Job } from "@/entities/job";
import type { QueueFilterTab } from "@/entities/review";
import type { CandidateReviewItem } from "../../types";
import { useReviewData } from "../../core/hooks/useReviewData";
import { useFocusCarousel } from "./hooks/useFocusCarousel";
import { CandidateCard } from "../../core/components/card/CandidateCard";
import { CircularRingCardHint } from "./components/CircularRingCardHint";
import { CircularRingTrack } from "./components/CircularRingTrack";
import { FocusCommandBar } from "./components/FocusCommandBar";
import { ReviewFilterPane } from "./components/ReviewFilterPane";
import { buildReviewQueryString } from "../../core/utils/reviewQueryParams";

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

  // Tier 1: Domain State Engine
  const {
    queue,
    handleDecision: updateDecision,
    queryGroups,
    cityDistribution,
    stats,
  } = useReviewData(initialQueue);

  const handleExitFocus = useCallback(() => {
    const q = buildReviewQueryString({
      candidateIndex: activeIndex,
      tab: activeTab,
      city: selectedCity,
      group: selectedGroupId,
    });
    router.push(q ? `/review?${q}` : "/review");
  }, [router]);

  // Tier 2: Viewport State Controller
  const {
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
  } = useFocusCarousel({
    queue,
    queryGroups,
    initialIndex,
    initialTab,
    initialCity,
    initialGroupId,
    onDecision: updateDecision,
    onExitFocus: handleExitFocus,
    onToggleEvidence: () => setIsEvidenceOpen((prev) => !prev),
  });

  const totalCandidates = filteredQueue.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface overflow-hidden">
      {/* Top-Left Job Title and Filter Trigger */}
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
        {/* Ambient 3D Circular Ring Track SVG beneath center card */}
        <CircularRingTrack
          activeIndex={activeIndex}
          totalCandidates={totalCandidates}
        />

        {/* Left Circumferential Ring Perspective Card Hint */}
        <CircularRingCardHint
          direction="left"
          onClick={handlePrev}
          isPulsing={pulsingHint === "left"}
          disabled={!hasPrev}
        />

        {/* Center Apex Candidate Card Container */}
        <div
          className={`relative z-20 flex justify-center transition-all duration-300 ${
            isEvidenceOpen
              ? "w-full max-w-5xl h-full px-4"
              : "w-full max-w-2xl px-4"
          }`}
        >
          {scopedActiveItem ? (
            <div
              key={animKey}
              className={`w-full ${
                direction === "next"
                  ? "animate-arc-in-right"
                  : direction === "prev"
                  ? "animate-arc-in-left"
                  : ""
              } ${isEvidenceOpen ? "h-full" : ""}`}
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
            <div className="p-12 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-low max-w-md">
              <Typography variant="title-medium" className="text-on-surface font-semibold">
                No candidates match the active filter criteria.
              </Typography>
              <Typography variant="body-small" className="text-on-surface-variant mt-2">
                Switch to All Candidates or reset filters.
              </Typography>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Circumferential Ring Perspective Card Hint */}
        <CircularRingCardHint
          direction="right"
          onClick={handleNext}
          isPulsing={pulsingHint === "right"}
          disabled={!hasNext}
        />
      </main>

      {/* Fixed Bottom Action Dock */}
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
          needsAttention: queue.filter(
            (i) => !i.isAllBlockingConfirmed && !i.hasContradicted
          ).length,
          contradicted: queue.filter((i) => i.hasContradicted).length,
        }}
      />
    </div>
  );
}

