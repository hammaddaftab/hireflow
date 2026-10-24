"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Minimize2, Filter, Network, Trophy, X } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import type { Job } from "@/entities/job";
import type { QueueFilterTab } from "@/entities/review";
import type { CandidateReviewItem } from "../../types";
import type { QueueSortOption } from "../../core/utils/queueCalculations";
import { useReviewData } from "../../core/hooks/useReviewData";
import { useFocusCarousel } from "./hooks/useFocusCarousel";
import { SpatialFocusDeck } from "./components/SpatialFocusDeck";
import { FocusCommandBar } from "./components/FocusCommandBar";
import { ReviewFilterPane } from "./components/ReviewFilterPane";
import { DecisionSnackbar } from "../../core/components/feedback/DecisionSnackbar";
import { DecisionProgressStrip } from "../../core/components/feedback/DecisionProgressStrip";
import { ActiveFilterChipBar } from "../../core/components/feedback/ActiveFilterChipBar";
import { useActiveReviewChips } from "../../core/hooks/useActiveReviewChips";
import { buildReviewQueryString } from "../../core/utils/reviewQueryParams";
import { type PersistedGroupWithMembers, ActiveGroupCanvasModal } from "@/features/groups";
import { FEATURES } from "@/config/features";
import { TopCandidatesModal } from "../../top-candidates";

export interface FocusReviewPageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialPersistedGroups?: PersistedGroupWithMembers[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialUniversity?: string | null;
  initialGroupId?: string | null;
  initialSort?: QueueSortOption;
}

