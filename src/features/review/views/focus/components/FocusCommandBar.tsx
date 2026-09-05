"use client";

import React from "react";
import { Check, Bookmark, X, Eye } from "lucide-react";
import type { ReviewDecision } from "@/entities/review";

export interface FocusCommandBarProps {
  currentDecision?: ReviewDecision;
  isEvidenceOpen: boolean;
  onDecision: (decision: ReviewDecision) => void;
  onToggleEvidence: () => void;
}

export function FocusCommandBar({
  currentDecision,
  isEvidenceOpen,
  onDecision,
  onToggleEvidence,
}: FocusCommandBarProps) {
  return (
    <footer className="w-full shrink-0 bg-surface-container/95 dark:bg-[#090d16] border-t border-outline-variant/30 py-3.5 px-6 flex items-center justify-center select-none z-30">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* [A] KEEP */}
        <button
          type="button"
          onClick={() => onDecision("keep")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            currentDecision === "keep"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs"
              : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
          }`}
          title="Keep candidate (A)"
          aria-label="Keep candidate (A)"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/60 font-mono text-[10px] font-bold text-on-surface-variant">
            A
          </kbd>
          <Check className="h-3.5 w-3.5" />
          <span>Keep</span>
        </button>

        {/* [F] FLAG */}
        <button
          type="button"
          onClick={() => onDecision("flag")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            currentDecision === "flag"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs"
              : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
          }`}
          title="Flag candidate (F)"
          aria-label="Flag candidate (F)"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/60 font-mono text-[10px] font-bold text-on-surface-variant">
            F
          </kbd>
          <Bookmark className="h-3.5 w-3.5" />
          <span>Flag</span>
        </button>

        {/* [R] PASS */}
        <button
          type="button"
          onClick={() => onDecision("pass")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            currentDecision === "pass"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-xs"
              : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
          }`}
          title="Pass candidate (R)"
          aria-label="Pass candidate (R)"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/60 font-mono text-[10px] font-bold text-on-surface-variant">
            R
          </kbd>
          <X className="h-3.5 w-3.5" />
          <span>Pass</span>
        </button>

        {/* [E] EVIDENCE */}
        <button
          type="button"
          onClick={onToggleEvidence}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isEvidenceOpen
              ? "bg-primary/15 text-primary border-primary/40 shadow-xs"
              : "bg-surface/70 hover:bg-surface text-on-surface border-transparent hover:border-outline-variant/50"
          }`}
          title="Toggle evidence drawer (E)"
          aria-label="Toggle evidence drawer (E)"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest/60 font-mono text-[10px] font-bold text-on-surface-variant">
            E
          </kbd>
          <Eye className="h-3.5 w-3.5" />
          <span>Evidence</span>
        </button>
      </div>
    </footer>
  );
}
