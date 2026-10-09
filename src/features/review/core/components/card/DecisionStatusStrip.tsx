"use client";

import React, { useState, useEffect } from "react";
import { DECISION_CONFIGS, useRelativeTime } from "../../utils/decisionStyles";
import type { ReviewDecision } from "@/entities/review";
import { RotateCcw, AlertCircle, Loader2 } from "lucide-react";

export interface DecisionStatusStripProps {
  decision: ReviewDecision;
  decidedAt?: string | null;
  previousDecision?: ReviewDecision | null;
  syncStatus?: "saved" | "saving" | "failed";
  onClearDecision?: () => void;
  onRetrySync?: () => void;
  onChangeFocus?: () => void;
  isCommitting?: boolean;
}

export function DecisionStatusStrip({
  decision,
  decidedAt,
  previousDecision,
  syncStatus = "saved",
  onClearDecision,
  onRetrySync,
  onChangeFocus,
  isCommitting = false,
}: DecisionStatusStripProps) {
  const config = DECISION_CONFIGS[decision];
  const Icon = config.icon;
  const isDecided = decision !== "pending";
  const relativeTime = useRelativeTime(decidedAt);

  // 'Saving...' only appears if the write takes longer than 1s (fast saves stay invisible)
  const [showSaving, setShowSaving] = useState(false);
  useEffect(() => {
    if (syncStatus === "saving") {
      const timer = setTimeout(() => setShowSaving(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSaving(false);
    }
  }, [syncStatus]);

  return (
    <div
      className={`w-full h-9 shrink-0 px-4 flex items-center justify-between text-xs select-none transition-colors duration-200 overflow-hidden ${
        config.stripBg
      } ${isCommitting ? "animate-pulse" : ""}`}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[11px]">
          {isDecided ? (
            <>
              <Icon className={`h-3.5 w-3.5 shrink-0 ${config.textColor}`} />
              <span className={config.textColor}>{config.pastLabel}</span>
            </>
          ) : (
            <span className="text-on-surface-variant/70">Undecided</span>
          )}
        </div>

        {isDecided && relativeTime && (
          <span className="text-[11px] text-on-surface-variant font-medium">
            · {relativeTime}
          </span>
        )}

        {isDecided && previousDecision && previousDecision !== decision && previousDecision !== "pending" && (
          <span className="text-[11px] text-on-surface-variant font-medium">
            · was {DECISION_CONFIGS[previousDecision].pastLabel}
          </span>
        )}

        {showSaving && (
          <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
            <span>Saving...</span>
          </span>
        )}

        {syncStatus === "failed" && (
          <button
            type="button"
            onClick={onRetrySync}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer border-0 bg-transparent p-0"
            title="Failed to save decision. Click to retry."
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>Not saved, Retry</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isDecided ? (
          <>
            {onChangeFocus && (
              <button
                type="button"
                onClick={onChangeFocus}
                className="text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-0 bg-transparent p-0"
                title="Change candidate decision focus"
              >
                Change
              </button>
            )}

            {onClearDecision && (
              <button
                type="button"
                onClick={onClearDecision}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-0 bg-transparent p-0"
                title="Clear decision back to undecided (U)"
              >
                <RotateCcw className="h-3 w-3 shrink-0" />
                <span>Clear U</span>
              </button>
            )}
          </>
        ) : (
          <span className="text-[10px] font-mono text-on-surface-variant/70 hidden sm:inline">
            A Keep · F Flag · R Pass
          </span>
        )}
      </div>
    </div>
  );
}