export function FocusReviewPage({
  initialJob,
  initialQueue,
  initialPersistedGroups = [],
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialUniversity = null,
  initialGroupId = null,
  initialSort = "latest",
}: FocusReviewPageProps) {
  const router = useRouter();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isTopCandidatesOpen, setIsTopCandidatesOpen] = useState(false);
  const [shortlistFilter, setShortlistFilter] = useState<{ label: string; candidateIds: string[] } | null>(null);
  const targetDegreeLevel: string =
    (initialJob.education_min as { degree_level?: string | null })?.degree_level || "bachelors";

  // Tier 1: Domain State Engine
  const {
    queue,
    handleDecision: updateDecision,
    retryDecision,
    queryGroups,
    cityDistribution,
    universityDistribution,
    stats,
    persistedGroups,
  } = useReviewData(initialQueue, initialPersistedGroups, targetDegreeLevel);

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
    isLocationOpen,
    setIsLocationOpen,
    isUniversityOpen,
    setIsUniversityOpen,
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
    committingCandidateId,
    commitDecision,
    snackbarState,
    canUndo,
    dismissSnackbar,
    handleUndo,
    handleClearCurrent,
  } = useFocusCarousel({
    queue,
    queryGroups,
    initialIndex,
    initialTab,
    initialCity,
    initialUniversity,
    initialGroupId,
    initialSort,
    targetDegreeLevel,
    candidateIds: shortlistFilter?.candidateIds || null,
    onDecision: updateDecision,
    onExitFocus: () => exitFocusRef.current(),
    onToggleEvidence: () => setIsEvidenceOpen((prev) => !prev),
    onToggleTopCandidates: () => setIsTopCandidatesOpen((prev) => !prev),
  });

  const handleExitFocus = useCallback(() => {
    const q = buildReviewQueryString({
      candidateIndex: activeIndex,
      tab: activeTab,
      city: selectedCity,
      university: selectedUniversity,
      group: selectedGroupId,
      sort: sortBy,
    });
    router.push(q ? `/review?${q}` : "/review");
  }, [router, activeIndex, activeTab, selectedCity, selectedUniversity, selectedGroupId, sortBy]);

  exitFocusRef.current = handleExitFocus;

  const handleJumpToCandidate = useCallback(
    (candidateId: string) => {
      if (shortlistFilter && !shortlistFilter.candidateIds.includes(candidateId)) {
        setShortlistFilter(null);
      }
      const targetIndex = filteredQueue.findIndex(
        (item) => item.candidate.id === candidateId
      );
      if (targetIndex !== -1) {
        setActiveIndex(targetIndex);
      } else {
        resetFilters();
        setActiveTab("all");
        const globalIndex = queue.findIndex(
          (item) => item.candidate.id === candidateId
        );
        if (globalIndex !== -1) {
          setActiveIndex(globalIndex);
        }
      }
    },
    [filteredQueue, queue, shortlistFilter, resetFilters, setActiveTab, setActiveIndex]
  );

  const handleFilterCandidateIds = useCallback(
    (candidateIds: string[], label: string) => {
      setShortlistFilter({ label, candidateIds });
      setActiveIndex(0);
    },
    [setActiveIndex]
  );

  // Moves keyboard focus to the command bar action dock
  const handleFocusCommandBar = useCallback(() => {
    const bar = document.getElementById("focus-command-bar");
    const firstButton = bar?.querySelector<HTMLButtonElement>("button");
    firstButton?.focus();
  }, []);

  const activeChips = useActiveReviewChips({
    activeTab,
    onSelectTab: (tab) => {
      setActiveTab(tab);
      setActiveIndex(0);
    },
    selectedCity,
    onSelectCity: (city) => {
      setSelectedCity(city);
      setActiveIndex(0);
    },
    selectedUniversity,
    onSelectUniversity: (uni) => {
      setSelectedUniversity(uni);
      setActiveIndex(0);
    },
    experienceRange,
    onExperienceChange: setExperienceRange,
    experienceBounds,
    salaryRange,
    onSalaryChange: setSalaryRange,
    salaryBounds,
    includeUnstatedSalary,
    onToggleIncludeUnstatedSalary: toggleIncludeUnstatedSalary,
  });

  const totalCandidates = filteredQueue.length;
  const activeGroupName = queryGroups.find((g) => g.id === selectedGroupId)?.name || "All Applicants (Default)";
  const activeGroupCount = queryGroups.find((g) => g.id === selectedGroupId)?.candidateIds.length ?? queue.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface overflow-hidden">
      <header className="w-full shrink-0 h-14 sm:h-16 px-6 flex items-center justify-between border-b border-outline-variant/20 bg-surface z-40 select-none">
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
          <div className="hidden sm:flex flex-col shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              HireFlow Focus
            </span>
            <span className="text-xs font-bold text-on-surface truncate max-w-[180px]">
              {initialJob.title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterPaneOpen(!isFilterPaneOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
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
            <span>
              {activeChips.length > 0 ? `Filters · ${activeChips.length}` : "Filters"}
            </span>
            <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-surface/40 font-mono text-[10px] opacity-75">
              Q
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setIsTopCandidatesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer text-xs font-bold shadow-2xs shrink-0"
            title="Open Mechanism E Top 3 Candidates Tournament (T)"
            aria-label="Open Top 3 Candidates Tournament"
          >
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span>Top 3</span>
            <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-surface/40 font-mono text-[10px] opacity-75">
              T
            </kbd>
          </button>

          {shortlistFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-semibold shrink-0">
              <Trophy className="h-3 w-3 shrink-0" />
              <span>{shortlistFilter.label}</span>
              <button
                type="button"
                onClick={() => setShortlistFilter(null)}
                className="hover:text-on-surface cursor-pointer border-0 bg-transparent p-0 text-on-surface-variant"
                title="Clear shortlist"
              >
                <X className="h-3 w-3 shrink-0" />
              </button>
            </div>
          )}

          <ActiveFilterChipBar
            chips={activeChips}
            onClearAll={resetFilters}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <Typography variant="title-large" className="text-on-surface text-xl sm:text-2xl leading-none">
                {totalCandidates > 0 ? `${activeIndex + 1} / ${totalCandidates}` : "0 / 0"}
              </Typography>
              {hasActiveFilters && queue.length > 0 && (
                <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                  of {queue.length}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col gap-0.5 w-20 text-[10px] text-on-surface-variant font-medium">
              <div className="flex items-center justify-between">
                <span>Keep:</span>
                <span className={`font-mono font-medium transition-colors duration-200 text-emerald-700 dark:text-emerald-400 ${commitDecision === "keep" ? "font-bold scale-110" : ""}`}>{stats.keptCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Flagged:</span>
                <span className={`font-mono font-medium transition-colors duration-200 text-amber-700 dark:text-amber-400 ${commitDecision === "flag" ? "font-bold scale-110" : ""}`}>{stats.flaggedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Passed:</span>
                <span className={`font-mono font-medium transition-colors duration-200 text-rose-700 dark:text-rose-400 ${commitDecision === "pass" ? "font-bold scale-110" : ""}`}>{stats.passedCount}</span>
              </div>
            </div>
            {totalCandidates > 0 && (
              <DecisionProgressStrip
                items={filteredQueue}
                activeIndex={activeIndex}
                onSelectIndex={setActiveIndex}
                className="w-20 sm:w-24"
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleExitFocus}
            className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Exit focus mode (Esc)"
            aria-label="Exit focus mode"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative flex-1 min-h-0 w-full flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <SpatialFocusDeck
          items={filteredQueue}
          activeIndex={activeIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onDecision={handleDecision}
          isEvidenceOpen={isEvidenceOpen}
          onToggleEvidence={() => setIsEvidenceOpen(!isEvidenceOpen)}
          resetFilters={resetFilters}
          committingCandidateId={committingCandidateId}
          onClearDecision={handleClearCurrent}
          onRetrySync={() => scopedActiveItem && retryDecision(scopedActiveItem.candidate.id)}
          onChangeFocus={handleFocusCommandBar}
        />
      </main>

      <div className="absolute bottom-16 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
        <DecisionSnackbar
          state={snackbarState}
          onUndo={handleUndo}
          onRetry={(candidateId) => retryDecision(candidateId)}
          onDismiss={dismissSnackbar}
        />
      </div>

      <FocusCommandBar
        currentDecision={scopedActiveItem?.decision}
        decidedAt={scopedActiveItem?.decidedAt}
        isEvidenceOpen={isEvidenceOpen}
        canUndo={canUndo}
        onDecision={handleDecision}
        onToggleEvidence={() => setIsEvidenceOpen(!isEvidenceOpen)}
        onUndo={handleUndo}
        onClear={handleClearCurrent}
      />

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
        selectedUniversity={selectedUniversity}
        onSelectUniversity={(uni) => {
          setSelectedUniversity(uni);
          setActiveIndex(0);
        }}
        isUniversityOpen={isUniversityOpen}
        onToggleUniversity={() => setIsUniversityOpen(!isUniversityOpen)}
        cityDistribution={cityDistribution}
        universityDistribution={universityDistribution}
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

      <TopCandidatesModal
        isOpen={isTopCandidatesOpen}
        onClose={() => setIsTopCandidatesOpen(false)}
        job={initialJob}
        queue={queue}
        onJumpToCandidate={handleJumpToCandidate}
        onFilterCandidateIds={handleFilterCandidateIds}
        onDecision={(decision, candidateId) => {
          if (candidateId) {
            updateDecision(candidateId, decision);
          }
        }}
      />
    </div>
  );
}

