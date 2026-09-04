"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Minimize2 } from "lucide-react";
import { CandidateCard } from "./CandidateCard";
import { CircularRingCardHint } from "./CircularRingCardHint";
import { CircularRingTrack } from "./CircularRingTrack";
import { FocusCommandBar } from "./FocusCommandBar";
import { useReviewQueue } from "../hooks/useReviewQueue";
import { CandidateReviewItem, QueueFilterTab, FocusDimension } from "../types";
import { Job } from "@/features/jobs/types";

export interface FocusReviewPageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
  initialIndex?: number;
  initialTab?: QueueFilterTab;
  initialCity?: string | null;
  initialGroupId?: string | null;
  initialDimension?: FocusDimension;
}

export function FocusReviewPage({
  initialJob,
  initialQueue,
  initialIndex = 0,
  initialTab = "all",
  initialCity = null,
  initialGroupId = null,
  initialDimension = "all",
}: FocusReviewPageProps) {
  const router = useRouter();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  const handleExitFocus = useCallback(() => {
    const params = new URLSearchParams();
    if (activeIndex > 0) params.set("candidateIndex", String(activeIndex));
    if (activeTab !== "all") params.set("tab", activeTab);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedGroupId && selectedGroupId !== "grp_all") params.set("group", selectedGroupId);
    if (activeDimension !== "all") params.set("dimension", activeDimension);
    const q = params.toString();
    router.push(q ? `/review?${q}` : "/review");
  }, [router]);

  const {
    activeIndex,
    activeTab,
    selectedCity,
    selectedGroupId,
    activeDimension,
    filteredQueue,
    scopedActiveItem,
    lastNavigationDirection,
    handleNext,
    handlePrev,
    handleDecision,
  } = useReviewQueue({
    initialJob,
    initialQueue,
    initialIndex,
    initialTab,
    initialCity,
    initialGroupId,
    initialDimension,
    onExitFocus: handleExitFocus,
  });

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

  // Keyboard shortcut for toggling evidence inspection (E key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsEvidenceOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      {/* Top-Right Position Indicator (n/m) and Discreet Exit */}
      <div className="absolute top-5 right-6 z-40 flex items-center gap-3 select-none">
        <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-on-surface-variant/80">
          {activeIndex + 1}/{totalCandidates}
        </span>
        <button
          type="button"
          onClick={handleExitFocus}
          className="p-1.5 rounded-lg text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
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
    </div>
  );
}
