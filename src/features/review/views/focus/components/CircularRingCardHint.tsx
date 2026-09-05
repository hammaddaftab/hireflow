"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface CircularRingCardHintProps {
  direction: "left" | "right";
  onClick: () => void;
  isPulsing?: boolean;
  disabled?: boolean;
}

export function CircularRingCardHint({
  direction,
  onClick,
  isPulsing = false,
  disabled = false,
}: CircularRingCardHintProps) {
  const isLeft = direction === "left";

  if (disabled) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        isLeft
          ? "Rotate circular ring to previous candidate"
          : "Rotate circular ring to next candidate"
      }
      style={{
        // Precise in-plane 2D rotation matching the circumference of the ring
        transformOrigin: "center center",
      }}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${
        isLeft
          ? "-left-48 lg:-left-36 xl:-left-28 hover:-left-44 lg:hover:-left-32 xl:hover:-left-24"
          : "-right-48 lg:-right-36 xl:-right-28 hover:-right-44 lg:hover:-right-32 xl:hover:-right-24"
      } ${
        isPulsing
          ? isLeft
            ? "animate-arc-pulse-left"
            : "animate-arc-pulse-right"
          : isLeft
          ? "rotate-[-12deg] translate-y-3 hover:rotate-[-9deg] hover:translate-y-1"
          : "rotate-[12deg] translate-y-3 hover:rotate-[9deg] hover:translate-y-1"
      } w-64 lg:w-72 h-[380px] lg:h-[400px] rounded-3xl bg-surface/90 dark:bg-surface-container/90 backdrop-blur-xl border border-outline-variant/50 shadow-2xl items-center ${
        isLeft ? "justify-end pr-6" : "justify-start pl-6"
      } cursor-pointer group hover:opacity-100 opacity-65 transition-all duration-300 select-none z-10`}
      title={isLeft ? "Previous candidate on ring (←)" : "Next candidate on ring (→ / Space)"}
    >
      {/* Sleek edge indicator and directional hint */}
      <div className={`flex items-center gap-2 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant group-hover:text-primary transition-colors flex items-center gap-1">
          {isLeft ? (
            <>
              <ArrowLeft className="h-3 w-3 shrink-0" />
              <span>Prev</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
            </>
          )}
        </span>
        <div className="w-1.5 h-20 rounded-full bg-outline-variant/80 group-hover:bg-primary transition-colors" />
      </div>
    </button>
  );
}
