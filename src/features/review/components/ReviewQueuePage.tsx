"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CandidateCard } from "./CandidateCard";
import { KeyboardShortcutBar } from "./KeyboardShortcutBar";
import { ReviewDeckControls } from "./ReviewDeckControls";
import { EvidentiaryLegend } from "./EvidentiaryLegend";
import { useReviewQueue } from "../hooks/useReviewQueue";
import { CandidateReviewItem, QueueFilterTab } from "../types";
import type { Job } from "@/entities/job";

export interface ReviewQueuePageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
}

export function ReviewQueuePage({
  initialJob,
  initialQueue,
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
}: ReviewQueuePageProps) {
  const router = useRouter();

  const {
    queue,
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    filteredQueue,
    scopedActiveItem,
    handleDecision,
    resetFilters,
    stats,
  } = useReviewQueue({
    initialJob,
    initialQueue,
    initialIndex,
    initialTab,
    initialCity,
    initialGroupId,
  });

  const handleEnterFocusMode = () => {
    const params = new URLSearchParams();
    if (activeIndex > 0) params.set("candidateIndex", String(activeIndex));
    if (activeTab !== "all") params.set("tab", activeTab);
    const q = params.toString();
    router.push(q ? `/review/focus?${q}` : "/review/focus");
  };

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
    <div className="max-w-[1600px] mx-auto pb-16">
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

          {/* Candidate Position and Decision Counts */}
          <div className="flex flex-col items-start sm:items-end gap-1 self-start sm:self-center">
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
      </header>

      {/* Main Candidate Review Queue Area (Centered & Spacious) */}
      <main ref={mainPaneRef} className="max-w-4xl mx-auto w-full space-y-4 pb-20">
        {/* Top Bar: Queue Segmented Tabs + Stepper Controls */}
        <ReviewDeckControls
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setActiveIndex(0);
          }}
          tabCounts={{
            all: filteredQueue.length,
            fastClear: stats.fastClearCount,
            needsAttention: queue.filter((i) => !i.isAllBlockingConfirmed && !i.hasContradicted).length,
            contradicted: queue.filter((i) => i.hasContradicted).length,
          }}
          onEnterFocusMode={handleEnterFocusMode}
        />

        {/* Evidentiary Status Legend (Non-Terminal Evidence Dots) */}
        <EvidentiaryLegend className="px-1" />

        {/* Active Candidate Focused Card */}
        {scopedActiveItem ? (
          <div
            key={scopedActiveItem.candidate.id}
            className="transition-all duration-200 animate-in fade-in-50"
          >
            <CandidateCard
              item={scopedActiveItem}
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
              Try switching to &quot;All Candidates&quot; or resetting the queue filters.
            </Typography>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="primary" size="sm" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Fixed Hotkey Dock at Sticky Offset */}
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
    </div>
  );
}
