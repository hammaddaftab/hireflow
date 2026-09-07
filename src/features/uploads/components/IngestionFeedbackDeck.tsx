"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2,
  MapPin,
  GraduationCap,
  ArrowRight,
  Inbox,
  RotateCcw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { CandidateReviewItem } from "@/features/review/types";
import { buildReviewQueue } from "@/features/review/core/services/reviewQueueService";

export interface IngestionFeedbackDeckProps {
  isExtracting: boolean;
  currentIndex: number;
  totalCount: number;
  currentFilename: string;
  candidates: ParsedCandidateProfile[];
  targetJob: Job;
  errorMessage?: string | null;
  onDismiss: () => void;
}

// Spring physics matching Fedora/GNOME spatial deck
const STACK_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.85,
} as const;

// Returns strictly at most 3 items to render based on the active index
function getVisibleItems<T>(
  items: T[],
  activeIndex: number
): { item: T; originalIndex: number }[] {
  const total = items.length;
  if (total === 0) return [];
  if (total <= 3) {
    return items.map((item, index) => ({ item, originalIndex: index }));
  }

  // Symmetrical horizontal spread: prev, active, next
  if (activeIndex === 0) {
    return [
      { item: items[0], originalIndex: 0 },
      { item: items[1], originalIndex: 1 },
      { item: items[2], originalIndex: 2 },
    ];
  }
  if (activeIndex === total - 1) {
    return [
      { item: items[total - 3], originalIndex: total - 3 },
      { item: items[total - 2], originalIndex: total - 2 },
      { item: items[total - 1], originalIndex: total - 1 },
    ];
  }
  return [
    { item: items[activeIndex - 1], originalIndex: activeIndex - 1 },
    { item: items[activeIndex], originalIndex: activeIndex },
    { item: items[activeIndex + 1], originalIndex: activeIndex + 1 },
  ];
}

