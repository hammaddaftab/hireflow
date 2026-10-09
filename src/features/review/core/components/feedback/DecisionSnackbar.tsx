"use client";

import React, { useEffect, useRef } from "react";
import { RotateCcw, AlertCircle, X } from "lucide-react";
import { DECISION_CONFIGS } from "../../utils/decisionStyles";
import type { ReviewDecision } from "@/entities/review";

export interface SnackbarState {
  id: string;
  type: "decision" | "change" | "repeat" | "clear" | "restored" | "error";
  candidateId: string;
  candidateName: string;
  decision?: ReviewDecision;
  previousDecision?: ReviewDecision;
  errorMessage?: string;
  canUndo?: boolean;
}

export interface DecisionSnackbarProps {
  state: SnackbarState | null;
  onUndo?: () => void;
  onRetry?: (candidateId: string) => void;
  onDismiss: () => void;
  durationMs?: number;
}

export function DecisionSnackbar({
  state,
  onUndo,
  onRetry,
  onDismiss,
  durationMs = 6000,
}: DecisionSnackbarProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (!state) return;

    const startTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!isHoveredRef.current) {
          onDismiss();
        }
      }, durationMs);
    };

    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, durationMs, onDismiss]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    timerRef.current = setTimeout(onDismiss, 2500);
  };

  if (!state) return null;

  const decisionConfig = state.decision ? DECISION_CONFIGS[state.decision] : null;
  const DecisionIcon = decisionConfig?.icon || RotateCcw;

  // Accessible screen-reader announcement text
  const srText = (() => {
    if (state.type === "error") return `Error: ${state.errorMessage || "Failed to save decision"}`;
    if (state.type === "repeat") return `Candidate ${state.candidateName} already ${decisionConfig?.pastLabel.toLowerCase()}`;
    if (state.type === "change" && state.previousDecision && state.decision && decisionConfig) {
      return `Changed decision for ${state.candidateName} from ${DECISION_CONFIGS[state.previousDecision].pastLabel} to ${decisionConfig.pastLabel}`;
    }
    if (state.type === "clear") return `Cleared decision for ${state.candidateName}`;
    if (state.type === "restored" && state.decision) return `Restored ${decisionConfig?.pastLabel} for ${state.candidateName}`;
    return `${decisionConfig?.pastLabel || "Marked"} ${state.candidateName}`;
  })();

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srText}
      </div>

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-container-highest/95 dark:bg-surface-container-high/95 backdrop-blur-md border border-outline-variant/60 shadow-xl text-xs text-on-surface animate-in fade-in slide-in-from-bottom-2 duration-150 select-none max-w-md"
      >
        {state.type === "error" ? (
          <div className="h-6 w-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
        ) : (
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
              decisionConfig ? decisionConfig.indicatorColor + " text-white" : "bg-surface-container text-on-surface"
            }`}
          >
            <DecisionIcon className="h-3.5 w-3.5" />
          </div>
        )}

        <div className="flex-1 min-w-0 pr-1">
          {state.type === "error" ? (
            <p className="font-semibold text-rose-600 dark:text-rose-400 truncate">
              {state.errorMessage || `Could not save decision for ${state.candidateName}`}
            </p>
          ) : state.type === "repeat" ? (
            <p className="text-on-surface truncate">
              Already {decisionConfig?.pastLabel.toLowerCase()} • <span className="font-semibold">{state.candidateName}</span>
            </p>
          ) : state.type === "change" && state.previousDecision && state.decision ? (
            <p className="text-on-surface truncate">
              Changed <span className="font-medium text-on-surface-variant">{DECISION_CONFIGS[state.previousDecision].pastLabel}</span> to{" "}
              <span className={`font-bold ${decisionConfig?.textColor}`}>{decisionConfig?.pastLabel}</span> •{" "}
              <span className="font-semibold">{state.candidateName}</span>
            </p>
          ) : state.type === "clear" ? (
            <p className="text-on-surface truncate">
              Cleared decision for <span className="font-semibold">{state.candidateName}</span>
            </p>
          ) : state.type === "restored" && state.decision ? (
            <p className="text-on-surface truncate">
              Restored <span className={`font-bold ${decisionConfig?.textColor}`}>{decisionConfig?.pastLabel}</span> •{" "}
              <span className="font-semibold">{state.candidateName}</span>
            </p>
          ) : (
            <p className="text-on-surface truncate">
              <span className={`font-bold ${decisionConfig?.textColor}`}>{decisionConfig?.pastLabel}</span>{" "}
              <span className="font-semibold">{state.candidateName}</span>
            </p>
          )}
        </div>

        {state.type === "error" && onRetry ? (
          <button
            type="button"
            onClick={() => onRetry(state.candidateId)}
            className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer border-0 shrink-0"
          >
            Retry
          </button>
        ) : state.canUndo && onUndo ? (
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs cursor-pointer border border-outline-variant/40 shrink-0 transition-colors"
            title="Undo decision (Z)"
            aria-label="Undo decision (Z)"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Undo</span>
            <kbd className="ml-0.5 px-1 py-0.2 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant font-bold">
              Z
            </kbd>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onDismiss}
          className="h-6 w-6 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center cursor-pointer border-0 shrink-0 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
