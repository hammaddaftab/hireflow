"use client";

import React from "react";
import type { CandidateReviewItem } from "../../../types";
import type { ReviewDecision } from "@/entities/review";
import { DECISION_CONFIGS } from "../../utils/decisionStyles";

export interface DecisionProgressStripProps {
  items: CandidateReviewItem[];
  activeIndex: number;
  onSelectIndex?: (index: number) => void;
  className?: string;
}

export function DecisionProgressStrip({
  items,
  activeIndex,
  onSelectIndex,
  className = "",
}: DecisionProgressStripProps) {
  const total = items.length;
  if (total === 0) return null;

  return (
    <div
      className={`w-full flex items-center gap-0.5 sm:gap-1 py-1.5 select-none ${className}`}
      role="progressbar"
      aria-label="Candidate review queue progress"
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {items.map((item, index) => {
        const isCurrent = index === activeIndex;
        const isDecided = item.decision !== "pending";
        const config = DECISION_CONFIGS[item.decision as ReviewDecision] || DECISION_CONFIGS.pending;

        return (
          <button
            key={item.candidate.id}
            type="button"
            onClick={() => onSelectIndex?.(index)}
            className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all cursor-pointer border-0 p-0 focus:outline-none focus:ring-1 focus:ring-primary ${
              isCurrent
                ? "ring-2 ring-primary ring-offset-1 ring-offset-surface scale-y-125 z-10"
                : "opacity-80 hover:opacity-100 hover:scale-y-110"
            } ${
              isDecided
                ? config.indicatorColor
                : "bg-surface-container-highest dark:bg-surface-container-high"
            }`}
            title={`#${index + 1}: ${item.candidate.identity.name} (${config.label})`}
            aria-label={`Candidate ${index + 1}: ${item.candidate.identity.name}, ${config.label}`}
          />
        );
      })}
    </div>
  );
}
