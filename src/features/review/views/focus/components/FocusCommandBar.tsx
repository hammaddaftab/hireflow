"use client";

import React from "react";
import { Check, Bookmark, X, Eye, RotateCcw } from "lucide-react";
import type { ReviewDecision } from "@/entities/review";
import { DECISION_CONFIGS, useRelativeTime } from "../../../core/utils/decisionStyles";
import { Tooltip } from "@/components/ui/Tooltip";

export interface FocusCommandBarProps {
  currentDecision?: ReviewDecision;
  decidedAt?: string | null;
  isEvidenceOpen: boolean;
  canUndo?: boolean;
  onDecision: (decision: ReviewDecision) => void;
  onToggleEvidence: () => void;
  onUndo?: () => void;
  onClear?: () => void;
}

export function FocusCommandBar({
  currentDecision = "pending",
  decidedAt,
  isEvidenceOpen,
  canUndo = false,
  onDecision,
  onToggleEvidence,
  onUndo,
  onClear,
}: FocusCommandBarProps) {
  const isDecided = currentDecision !== "pending";
  const config = DECISION_CONFIGS[currentDecision];
  const relativeTime = useRelativeTime(decidedAt);

  return (
    <footer
      id="focus-command-bar"
      className="w-full shrink-0 bg-surface-container/95 dark:bg-[#090d16] border-t border-outline-variant/30 py-3 px-6 flex items-center justify-between gap-4 select-none z-30"
    >
      {/* Left: Status Segment */}
      <div className="flex items-center min-w-[140px] text-xs">
        {isDecided ? (
          <span className={`inline-flex items-center gap-1.5 font-bold ${config.textColor}`}>
            <config.icon className="h-3.5 w-3.5 shrink-0" />
            <span>{config.pastLabel}</span>
            {relativeTime && (
              <span className="text-on-surface-variant/70 font-normal font-mono">· {relativeTime}</span>
            )}
          </span>
        ) : (
          <span className="text-on-surface-variant/70 font-medium">Undecided</span>
        )}
      </div>

      {/* Center: Command Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
        {/* [A] KEEP */}
        <Tooltip
          content={
            isDecided
              ? currentDecision === "keep"
                ? "Candidate kept (A)"
                : "Change to Keep (A)"
              : "Keep candidate (A)"
          }
        >
          <button
            type="button"
            onClick={() => onDecision("keep")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isDecided
                ? currentDecision === "keep"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-xs"
                  : "bg-transparent text-on-surface border-outline-variant/60 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10"
                : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
            }`}
            aria-label={
              isDecided
                ? currentDecision === "keep"
                  ? "Candidate kept (A)"
                  : "Change to Keep (A)"
                : "Keep candidate (A)"
            }
          >
            <kbd
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                currentDecision === "keep"
                  ? "bg-emerald-700 text-white"
                  : "bg-surface-container-highest/60 text-on-surface-variant"
              }`}
            >
              A
            </kbd>
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{currentDecision === "keep" ? "Kept" : "Keep"}</span>
          </button>
        </Tooltip>

        {/* [F] FLAG */}
        <Tooltip
          content={
            isDecided
              ? currentDecision === "flag"
                ? "Candidate flagged (F)"
                : "Change to Flag (F)"
              : "Flag candidate (F)"
          }
        >
          <button
            type="button"
            onClick={() => onDecision("flag")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isDecided
                ? currentDecision === "flag"
                  ? "bg-amber-500 text-white hover:bg-amber-600 border-amber-500 shadow-xs"
                  : "bg-transparent text-on-surface border-outline-variant/60 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10"
                : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
            }`}
            aria-label={
              isDecided
                ? currentDecision === "flag"
                  ? "Candidate flagged (F)"
                  : "Change to Flag (F)"
                : "Flag candidate (F)"
            }
          >
            <kbd
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                currentDecision === "flag"
                  ? "bg-amber-600 text-white"
                  : "bg-surface-container-highest/60 text-on-surface-variant"
              }`}
            >
              F
            </kbd>
            <Bookmark className="h-3.5 w-3.5 shrink-0" />
            <span>{currentDecision === "flag" ? "Flagged" : "Flag"}</span>
          </button>
        </Tooltip>

        {/* [R] PASS */}
        <Tooltip
          content={
            isDecided
              ? currentDecision === "pass"
                ? "Candidate passed (R)"
                : "Change to Pass (R)"
              : "Pass candidate (R)"
          }
        >
          <button
            type="button"
            onClick={() => onDecision("pass")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isDecided
                ? currentDecision === "pass"
                  ? "bg-rose-600 text-white hover:bg-rose-700 border-rose-600 shadow-xs"
                  : "bg-transparent text-on-surface border-outline-variant/60 hover:border-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10"
                : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
            }`}
            aria-label={
              isDecided
                ? currentDecision === "pass"
                  ? "Candidate passed (R)"
                  : "Change to Pass (R)"
                : "Pass candidate (R)"
            }
          >
            <kbd
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                currentDecision === "pass"
                  ? "bg-rose-700 text-white"
                  : "bg-surface-container-highest/60 text-on-surface-variant"
              }`}
            >
              R
            </kbd>
            <X className="h-3.5 w-3.5 shrink-0" />
            <span>{currentDecision === "pass" ? "Passed" : "Pass"}</span>
          </button>
        </Tooltip>

        {/* [U] CLEAR */}
        {isDecided && onClear && (
          <Tooltip content="Clear decision back to undecided (U)">
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border bg-surface/70 hover:bg-surface text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant/40"
              aria-label="Clear decision back to undecided (U)"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/60 font-mono text-[10px] font-bold text-on-surface-variant">
                U
              </kbd>
              <span>Clear</span>
            </button>
          </Tooltip>
        )}

        {/* [E] EVIDENCE */}
        <Tooltip content="Toggle evidence drawer (E)">
          <button
            type="button"
            onClick={onToggleEvidence}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isEvidenceOpen
                ? "bg-primary/15 text-primary border-primary/40 shadow-xs"
                : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
            }`}
            aria-label="Toggle evidence drawer (E)"
          >
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/60 font-mono text-[10px] font-bold text-on-surface-variant">
              E
            </kbd>
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span>Evidence</span>
          </button>
        </Tooltip>
      </div>

      {/* Right End: Undo Button (appears when undo stack is not empty) */}
      <div className="flex items-center min-w-[140px] justify-end">
        {canUndo && onUndo && (
          <Tooltip content="Undo previous decision (Z)">
            <button
              type="button"
              onClick={onUndo}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border bg-surface-container-high/80 hover:bg-surface-container-highest text-on-surface border-outline-variant/40 hover:border-primary/50 shadow-2xs"
              aria-label="Undo previous decision (Z)"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/80 font-mono text-[10px] font-bold text-on-surface-variant">
                Z
              </kbd>
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Undo</span>
            </button>
          </Tooltip>
        )}
      </div>
    </footer>
  );
}
