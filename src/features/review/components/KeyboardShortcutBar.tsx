"use client";

import React from "react";
import { Keyboard, Bookmark, Check, X, Eye } from "lucide-react";

export function KeyboardShortcutBar() {
  return (
    <div className="flex justify-center w-full">
      {/* Floating Island Dock (Libadwaita / Tonal Surface Paradigm) */}
      <div className="bg-surface-container-highest/95 dark:bg-surface-container-high/95 backdrop-blur-md rounded-full px-5 py-2 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs text-on-surface border-0">
        <div className="flex items-center gap-2 font-medium text-on-surface pl-1">
          <div className="h-6 w-6 rounded-full bg-surface/50 flex items-center justify-center">
            <Keyboard className="h-3.5 w-3.5 text-on-surface" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
            Shortcuts
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Keep */}
          <div className="flex items-center gap-1.5 bg-surface/40 hover:bg-surface/70 px-2.5 py-1 rounded-full transition-colors">
            <kbd className="px-2 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              A
            </kbd>
            <span className="text-on-surface-variant font-medium">/</span>
            <kbd className="px-2 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              Space
            </kbd>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 ml-0.5">
              <Check className="h-3 w-3 shrink-0" /> Keep
            </span>
          </div>

          {/* Flag */}
          <div className="flex items-center gap-1.5 bg-surface/40 hover:bg-surface/70 px-2.5 py-1 rounded-full transition-colors">
            <kbd className="px-2 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              F
            </kbd>
            <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 ml-0.5">
              <Bookmark className="h-3 w-3 shrink-0" /> Flag
            </span>
          </div>

          {/* Pass */}
          <div className="flex items-center gap-1.5 bg-surface/40 hover:bg-surface/70 px-2.5 py-1 rounded-full transition-colors">
            <kbd className="px-2 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              R
            </kbd>
            <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1 ml-0.5">
              <X className="h-3 w-3 shrink-0" /> Pass
            </span>
          </div>

          {/* Evidence */}
          <div className="flex items-center gap-1.5 bg-surface/40 hover:bg-surface/70 px-2.5 py-1 rounded-full transition-colors">
            <kbd className="px-2 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              E
            </kbd>
            <span className="font-semibold text-on-surface flex items-center gap-1 ml-0.5">
              <Eye className="h-3 w-3 shrink-0 text-on-surface-variant" /> Evidence
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1.5 bg-surface/40 px-2.5 py-1 rounded-full text-on-surface-variant">
            <kbd className="px-1.5 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-surface rounded-full font-mono text-[11px] font-bold text-on-surface shadow-2xs">
              →
            </kbd>
            <span className="text-[11px] font-medium text-on-surface ml-0.5">
              Navigate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
