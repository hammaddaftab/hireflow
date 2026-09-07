"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Briefcase, MapPin, CheckCircle2, AlertCircle, X, Network } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Job } from "@/entities/job";
import type { QueueFilterTab } from "@/entities/review";
import type { CandidateReviewItem } from "../../types";
import { useReviewData } from "../../core/hooks/useReviewData";
import { buildReviewQueue } from "../../core/services/reviewQueueService";
import { useQueueView } from "./hooks/useQueueView";
import { CandidateCard } from "../../core/components/card/CandidateCard";
import { ReviewDeckControls } from "./components/ReviewDeckControls";
import { EvidentiaryLegend } from "./components/EvidentiaryLegend";
import { KeyboardShortcutBar } from "./components/KeyboardShortcutBar";
import {
  useResumeDropUpload,
  ResumeDropOverlay,
  ResumeDropTrigger,
} from "@/components/upload";

import { type PersistedGroupWithMembers, ActiveGroupCanvasModal } from "@/features/groups";
import { FEATURES } from "@/config/features";
import { ReviewFilterPane } from "../focus/components/ReviewFilterPane";

export interface ReviewQueuePageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialPersistedGroups?: PersistedGroupWithMembers[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
}

export function ReviewQueuePage({
  initialJob,
  initialQueue,
  initialPersistedGroups = [],
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
}: ReviewQueuePageProps) {
  // Tier 1: Domain State Engine
  const {
    queue,
    setQueue,
    handleDecision: updateDecision,
    stats,
    queryGroups,
    cityDistribution,
    persistedGroups,
  } = useReviewData(initialQueue, initialPersistedGroups);

  const candidates = useMemo(() => queue.map((item) => item.candidate), [queue]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Real-time feedback alert banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
  } = useQueueView({
    queue,
    queryGroups,
    initialIndex,
    initialTab,
    initialCity,
    initialGroupId,
    onDecision: updateDecision,
  });

  const activeGroupName = queryGroups.find((g) => g.id === selectedGroupId)?.name || "All Applicants (Default)";
  const activeGroupCount = queryGroups.find((g) => g.id === selectedGroupId)?.candidateIds.length ?? queue.length;

  // Tier 2.5: Drag and Drop Resume Ingestion Engine (Vercel Blob Storage + Sequential LLM Extraction)
  const {
    isDraggingOver,
    uploads,
    isUploading,
    statusLabel,
    uploadFiles,
  } = useResumeDropUpload({
    jobId: initialJob.id,
    onCandidateIngested: (candidate) => {
      // Evaluate candidate profile against active job requirements and append to triage queue
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

  // Track main pane width and left offset for floating hotkeys dock
  const mainPaneRef = useRef<HTMLElement>(null);
  const [mainBounds, setMainBounds] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (mainPaneRef.current) {
        const rect = mainPaneRef.current.getBoundingClientRect();
        setMainBounds({ left: rect.left, width: rect.width });
      }
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    if (mainPaneRef.current) {
      resizeObserver.observe(mainPaneRef.current);
    }

    window.addEventListener("resize", updateBounds);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto pb-16 relative">
      {/* Visual Drag and Drop Overlay for Candidate Resumes */}
      <ResumeDropOverlay isVisible={isDraggingOver} />

      {/* Top Application Header */}
      <header className="mb-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                HireFlow Triage
              </span>
              <span className="text-xs text-on-surface-variant font-mono">• Sequential Review</span>
            </div>
            <Typography variant="headline-medium" className="text-on-surface font-bold">
              {initialJob.title}
            </Typography>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {initialJob.department || "Engineering"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {initialJob.location || "Pakistan"}
              </span>
              <span className="font-mono text-xs">
                {stats.decisionsMade} / {stats.totalCount} Decided
              </span>
            </div>
          </div>

          {/* Candidate Position, Decision Counts, and Active Group Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start sm:self-center">
            {/* Active Group Button (Opens Canvas Modal) */}
            {FEATURES.CANDIDATE_GROUPS && (
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer text-xs font-semibold text-on-surface shadow-2xs"
                title="Change Active Group (Canvas Topology)"
                aria-label="Change Active Group"
              >
                <Network className="h-4 w-4 text-primary shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Active Group</span>
                  <span className="text-xs font-bold text-on-surface truncate max-w-[160px]">{activeGroupName}</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-container-high font-bold text-on-surface-variant ml-0.5">
                  {activeGroupCount}
                </span>
              </button>
            )}

            <div className="flex flex-col items-start sm:items-end gap-1">
              <Typography variant="title-large" className="text-on-surface text-3xl sm:text-4xl leading-none">
                {filteredQueue.length > 0 ? `${activeIndex + 1} / ${filteredQueue.length}` : "0 / 0"}
              </Typography>
              <div className="flex flex-col gap-0.5 w-28 text-xs text-on-surface-variant font-medium">
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
          </div>
        </div>
      </header>

      {/* Main Candidate Review Queue Area */}
      <main ref={mainPaneRef} className="max-w-4xl mx-auto w-full space-y-4 pb-20">
        {/* Real-time Ingestion Feedback Notification */}
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



        {/* Top Bar: Queue Segmented Tabs + Focus Trigger + Resume Drop Trigger */}
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
          rightSlot={
            <ResumeDropTrigger
              onFilesSelected={uploadFiles}
              uploadCount={uploads.length}
              isUploading={isUploading}
              statusLabel={statusLabel}
            />
          }
        />

        {/* Evidentiary Status Legend */}
        <EvidentiaryLegend className="px-1" />

        {/* Active Candidate Focused Card */}
        {activeItem ? (
          <div
            key={activeItem.candidate.id}
            className="transition-all duration-200 animate-in fade-in-50"
          >
            <CandidateCard
              item={activeItem}
              isActive={true}
              onDecision={handleDecision}
            />
          </div>
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

        {/* Fixed Hotkey Dock */}
        <div
          className="fixed bottom-4 z-30 pointer-events-none flex justify-center px-4 transition-[left,width] duration-150"
          style={
            mainBounds
              ? { left: `${mainBounds.left}px`, width: `${mainBounds.width}px` }
              : { left: 0, right: 0 }
          }
        >
          <div className="pointer-events-auto">
            <KeyboardShortcutBar />
          </div>
        </div>
      </main>

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
