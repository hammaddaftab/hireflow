"use client";

import React from "react";
import { Maximize2 } from "lucide-react";
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
}

export function ReviewDeckControls({
  activeTab,
  onSelectTab,
  tabCounts,
  onEnterFocusMode,
}: ReviewDeckControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-2 rounded-2xl border-0 shadow-xs">
      {/* Libadwaita Linked Pill Switcher */}
      <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl border-0">
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

      {/* Focus Mode Trigger */}
      <div className="flex items-center gap-2 self-end sm:self-center">
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
