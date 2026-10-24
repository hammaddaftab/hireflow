"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Briefcase, MapPin, CheckCircle2, AlertCircle, X, Network, Trophy } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "motion/react";
import type { Job } from "@/entities/job";
import type { QueueFilterTab } from "@/entities/review";
import type { CandidateReviewItem } from "../../types";
import type { QueueSortOption } from "../../core/utils/queueCalculations";
import { useReviewData } from "../../core/hooks/useReviewData";
import { useActiveReviewChips } from "../../core/hooks/useActiveReviewChips";
import { buildReviewQueue } from "../../core/services/reviewQueueService";
import { useQueueView } from "./hooks/useQueueView";
import { CandidateCard } from "../../core/components/card/CandidateCard";
import { ReviewDeckControls } from "./components/ReviewDeckControls";
import { EvidentiaryLegend } from "./components/EvidentiaryLegend";
import { KeyboardShortcutModal } from "./components/KeyboardShortcutBar";
import { DecisionSnackbar } from "../../core/components/feedback/DecisionSnackbar";
import { DecisionProgressStrip } from "../../core/components/feedback/DecisionProgressStrip";
import { useResumeDropUpload } from "@/lib/upload";
import {
  ResumeDropOverlay,
  ResumeDropTrigger,
} from "@/components/upload";

import { type PersistedGroupWithMembers, ActiveGroupCanvasModal } from "@/features/groups";
import { FEATURES } from "@/config/features";
import { ReviewFilterPane } from "../focus/components/ReviewFilterPane";
import { TopCandidatesModal } from "../../top-candidates";

const queueCardVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" as const } },
  exit: (decision: string | null) => {
    if (decision === "keep") {
      return { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.22, ease: "easeIn" as const } };
    }
    if (decision === "flag") {
      return { opacity: 0, x: 24, scale: 0.98, transition: { duration: 0.22, ease: "easeIn" as const } };
    }
    if (decision === "pass") {
      return { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.22, ease: "easeIn" as const } };
    }
    return { opacity: 0, transition: { duration: 0.15 } };
  },
};

export interface ReviewQueuePageProps {
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

export function ReviewQueuePage({
  initialJob,
  initialQueue,
  initialPersistedGroups = [],
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialUniversity = null,
  initialGroupId = null,
  initialSort = "latest",
}: ReviewQueuePageProps) {
  const targetDegreeLevel: string =
    (initialJob.education_min as { degree_level?: string | null })?.degree_level || "bachelors";

  // Domain state engine
  const {
    queue,
    setQueue,
    handleDecision: updateDecision,
    retryDecision,
    stats,
    queryGroups,
    cityDistribution,
    universityDistribution,
    persistedGroups,
  } = useReviewData(initialQueue, initialPersistedGroups, targetDegreeLevel);

  const candidates = useMemo(() => queue.map((item) => item.candidate), [queue]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLayer2Expanded, setIsLayer2Expanded] = useState(false);
  const [isTopCandidatesOpen, setIsTopCandidatesOpen] = useState(false);
  const [shortlistFilter, setShortlistFilter] = useState<{ label: string; candidateIds: string[] } | null>(null);

  // Real-time feedback alert banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Viewport state controller
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
    handleDecision,
    handleEnterFocusMode,
    resetFilters,
    committingCandidateId,
    commitDecision,
    snackbarState,
    dismissSnackbar,
    handleUndo,
    handleClearCurrent,
  } = useQueueView({
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
  });

  // Shortlist and candidate jump handlers
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

  const activeGroupName = queryGroups.find((g) => g.id === selectedGroupId)?.name || "All Applicants (Default)";
  const activeGroupCount = queryGroups.find((g) => g.id === selectedGroupId)?.candidateIds.length ?? queue.length;

