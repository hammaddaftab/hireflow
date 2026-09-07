"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Minimize2, Filter, Network } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import type { Job } from "@/entities/job";
import type { QueueFilterTab } from "@/entities/review";
import type { CandidateReviewItem } from "../../types";
import { useReviewData } from "../../core/hooks/useReviewData";
import { useFocusCarousel } from "./hooks/useFocusCarousel";
import { SpatialFocusDeck } from "./components/SpatialFocusDeck";
import { FocusCommandBar } from "./components/FocusCommandBar";
import { ReviewFilterPane } from "./components/ReviewFilterPane";
import { buildReviewQueryString } from "../../core/utils/reviewQueryParams";
import { type PersistedGroupWithMembers, ActiveGroupCanvasModal } from "@/features/groups";
import { FEATURES } from "@/config/features";

export interface FocusReviewPageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialPersistedGroups?: PersistedGroupWithMembers[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
}

export function FocusReviewPage({
  initialJob,
  initialQueue,
  initialPersistedGroups = [],
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
    persistedGroups,
  } = useReviewData(initialQueue, initialPersistedGroups);

  const candidates = useMemo(() => queue.map((item) => item.candidate), [queue]);
  const exitFocusRef = useRef<() => void>(() => {});

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
    isGroupModalOpen,
    setIsGroupModalOpen,
    isLocationOpen,
    setIsLocationOpen,
    filteredQueue,
    scopedActiveItem,
    hasActiveFilters,
    experienceRange,
    setExperienceRange,
    experienceBounds,
    salaryRange,
    setSalaryRange,
    salaryBounds,
    includeUnstatedSalary,
    toggleIncludeUnstatedSalary,
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
    onExitFocus: () => exitFocusRef.current(),
    onToggleEvidence: () => setIsEvidenceOpen((prev) => !prev),
  });

  const handleExitFocus = useCallback(() => {
    const q = buildReviewQueryString({
      candidateIndex: activeIndex,
      tab: activeTab,
      city: selectedCity,
      group: selectedGroupId,
    });
    router.push(q ? `/review?${q}` : "/review");
  }, [router, activeIndex, activeTab, selectedCity, selectedGroupId]);

  exitFocusRef.current = handleExitFocus;

  const totalCandidates = filteredQueue.length;
  const activeGroupName = queryGroups.find((g) => g.id === selectedGroupId)?.name || "All Applicants (Default)";
  const activeGroupCount = queryGroups.find((g) => g.id === selectedGroupId)?.candidateIds.length ?? queue.length;

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

      {/* Top-Right Active Group Selector, Position Indicator (n/m), Decision Counts, and Discreet Exit */}
      <div className="absolute top-5 right-6 z-40 flex items-center gap-3 select-none">
        {/* Active Group Button (Opens Canvas Modal) */}
        {FEATURES.CANDIDATE_GROUPS && (
          <button
            type="button"
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container/80 hover:bg-surface-container text-on-surface transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
            title="Change Active Group (G)"
            aria-label="Change Active Group"
          >
            <Network className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">Active Group</span>
              <span className="text-xs font-bold text-on-surface truncate max-w-[130px]">
                {activeGroupName}
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface-container-high font-bold text-on-surface-variant ml-0.5">
              {activeGroupCount}
            </span>
          </button>
        )}

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

      {/* Center Field: Spatial 3D Card Deck (Apex Center Card + Side Depth Cards on Common Baseline) */}
      <main
        className={`relative flex-1 min-h-0 w-full flex justify-center overflow-hidden transition-all duration-300 ${
          isEvidenceOpen ? "py-0 items-stretch" : "py-4 items-center"
        }`}
      >
        <SpatialFocusDeck
          items={filteredQueue}
          activeIndex={activeIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onDecision={handleDecision}
          isEvidenceOpen={isEvidenceOpen}
          onToggleEvidence={() => setIsEvidenceOpen(!isEvidenceOpen)}
          resetFilters={resetFilters}
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
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setActiveIndex(0);
        }}
        isLocationOpen={isLocationOpen}
        onToggleLocation={() => setIsLocationOpen(!isLocationOpen)}
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
        experienceRange={experienceRange}
        onExperienceChange={setExperienceRange}
        experienceBounds={experienceBounds}
        salaryRange={salaryRange}
        onSalaryChange={setSalaryRange}
        salaryBounds={salaryBounds}
        includeUnstatedSalary={includeUnstatedSalary}
        onToggleIncludeUnstatedSalary={toggleIncludeUnstatedSalary}
      />

      {/* Active Group Canvas Topology Selection Modal */}
      {FEATURES.CANDIDATE_GROUPS && (
        <ActiveGroupCanvasModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          activeGroupId={selectedGroupId}
          onActivateGroup={(groupId) => {
            setSelectedGroupId(groupId);
            setActiveIndex(0);
          }}
          candidates={candidates}
          persistedGroups={persistedGroups}
          activeJobId={initialJob.id}
        />
      )}
    </div>
  );
}

