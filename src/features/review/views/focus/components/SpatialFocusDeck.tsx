"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CandidateCard } from "../../../core/components/card/CandidateCard";
import { CandidateSideCard } from "./CandidateSideCard";
import type { CandidateReviewItem } from "../../../types";
import type { ReviewDecision } from "@/entities/review";
import { Typography } from "@/components/ui/Typography";

export interface SpatialFocusDeckProps {
  items: CandidateReviewItem[];
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onDecision: (decision: ReviewDecision) => void;
  isEvidenceOpen: boolean;
  onToggleEvidence: () => void;
  resetFilters: () => void;
}

// Ground-up calibrated Fedora/GNOME spring physics: silky cushioned glide
const FEDORA_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.85,
} as const;

interface VariantParams {
  offset: number;
  offsetDistance: number;
  isEvidenceOpen: boolean;
}

// Pure compositor transforms (x, scale, opacity) - 100% GPU accelerated
function getCardVariants({ offset, offsetDistance, isEvidenceOpen }: VariantParams) {
  if (offset === 0) {
    // Center card: full scale, front depth, full opacity
    return {
      initial: {
        x: 0,
        scale: 0.96,
        opacity: 0,
      },
      animate: {
        x: 0,
        scale: 1,
        opacity: 1,
      },
      exit: {
        x: 0,
        scale: 0.96,
        opacity: 0,
      },
    };
  }

  const isLeft = offset < 0;
  const targetX = isLeft ? -offsetDistance : offsetDistance;
  const offscreenX = isLeft ? -offsetDistance * 1.35 : offsetDistance * 1.35;

  return {
    initial: {
      x: offscreenX,
      scale: 0.74,
      opacity: 0,
    },
    animate: {
      x: targetX,
      scale: 0.84,
      opacity: isEvidenceOpen ? 0.2 : 0.6,
    },
    exit: {
      x: offscreenX,
      scale: 0.74,
      opacity: 0,
    },
  };
}

export function SpatialFocusDeck({
  items,
  activeIndex,
  onNext,
  onPrev,
  onDecision,
  isEvidenceOpen,
  onToggleEvidence,
  resetFilters,
}: SpatialFocusDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Deterministic initial state matching SSR to prevent React hydration mismatch
  const [stageWidth, setStageWidth] = useState<number>(1200);

  // Track stage width only on the client after hydration
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setStageWidth(containerRef.current.clientWidth);
      } else {
        setStageWidth(window.innerWidth);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate distance from center to side cards
  const offsetDistance = useMemo(() => {
    if (isEvidenceOpen) {
      return Math.max(820, stageWidth * 0.58);
    }
    const minCenterGap = 660;
    const responsiveOffscreen = stageWidth * 0.45;
    return Math.max(minCenterGap, responsiveOffscreen);
  }, [stageWidth, isEvidenceOpen]);

  const totalItems = items.length;

  // Window of rendered cards: left, center, right
  const visibleCards = useMemo(() => {
    const list: { item: CandidateReviewItem; offset: number }[] = [];
    if (totalItems === 0) return list;

    // Left neighbor (previous candidate)
    if (activeIndex > 0 && items[activeIndex - 1]) {
      list.push({
        item: items[activeIndex - 1],
        offset: -1,
      });
    }

    // Active center candidate
    if (items[activeIndex]) {
      list.push({
        item: items[activeIndex],
        offset: 0,
      });
    }

    // Right neighbor (next candidate)
    if (activeIndex < totalItems - 1 && items[activeIndex + 1]) {
      list.push({
        item: items[activeIndex + 1],
        offset: 1,
      });
    }

    return list;
  }, [items, activeIndex, totalItems]);

  // Handle tactile horizontal flick / swipe gesture on center card
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 80;
      const velocityThreshold = 300;

      if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
        if (activeIndex < totalItems - 1) {
          onNext();
        }
      } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
        if (activeIndex > 0) {
          onPrev();
        }
      }
    },
    [activeIndex, totalItems, onNext, onPrev]
  );

  if (totalItems === 0) {
    return (
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
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
    >
      {/* Ambient background depth radial glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[840px] h-[520px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.06] blur-3xl" />
      </div>

      {/* Spatial 3D Card Deck with Hardware-Accelerated Fedora Spring Physics */}
      <AnimatePresence initial={false}>
        {visibleCards.map(({ item, offset }) => {
          const variants = getCardVariants({ offset, offsetDistance, isEvidenceOpen });
          const isCenter = offset === 0;
          const isLeft = offset < 0;

          return (
            <motion.div
              key={item.candidate.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
              style={{
                zIndex: isCenter ? 20 : 10,
              }}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              whileHover={
                !isCenter
                  ? {
                      scale: 0.87,
                      opacity: 0.88,
                      transition: FEDORA_SPRING,
                    }
                  : undefined
              }
              transition={FEDORA_SPRING}
            >
              <div
                className={`pointer-events-auto ${
                  isCenter && isEvidenceOpen
                    ? "w-full max-w-5xl h-full px-4"
                    : "w-full max-w-2xl px-4"
                }`}
              >
                {isCenter ? (
                  // Center Apex Card: full interaction, evidence drawer expansion support
                  <motion.div
                    className="w-full relative shadow-2xl rounded-2xl"
                    drag={!isEvidenceOpen ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={!isEvidenceOpen ? handleDragEnd : undefined}
                  >
                    <CandidateCard
                      item={item}
                      isActive={true}
                      onDecision={onDecision}
                      hideActionButtons={true}
                      isLayer2Expanded={isEvidenceOpen}
                      onToggleLayer2={onToggleEvidence}
                      expandedFullHeight={isEvidenceOpen}
                    />
                  </motion.div>
                ) : (
                  // Side Preview Card: lightweight, vertically centered on common baseline, negative z-depth
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={isLeft ? onPrev : onNext}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (isLeft) onPrev();
                        else onNext();
                      }
                    }}
                    aria-label={
                      isLeft
                        ? `Previous candidate: ${item.candidate.identity.name}`
                        : `Next candidate: ${item.candidate.identity.name}`
                    }
                    title={
                      isLeft
                        ? "Previous candidate (←)"
                        : "Next candidate (→ / Space)"
                    }
                    className="cursor-pointer select-none group relative w-full"
                  >
                    {/* Directional navigation action pill at visible inner edge */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-highest/95 dark:bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/60 text-xs font-bold text-on-surface shadow-lg group-hover:border-primary/60 group-hover:text-primary transition-all duration-200 ${
                        isLeft ? "right-7" : "left-7"
                      }`}
                    >
                      {isLeft ? (
                        <>
                          <ChevronLeft className="h-4 w-4 shrink-0" />
                          <span>Prev</span>
                        </>
                      ) : (
                        <>
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </>
                      )}
                    </div>

                    {/* Hardware-accelerated depth dimming overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-neutral-950/15 dark:bg-black/35 pointer-events-none group-hover:opacity-0 transition-opacity duration-200 z-10" />

                    {/* Ultra-lightweight pre-rendered candidate preview */}
                    <CandidateSideCard item={item} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