export function IngestionFeedbackDeck({
  isExtracting,
  currentIndex,
  totalCount,
  currentFilename,
  candidates,
  targetJob,
  errorMessage,
  onDismiss,
}: IngestionFeedbackDeckProps) {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Automatically focus the latest card as candidates arrive
  useEffect(() => {
    if (candidates.length > 0) {
      setActiveCardIndex(candidates.length - 1);
    }
  }, [candidates.length]);

  // Evaluated candidate review items
  const candidateReviewItems: CandidateReviewItem[] = useMemo(() => {
    if (!targetJob || candidates.length === 0) return [];
    return buildReviewQueue(candidates, targetJob);
  }, [candidates, targetJob]);

  // Max 3 rendered cards window
  const visibleCardEntries = useMemo(() => {
    return getVisibleItems(candidateReviewItems, activeCardIndex);
  }, [candidateReviewItems, activeCardIndex]);

  // Keyboard navigation for active card deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept arrow keys if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        setActiveCardIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveCardIndex((prev) =>
          Math.min(candidateReviewItems.length - 1, prev + 1)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [candidateReviewItems.length]);

  // Horizontal swipe handler
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) {
      setActiveCardIndex((prev) =>
        Math.min(candidateReviewItems.length - 1, prev + 1)
      );
    } else if (info.offset.x > 40) {
      setActiveCardIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const isFinished = !isExtracting && candidates.length > 0;

  return (
    <div className="rounded-2xl border border-outline-variant/70 bg-surface shadow-md p-6 space-y-4 animate-in fade-in-50 duration-300">
      {/* Top Banner / Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          {isExtracting ? (
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-on-surface">
                {isExtracting
                  ? `Extracting Candidate Profiles (${Math.min(currentIndex + 1, totalCount)}/${totalCount})`
                  : `Extraction Complete (${candidates.length} candidate${candidates.length === 1 ? "" : "s"} staged)`}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
              {isExtracting
                ? `Parsing multi-aspect profile from ${currentFilename || "document"}...`
                : "Candidate profiles parsed and linked to role. Drag cards or use arrow keys to browse."}
            </p>
          </div>
        </div>

        {/* Header Controls: Deck Navigator & Dismiss Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {candidateReviewItems.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-on-surface-variant">
                Card <strong>{activeCardIndex + 1}</strong> of <strong>{candidateReviewItems.length}</strong>
              </span>
              <div className="inline-flex items-center border border-outline-variant/60 rounded-lg overflow-hidden bg-surface-container">
                <button
                  type="button"
                  onClick={() => setActiveCardIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeCardIndex === 0}
                  className="p-1.5 hover:bg-surface-container-high disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-on-surface-variant"
                  title="Previous candidate (Left arrow)"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveCardIndex((prev) =>
                      Math.min(candidateReviewItems.length - 1, prev + 1)
                    )
                  }
                  disabled={activeCardIndex === candidateReviewItems.length - 1}
                  className="p-1.5 hover:bg-surface-container-high disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-on-surface-variant"
                  title="Next candidate (Right arrow)"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 rounded-lg text-on-surface-variant hover:text-on-surface cursor-pointer"
            title="Dismiss feedback deck"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stacked Cards Deck Area */}
      <div className="relative flex items-center justify-center overflow-hidden py-4 min-h-[420px]">
        {candidateReviewItems.length === 0 && isExtracting && (
          <div className="text-center space-y-3 py-12">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center animate-spin">
              <RotateCcw className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-on-surface">
              Parsing document text and extracting candidate profile...
            </p>
            <p className="text-[11px] text-on-surface-variant font-mono">
              Target Job: {targetJob.title}
            </p>
          </div>
        )}

        {candidateReviewItems.length > 0 && (
          <div className="relative w-full max-w-xl h-[390px] flex items-center justify-center">
            <AnimatePresence mode="sync">
              {visibleCardEntries.map(({ item, originalIndex }) => {
                const diff = originalIndex - activeCardIndex;
                const isActive = diff === 0;

                // Horizontal spread physics:
                // Active card: center (x: 0), scale 1, zIndex 30
                // Flanking cards: x = diff * 48px, scale 0.94, zIndex 20
                const xOffset = diff * 48;
                const scale = Math.max(0.85, 1 - Math.abs(diff) * 0.04);
                const zIndex = 30 - Math.abs(diff);
                const opacity = Math.max(0.55, 1 - Math.abs(diff) * 0.18);

                const { candidate } = item;
                const currentRole = candidate.work_history.entries[0];
                const primaryEdu = candidate.education.entries[0];
                const locationCity =
                  candidate.identity.location.normalized?.city ||
                  candidate.identity.location.raw ||
                  "Unspecified";

                return (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, x: diff * 80, scale: 0.88 }}
                    animate={{
                      opacity,
                      x: xOffset,
                      y: 0,
                      scale,
                      zIndex,
                    }}
                    exit={{ opacity: 0, scale: 0.82, x: -100 }}
                    transition={STACK_SPRING}
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={handleDragEnd}
                    onClick={() => setActiveCardIndex(originalIndex)}
                    className={`absolute inset-x-0 cursor-pointer rounded-2xl border bg-surface p-6 select-none transition-shadow ${
                      isActive
                        ? "border-primary/80 ring-1 ring-primary/30 shadow-2xl"
                        : "border-outline-variant/60 shadow-lg hover:border-outline-variant hover:shadow-xl"
                    }`}
                    style={{
                      height: "370px",
                      top: "10px",
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Card Content */}
                    <div className="h-full flex flex-col justify-between pointer-events-none">
                      {/* Card Header (Clean: Name, City, Role, Exp) */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-on-surface tracking-tight truncate">
                                {candidate.identity.name}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold py-0.5 px-2 rounded-full border border-outline-variant/60 bg-surface-container-low text-on-surface-variant shrink-0 whitespace-nowrap">
                                <MapPin className="h-3 w-3 shrink-0 text-on-surface-variant" />
                                <span>{locationCity}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap pt-1.5">
                              {currentRole && (
                                <span className="flex items-center gap-1 font-semibold text-on-surface">
                                  <Briefcase className="h-3 w-3 text-on-surface-variant shrink-0" />
                                  <span className="truncate max-w-[220px]">
                                    {currentRole.title} • {currentRole.employer}
                                  </span>
                                </span>
                              )}

                              <span className="flex items-center gap-1 font-medium">
                                <Building2 className="h-3 w-3 text-on-surface-variant shrink-0" />
                                <span>{item.verifiedYearsExperience} yrs exp</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Education Info */}
                        {primaryEdu && (
                          <div className="pt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                            <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">
                              {primaryEdu.degree_level.normalized || primaryEdu.degree_level.raw} in{" "}
                              {primaryEdu.field?.normalized || primaryEdu.field?.raw || "Engineering"} •{" "}
                              {primaryEdu.institution.normalized || primaryEdu.institution.raw}
                            </span>
                          </div>
                        )}

                        {/* Review Queue Placeholder Container */}
                        <div className="my-2 p-4 rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low/50 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                            <Inbox className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-on-surface truncate">
                              Profile Staged for Review Queue
                            </p>
                            <p className="text-[11px] text-on-surface-variant leading-relaxed">
                              Demonstrated competencies, evidence spans, and criteria breakdown are ready to watch in the Review Queue.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div className="flex items-center gap-2 font-mono text-[11px] text-primary font-semibold pt-3 border-t border-outline-variant/30">
                        <span className="">{targetJob.title}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Action Strip */}
      {isFinished && (
        <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-3 text-xs">
          <span className="text-on-surface-variant font-mono text-[11px]">
            {candidates.length} candidate{candidates.length === 1 ? "" : "s"} ready for criteria review
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="h-8 px-3 rounded-xl text-xs"
            >
              Dismiss Deck
            </Button>
            <Link href="/review">
              <Button
                variant="primary"
                size="sm"
                className="h-8 px-3.5 rounded-xl gap-1.5 text-xs font-semibold"
              >
                <span>Go to Review Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