  // Drag and drop resume ingestion
  const {
    isDraggingOver,
    uploads,
    isUploading,
    statusLabel,
    uploadFiles,
  } = useResumeDropUpload({
    jobId: initialJob.id,
    onCandidateIngested: (candidate) => {
      const evaluatedItems = buildReviewQueue([candidate], initialJob);
      if (evaluatedItems.length > 0) {
        setQueue((prev) => {
          if (prev.some((item) => item.candidate.id === candidate.id)) {
            return prev;
          }
          return [...prev, ...evaluatedItems];
        });
      }
    },
    onIngestComplete: (count) => {
      setFeedback({
        type: "success",
        message: `Successfully ingested and evaluated ${count} candidate(s) for ${initialJob.title}.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (errorMessage) => {
      setFeedback({
        type: "error",
        message: errorMessage,
      });
      setTimeout(() => setFeedback(null), 6000);
    },
  });

  // Collapse Layer 2 details when active candidate changes
  useEffect(() => {
    setIsLayer2Expanded(false);
  }, [activeItem?.candidate.id]);

  // Keyboard shortcut listener for shortcuts modal (?) and evidence toggle (E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsLayer2Expanded((prev) => !prev);
        return;
      }

      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setIsTopCandidatesOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto -mt-8 pb-16 relative">
      <ResumeDropOverlay isVisible={isDraggingOver} />

      <header className="sticky top-16 z-20 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 py-2.5 px-1 mb-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Typography variant="title-large" className="text-lg sm:text-xl font-bold tracking-tight text-on-surface">
                {initialJob.title}
              </Typography>
              <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  <span>{initialJob.department || "Engineering"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{initialJob.location || "Pakistan"}</span>
                </span>
                {FEATURES.CANDIDATE_GROUPS && (
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer text-xs font-semibold text-on-surface shadow-2xs"
                    title="Change Active Group (Canvas Topology)"
                    aria-label="Change Active Group"
                  >
                    <Network className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate max-w-[140px]">{activeGroupName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface-container-high font-bold text-on-surface-variant">
                      {activeGroupCount}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end items-start gap-1 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold font-mono text-on-surface">
                  {filteredQueue.length > 0 ? `${activeIndex + 1} / ${filteredQueue.length}` : "0 / 0"}
                </span>
                {hasActiveFilters && queue.length > 0 && (
                  <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                    of {queue.length}
                  </span>
                )}
              </div>

              <span className="text-outline-variant/60">•</span>

              <div className="flex items-center gap-2.5 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1">
                  <span>Keep:</span>
                  <span className={`font-mono transition-colors duration-200 text-emerald-700 dark:text-emerald-400 ${commitDecision === "keep" ? "font-bold scale-110" : ""}`}>
                    {stats.keptCount}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span>Flagged:</span>
                  <span className={`font-mono transition-colors duration-200 text-amber-700 dark:text-amber-400 ${commitDecision === "flag" ? "font-bold scale-110" : ""}`}>
                    {stats.flaggedCount}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span>Passed:</span>
                  <span className={`font-mono transition-colors duration-200 text-rose-700 dark:text-rose-400 ${commitDecision === "pass" ? "font-bold scale-110" : ""}`}>
                    {stats.passedCount}
                  </span>
                </span>
              </div>
            </div>

            {filteredQueue.length > 0 && (
              <DecisionProgressStrip
                items={filteredQueue}
                activeIndex={activeIndex}
                onSelectIndex={setActiveIndex}
                className="w-full sm:w-48 mt-0.5"
              />
            )}
          </div>
        </div>
      </header>

      <div className="mb-2">
        <ReviewDeckControls
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setActiveIndex(0);
          }}
          tabCounts={tabCounts}
          onEnterFocusMode={handleEnterFocusMode}
          onToggleFilters={() => setIsFilterPaneOpen((prev: boolean) => !prev)}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeChips.length}
          activeChips={activeChips}
          onClearAllFilters={resetFilters}
          onToggleShortcuts={() => setIsShortcutsOpen((prev) => !prev)}
          isShortcutsOpen={isShortcutsOpen}
          onToggleTopCandidates={() => setIsTopCandidatesOpen((prev) => !prev)}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          rightSlot={
            <ResumeDropTrigger
              onFilesSelected={uploadFiles}
              uploadCount={uploads.length}
              isUploading={isUploading}
              statusLabel={statusLabel}
            />
          }
        />
      </div>

      {shortlistFilter && (
        <div className="mb-2.5 px-1">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/10 border border-primary/30 text-xs text-on-surface">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-primary">
                Active Shortlist: {shortlistFilter.label}
              </span>
              <span className="text-on-surface-variant font-mono">
                ({filteredQueue.length} of {queue.length} candidates)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShortlistFilter(null)}
              className="text-primary hover:underline font-bold cursor-pointer border-0 bg-transparent text-xs"
            >
              Clear shortlist filter
            </button>
          </div>
        </div>
      )}

      <div className="mb-2.5 px-1">
        <EvidentiaryLegend />
      </div>

      <main className="w-full space-y-3 pb-16">
        {feedback && (
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl border text-xs animate-in fade-in duration-150 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback(null)}
              className="h-6 w-6 p-0 text-on-surface-variant hover:text-on-surface rounded-md cursor-pointer"
              title="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {filteredQueue.length > 0 && filteredQueue.every((item) => item.decision !== "pending") && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-on-surface">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                All {filteredQueue.length} candidates in this view are decided
              </span>
              <span className="text-on-surface-variant font-mono">
                • {stats.keptCount} kept, {stats.flaggedCount} flagged, {stats.passedCount} passed
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-primary hover:underline font-bold cursor-pointer border-0 bg-transparent"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="wait" custom={commitDecision}>
          {activeItem ? (
            <motion.div
              key={activeItem.candidate.id}
              custom={commitDecision}
              variants={queueCardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="will-change-transform"
            >
              <CandidateCard
                item={activeItem}
                isActive={true}
                onDecision={handleDecision}
                isCommitting={committingCandidateId === activeItem.candidate.id}
                onClearDecision={handleClearCurrent}
                onRetrySync={() => retryDecision(activeItem.candidate.id)}
                isLayer2Expanded={isLayer2Expanded}
                onToggleLayer2={() => setIsLayer2Expanded((prev) => !prev)}
              />
            </motion.div>
          ) : (
            <Card className="p-12 text-center border border-dashed border-outline-variant">
              <Typography variant="body-large" className="text-on-surface font-semibold">
                No candidates match the selected queue tab.
              </Typography>
              <Typography variant="body-medium" className="text-on-surface-variant mt-1 text-xs">
                Try switching to &quot;All Candidates&quot;, resetting the queue filters, or dropping new candidate resumes.
              </Typography>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="primary" size="sm" onClick={resetFilters}>
                  Reset All Filters
                </Button>
                <ResumeDropTrigger
                  onFilesSelected={uploadFiles}
                  uploadCount={uploads.length}
                  isUploading={isUploading}
                  statusLabel={statusLabel}
                />
              </div>
            </Card>
          )}
        </AnimatePresence>
      </main>

      <KeyboardShortcutModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
        <DecisionSnackbar
          state={snackbarState}
          onUndo={handleUndo}
          onRetry={(candidateId) => retryDecision(candidateId)}
          onDismiss={dismissSnackbar}
        />
      </div>

      <ReviewFilterPane
        variant="overlay"
        isOpen={isFilterPaneOpen}
        onClose={() => setIsFilterPaneOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setActiveIndex(0);
        }}
        selectedUniversity={selectedUniversity}
        onSelectUniversity={(uni) => {
          setSelectedUniversity(uni);
          setActiveIndex(0);
        }}
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
