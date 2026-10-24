"use client";

import React from "react";
import { Maximize2, Filter, Keyboard, ArrowUpDown, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QueueFilterTab } from "@/entities/review";
import type { QueueSortOption } from "@/features/review/core/utils/queueCalculations";
import { ActiveFilterChipBar } from "@/features/review/core/components/feedback/ActiveFilterChipBar";
import type { ActiveReviewChip } from "@/features/review/core/hooks/useActiveReviewChips";

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
  activeFilterCount?: number;
  activeChips?: ActiveReviewChip[];
  onClearAllFilters?: () => void;
  onToggleShortcuts?: () => void;
  isShortcutsOpen?: boolean;
  onToggleTopCandidates?: () => void;
  rightSlot?: React.ReactNode;
  sortBy?: QueueSortOption;
  onSelectSort?: (sort: QueueSortOption) => void;
}

export function ReviewDeckControls({
  activeTab,
  onSelectTab,
  tabCounts,
  onEnterFocusMode,
  onToggleFilters,
  hasActiveFilters = false,
  activeFilterCount = 0,
  activeChips = [],
  onClearAllFilters,
  onToggleShortcuts,
  isShortcutsOpen = false,
  onToggleTopCandidates,
  rightSlot,
  sortBy = "latest",
  onSelectSort,
}: ReviewDeckControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-surface-container-low p-2 rounded-2xl border-0 shadow-xs">
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

      <div className="flex flex-wrap items-center gap-2">
        {rightSlot}
        {onSelectSort && (
          <div
            className="flex items-center gap-1.5 px-2.5 h-8 rounded-xl transition-colors text-xs font-semibold shrink-0 bg-surface-container hover:bg-surface-container-high text-on-surface"
            title="Sort candidate review queue cards by latest or oldest application"
          >
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" />
            <span className="text-[11px] text-on-surface-variant font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value as QueueSortOption)}
              className="bg-transparent text-on-surface font-bold text-xs cursor-pointer focus:outline-hidden border-0 pr-1 py-0.5"
              aria-label="Sort queue candidates"
            >
              <option value="latest" className="bg-surface-container text-on-surface">
                Latest
              </option>
              <option value="oldest" className="bg-surface-container text-on-surface">
                Oldest
              </option>
            </select>
          </div>
        )}
        {onToggleFilters && (
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleFilters}
              className={`h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl border-0 cursor-pointer transition-colors shrink-0 ${
                hasActiveFilters
                  ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-bold"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
              title="Toggle Queue Filters (Experience, Salary, Location, University)"
            >
              <Filter className="h-3.5 w-3.5 shrink-0" />
              <span>
                {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : "Filters"}
              </span>
            </Button>

            {activeChips && activeChips.length > 0 && onClearAllFilters && (
              <ActiveFilterChipBar
                chips={activeChips}
                onClearAll={onClearAllFilters}
              />
            )}
          </div>
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
        {onToggleTopCandidates && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleTopCandidates}
            className="h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 cursor-pointer transition-colors"
            title="Open Mechanism E Top 3 Candidates Tournament (T)"
          >
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span>Top 3</span>
            <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-surface/60 text-on-surface-variant font-mono text-[10px]">
              T
            </kbd>
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
