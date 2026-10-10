"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import type { ActiveReviewChip } from "@/features/review/core/hooks/useActiveReviewChips";

export interface ActiveFilterChipBarProps {
  chips: ActiveReviewChip[];
  onClearAll: () => void;
  className?: string;
}

// Three-tier width-responsive active filter chip bar with dynamic overflow handling
export function ActiveFilterChipBar({
  chips,
  onClearAll,
  className = "",
}: ActiveFilterChipBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const overflowTriggerRef = useRef<HTMLButtonElement>(null);
  const summaryTriggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Initialize containerWidth with sensible default so wide chips render immediately on first mount
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.max(320, window.innerWidth - 650);
    }
    return 500;
  });

  const [chipWidths, setChipWidths] = useState<number[]>([]);
  const [clearAllWidth, setClearAllWidth] = useState<number>(60);
  const [overflowChipWidth, setOverflowChipWidth] = useState<number>(45);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<"overflow" | "summary">("overflow");
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  // Immediate layout measure of container to avoid any initial 0px flash
  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerWidth(Math.floor(rect.width));
      }
    }
  }, []);

  // 1. Observe container width changes using ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Measure chip widths once when chips list changes
  useIsomorphicLayoutEffect(() => {
    if (!measureContainerRef.current) return;

    const chipEls = measureContainerRef.current.querySelectorAll<HTMLElement>("[data-measure-chip]");
    const measured: number[] = [];
    chipEls.forEach((el) => {
      measured.push(Math.ceil(el.getBoundingClientRect().width));
    });
    setChipWidths(measured);

    const clearEl = measureContainerRef.current.querySelector<HTMLElement>("[data-measure-clear]");
    if (clearEl) {
      setClearAllWidth(Math.ceil(clearEl.getBoundingClientRect().width));
    }

    const overflowEl = measureContainerRef.current.querySelector<HTMLElement>("[data-measure-overflow]");
    if (overflowEl) {
      setOverflowChipWidth(Math.ceil(overflowEl.getBoundingClientRect().width));
    }
  }, [chips]);

  const GAP = 6; // gap-1.5 is 6px

  // Helper to obtain measured width or accurate text length fallback
  const getChipWidth = useCallback(
    (index: number) => {
      if (chipWidths[index] && chipWidths[index] > 0) {
        return chipWidths[index];
      }
      const labelLen = chips[index]?.label?.length || 8;
      return Math.min(180, Math.max(55, Math.ceil(labelLen * 7.5 + 40)));
    },
    [chipWidths, chips]
  );

  // 3. Three-tier collapse calculation based on available width without arbitrary caps
  const { tier, visibleCount } = useMemo(() => {
    if (chips.length === 0) {
      return { tier: "narrow" as const, visibleCount: 0 };
    }

    const effectiveClearAllWidth = clearAllWidth || 55;
    const effectiveOverflowWidth = overflowChipWidth || 42;
    const usableWidth = containerWidth - effectiveClearAllWidth - GAP;

    // Check if ALL chips fit inline
    let totalAllWidth = 0;
    for (let i = 0; i < chips.length; i++) {
      totalAllWidth += getChipWidth(i) + (i > 0 ? GAP : 0);
    }

    if (totalAllWidth <= usableWidth && usableWidth > 60) {
      return { tier: "wide" as const, visibleCount: chips.length };
    }

    // Check how many chips fit alongside +N overflow chip and Clear all link
    const availableForChips = usableWidth - effectiveOverflowWidth - GAP;
    let accumulated = 0;
    let count = 0;

    for (let i = 0; i < chips.length; i++) {
      const w = getChipWidth(i);
      const nextTotal = accumulated + (count > 0 ? GAP : 0) + w;
      if (nextTotal <= availableForChips) {
        accumulated = nextTotal;
        count++;
      } else {
        break;
      }
    }

    // Wide tier: at least 1 chip fits alongside +N and Clear all
    if (count >= 1) {
      return { tier: "wide" as const, visibleCount: count };
    }

    // Medium tier: container has space for the single summary chip (>= 110px)
    if (containerWidth >= 110) {
      return { tier: "medium" as const, visibleCount: 0 };
    }

    // Narrow tier: container is too constrained even for the summary chip (< 110px)
    return { tier: "narrow" as const, visibleCount: 0 };
  }, [chips, containerWidth, clearAllWidth, overflowChipWidth, getChipWidth]);

  // Construct summary chip label for Medium tier (e.g. Punjab · Karachi · +2)
  const summaryLabel = useMemo(() => {
    if (chips.length === 0) return "";
    if (chips.length === 1) return chips[0].label;
    if (chips.length === 2) return `${chips[0].label} · ${chips[1].label}`;

    // Join first 2 chips if relatively short, otherwise join first 1
    const firstTwo = `${chips[0].label} · ${chips[1].label}`;
    if (firstTwo.length <= 26) {
      return `${firstTwo} · +${chips.length - 2}`;
    }
    return `${chips[0].label} · +${chips.length - 1}`;
  }, [chips]);

  // Position popover relative to the clicked trigger element
  const openPopover = useCallback(
    (anchor: "overflow" | "summary") => {
      const triggerEl =
        anchor === "overflow" ? overflowTriggerRef.current : summaryTriggerRef.current;
      if (!triggerEl) return;

      const rect = triggerEl.getBoundingClientRect();
      const popoverWidth = 280;
      const clampedLeft =
        typeof window !== "undefined"
          ? Math.max(8, Math.min(rect.left, window.innerWidth - popoverWidth - 12))
          : rect.left;

      setPopoverPos({
        top: rect.bottom + 6,
        left: clampedLeft,
      });
      setPopoverAnchor(anchor);
      setIsPopoverOpen(true);
    },
    []
  );

  // Close popover on outside click or Escape key
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPopoverOpen(false);
      }
    };

    const handleResize = () => {
      setIsPopoverOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isPopoverOpen]);

  // Automatically close popover if all chips are removed
  useEffect(() => {
    if (chips.length === 0 && isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  }, [chips.length, isPopoverOpen]);

  if (chips.length === 0) {
    return null;
  }

  const visibleChips = tier === "wide" ? chips.slice(0, visibleCount) : [];
  const overflowChips = tier === "wide" ? chips.slice(visibleCount) : [];
  const popoverChips = popoverAnchor === "summary" ? chips : overflowChips;

  return (
    <div
      ref={containerRef}
      className={`flex-1 min-w-0 overflow-hidden flex items-center gap-1.5 select-none ${className}`}
    >
      {/* Hidden off-screen measurement layer */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -100,
          display: "flex",
          gap: GAP,
          whiteSpace: "nowrap",
        }}
      >
        {chips.map((chip) => (
          <span
            key={chip.id}
            data-measure-chip="true"
            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium border"
          >
            <span>{chip.label}</span>
            <span className="h-3.5 w-3.5 ml-0.5" />
          </span>
        ))}
        <button
          data-measure-clear="true"
          type="button"
          className="text-xs font-semibold px-1 py-0.5"
        >
          Clear all
        </button>
        <button
          data-measure-overflow="true"
          type="button"
          className="px-2 py-0.5 rounded-full text-xs font-bold border"
        >
          +{chips.length}
        </button>
      </div>

      {/* Tier 1: Wide Mode - Inline chips up to available width + overflow chip + Clear all */}
      {tier === "wide" && (
        <>
          {visibleChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300/50 dark:border-amber-800/50 shadow-2xs shrink-0"
            >
              <span className="truncate max-w-[150px]">{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-amber-900/70 dark:text-amber-300/70 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition-colors cursor-pointer border-0 p-0 ml-0.5"
                aria-label={`Remove ${chip.label} filter`}
                title={`Remove ${chip.label} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          {/* +N Overflow chip button */}
          {overflowChips.length > 0 && (
            <button
              ref={overflowTriggerRef}
              type="button"
              onClick={() => openPopover("overflow")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 shadow-2xs transition-colors cursor-pointer shrink-0"
              title={`View ${overflowChips.length} more active filters`}
              aria-label={`View ${overflowChips.length} more active filters`}
            >
              <span>+{overflowChips.length}</span>
            </button>
          )}

          {/* Clear all inline link */}
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer border-0 bg-transparent px-1 py-0.5 shrink-0"
            title="Clear all active filters"
          >
            Clear all
          </button>
        </>
      )}

      {/* Tier 2: Medium Mode - Summary chip (e.g. Punjab · Karachi · +2) expanding on click */}
      {tier === "medium" && (
        <button
          ref={summaryTriggerRef}
          type="button"
          onClick={() => openPopover("summary")}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300/50 dark:border-amber-800/50 hover:bg-amber-200/80 dark:hover:bg-amber-900/80 transition-colors cursor-pointer shadow-2xs shrink-0 max-w-full"
          title="Click to view and manage active filters"
        >
          <span className="truncate">{summaryLabel}</span>
          <ChevronDown className="h-3 w-3 text-amber-900/70 dark:text-amber-300/70 shrink-0" />
        </button>
      )}

      {/* Tier 3: Narrow Mode - Chips hidden; Filters button badge represents active count */}

      {/* Overflow & Summary Filter Popover rendered via React portal into document.body */}
      {isPopoverOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            data-active-filter-popover="true"
            role="dialog"
            aria-label="Active filters detail"
            className="fixed z-[1050] w-72 max-w-[calc(100vw-24px)] bg-surface-container-low border border-outline-variant/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md select-none animate-in fade-in-50 zoom-in-95 duration-150"
            style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface">
                {popoverAnchor === "summary" ? "Active Filters" : "More Filters"} ({popoverChips.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setIsPopoverOpen(false);
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setIsPopoverOpen(false)}
                  className="h-5 w-5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center cursor-pointer border-0 p-0"
                  aria-label="Close popover"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
              {popoverChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300/50 dark:border-amber-800/50 shadow-2xs"
                >
                  <span className="truncate max-w-[180px]">{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      chip.onRemove();
                      if (popoverChips.length <= 1) {
                        setIsPopoverOpen(false);
                      }
                    }}
                    className="h-4 w-4 rounded-full flex items-center justify-center text-amber-900/70 dark:text-amber-300/70 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition-colors cursor-pointer border-0 p-0 ml-0.5"
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
