"use client";

import React from "react";
import { Keyboard, Bookmark, Check, X, Eye } from "lucide-react";

export function KeyboardShortcutBar() {
  return (
    <div className="bg-surface-container-high/90 backdrop-blur-sm border border-outline-variant rounded-lg p-2 px-4 shadow-sm text-xs text-on-surface flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 font-medium text-on-surface">
        <Keyboard className="h-4 w-4 text-on-surface-variant" />
        <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Queue Shortcuts:</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            A
          </kbd>
          <span className="text-on-surface-variant">/</span>
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            Space
          </kbd>
          <span className="text-on-surface font-medium flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 inline" /> Keep
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            F
          </kbd>
          <span className="text-on-surface font-medium flex items-center gap-1">
            <Bookmark className="h-3 w-3 text-amber-600 dark:text-amber-400 inline" /> Flag Follow-up
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            R
          </kbd>
          <span className="text-on-surface font-medium flex items-center gap-1">
            <X className="h-3 w-3 text-rose-600 dark:text-rose-400 inline" /> Pass
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            E
          </kbd>
          <span className="text-on-surface font-medium flex items-center gap-1">
            <Eye className="h-3 w-3 text-on-surface-variant inline" /> Evidence
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-surface rounded border border-outline font-mono font-semibold text-on-surface shadow-2xs">
            →
          </kbd>
          <span className="text-on-surface-variant">
            Navigate
          </span>
        </div>
      </div>
    </div>
  );
}
