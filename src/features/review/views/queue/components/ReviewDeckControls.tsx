"use client";

import React from "react";
import { Maximize2, Filter, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QueueFilterTab } from "@/entities/review";

export interface ReviewDeckControlsProps {
  activeTab: QueueFilterTab;
  onSelectTab: (tab: QueueFilterTab) => void;
  tabCounts: {
    all: number;
    fastClear: number;
    needsAttention: number;
    contradicted: number;
  };
  onEnterFocusMode: () => void;
  onToggleFilters?: () => void;
  hasActiveFilters?: boolean;
  onToggleShortcuts?: () => void;
  isShortcutsOpen?: boolean;
  rightSlot?: React.ReactNode;
}

export function ReviewDeckControls({
  activeTab,
  onSelectTab,
  tabCounts,
  onEnterFocusMode,
  onToggleFilters,
  hasActiveFilters = false,
  onToggleShortcuts,
  isShortcutsOpen = false,
  rightSlot,
}: ReviewDeckControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-surface-container-low p-2 rounded-2xl border-0 shadow-xs">
      {/* Candidate Queue Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-container rounded-xl border-0">
        <button
          type="button"
          onClick={() => onSelectTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border-0 ${
            activeTab === "all"
              ? "bg-surface text-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          All Candidates ({tabCounts.all})
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("fast_clear")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border-0 ${
            activeTab === "fast_clear"
              ? "bg-surface text-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          All Confirmed ({tabCounts.fastClear})
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("needs_attention")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border-0 ${
            activeTab === "needs_attention"
              ? "bg-surface text-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          Worth a Second Look ({tabCounts.needsAttention})
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("contradicted")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border-0 ${
            activeTab === "contradicted"
              ? "bg-surface text-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          Contradicted ({tabCounts.contradicted})
        </button>
      </div>

      {/* Right Action Controls: Drop Resumes, Filters, Shortcuts, Focus Mode */}
      <div className="flex flex-wrap items-center gap-2">
        {rightSlot}
        {onToggleFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleFilters}
            className={`h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl border-0 cursor-pointer transition-colors ${
              hasActiveFilters
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-bold"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface"
            }`}
            title="Toggle Queue Filters (Experience, Salary, Location)"
          >
            <Filter className="h-3.5 w-3.5 shrink-0" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            )}
          </Button>
        )}
        {onToggleShortcuts && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleShortcuts}
            className={`h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl border-0 cursor-pointer transition-colors ${
              isShortcutsOpen
                ? "bg-primary-container text-on-primary-container font-bold"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface"
            }`}
            title="Toggle Keyboard Shortcuts Dialog (?)"
          >
            <Keyboard className="h-3.5 w-3.5 shrink-0" />
            <span>Shortcuts</span>
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onEnterFocusMode}
          className="h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border-0 cursor-pointer transition-colors"
          title="Enter full screen 3D focus mode"
        >
          <Maximize2 className="h-3.5 w-3.5 shrink-0" />
          <span>Focus Mode</span>
        </Button>
      </div>
    </div>
  );
}
