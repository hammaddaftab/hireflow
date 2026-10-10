"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronUp, ChevronDown, GripVertical, ArrowLeftRight } from "lucide-react";
import type { QueueFilterTab } from "@/entities/review";
import { DualRangeSlider } from "@/components/ui/DualRangeSlider";
import { formatSalaryNumber } from "@/features/review/core/utils/queueCalculations";

export type FilterGroupId = "status" | "location" | "university" | "experience" | "salary";

interface FilterGroupDef {
  id: FilterGroupId;
  title: string;
  countLabel: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  renderContent: () => React.ReactNode;
}

interface FloatingCardState {
  groupId: FilterGroupId;
  x: number;
  y: number;
}

// Clamps floating card coordinates safely within the visible browser viewport
function clampPosition(x: number, y: number, cardWidth = 300, cardHeight = 220) {
  if (typeof window === "undefined") return { x, y };
  return {
    x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - cardWidth - 8)),
    y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - cardHeight - 8)),
  };
}

// Tear-off floating filter card rendered via React portal directly into document.body
function FloatingFilterCard({
  group,
  pos,
  isDragging,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onSwitchNext,
  onClose,
}: {
  group: FilterGroupDef;
  pos: { x: number; y: number };
  isDragging: boolean;
  onHandlePointerDown: (e: React.PointerEvent) => void;
  onHandlePointerMove: (e: React.PointerEvent) => void;
  onHandlePointerUp: (e: React.PointerEvent) => void;
  onSwitchNext: () => void;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-floating-filter-card="true"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`fixed top-0 left-0 z-[1000] w-72 sm:w-80 bg-surface-container-low border border-outline-variant/50 rounded-2xl overflow-hidden backdrop-blur-md select-none transition-shadow ${
        isDragging ? "shadow-2xl ring-2 ring-primary/40 scale-[1.03]" : "shadow-xl"
      }`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: isDragging ? "none" : "box-shadow 0.15s ease, transform 0.15s ease",
      }}
    >
      {/* Draggable header handle */}
      <div
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        className="flex items-center justify-between gap-2 px-3 py-2.5 bg-surface-container border-b border-outline-variant/30 cursor-grab active:cursor-grabbing select-none"
        title="Drag to reposition floating filter card"
        style={{ touchAction: "none" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="h-4 w-4 text-on-surface-variant shrink-0" />
          <span className="text-xs font-bold text-on-surface truncate">
            {group.title}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface-container-high font-bold text-on-surface-variant shrink-0">
            {group.countLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Switch button cycling through groups in menu order */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSwitchNext();
            }}
            className="h-6 w-6 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer border-0 p-0"
            title="Cycle to next filter group"
            aria-label="Cycle to next filter group"
          >
            <ArrowLeftRight className="h-3 w-3" />
          </button>

          {/* Close button to dock group back into menu */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-6 w-6 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer border-0 p-0"
            title="Dock back into filters menu"
            aria-label="Dock back into filters menu"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Floating group interactive body content */}
      <div className="p-3 max-h-72 overflow-y-auto custom-scrollbar">
        {group.renderContent()}
      </div>
    </div>,
    document.body
  );
}

export interface ReviewFilterPaneProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  isLocationOpen?: boolean;
  onToggleLocation?: () => void;
  selectedUniversity?: string | null;
  onSelectUniversity?: (university: string | null) => void;
  isUniversityOpen?: boolean;
  onToggleUniversity?: () => void;
  universityDistribution?: Array<{ university: string; count: number }>;
  isStatusOpen?: boolean;
  onToggleStatus?: () => void;
  cityDistribution: Array<{ city: string; count: number }>;
  totalCandidates?: number;
  onResetFilters: () => void;
  variant?: "sidebar" | "overlay";
  activeTab?: QueueFilterTab;
  onSelectTab?: (tab: QueueFilterTab) => void;
  tabCounts?: {
    all: number;
    fastClear: number;
    needsAttention: number;
    contradicted: number;
  };
  experienceRange?: [number, number];
  onExperienceChange?: (range: [number, number]) => void;
  experienceBounds?: { min: number; max: number; step: number };
  salaryRange?: [number, number];
  onSalaryChange?: (range: [number, number]) => void;
  salaryBounds?: { min: number; max: number; step: number; currency: string };
  includeUnstatedSalary?: boolean;
  onToggleIncludeUnstatedSalary?: () => void;
}

export function ReviewFilterPane({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  isLocationOpen = true,
  onToggleLocation,
  selectedUniversity,
  onSelectUniversity,
  isUniversityOpen = true,
  onToggleUniversity,
  universityDistribution = [],
  isStatusOpen = true,
  onToggleStatus,
  cityDistribution,
  onResetFilters,
  variant = "sidebar",
  activeTab = "all",
  onSelectTab,
  tabCounts,
  experienceRange,
  onExperienceChange,
  experienceBounds = { min: 0, max: 15, step: 1 },
  salaryRange,
  onSalaryChange,
  salaryBounds = { min: 0, max: 1000000, step: 25000, currency: "PKR" },
  includeUnstatedSalary = true,
  onToggleIncludeUnstatedSalary,
}: ReviewFilterPaneProps) {
  const [internalLocationOpen, setInternalLocationOpen] = useState(true);
  const [internalUniversityOpen, setInternalUniversityOpen] = useState(true);
  const [internalStatusOpen, setInternalStatusOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [salaryOpen, setSalaryOpen] = useState(true);

  // Tear-off floating card and drag coordination state
  const [floating, setFloating] = useState<FloatingCardState | null>(null);
  const [isInitialDragging, setIsInitialDragging] = useState(false);
  const [isCardDragging, setIsCardDragging] = useState(false);
  const cardDragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const locationOpen = onToggleLocation ? isLocationOpen : internalLocationOpen;
  const toggleLocation = onToggleLocation || (() => setInternalLocationOpen((prev: boolean) => !prev));

  const universityOpen = onToggleUniversity ? isUniversityOpen : internalUniversityOpen;
  const toggleUniversity = onToggleUniversity || (() => setInternalUniversityOpen((prev: boolean) => !prev));

  const statusOpen = onToggleStatus ? isStatusOpen : internalStatusOpen;
  const toggleStatus = onToggleStatus || (() => setInternalStatusOpen((prev: boolean) => !prev));

  // Build active filter chips for Zone 1
  interface ActiveChip {
    id: string;
    label: string;
    onRemove: () => void;
  }

  const activeChips: ActiveChip[] = [];

  if (activeTab && activeTab !== "all") {
    const tabLabels: Record<string, string> = {
      fast_clear: "Confirmed",
      needs_attention: "2nd Look",
      contradicted: "Contradicted",
    };
    activeChips.push({
      id: `tab-${activeTab}`,
      label: tabLabels[activeTab] || activeTab,
      onRemove: () => onSelectTab?.("all"),
    });
  }

  if (selectedCity !== null) {
    activeChips.push({
      id: `city-${selectedCity}`,
      label: selectedCity,
      onRemove: () => onSelectCity(null),
    });
  }

  if (selectedUniversity !== null && selectedUniversity !== undefined) {
    activeChips.push({
      id: `university-${selectedUniversity}`,
      label: selectedUniversity,
      onRemove: () => onSelectUniversity?.(null),
    });
  }

  // Active chip for experience filter
  if (
    experienceRange &&
    (experienceRange[0] > experienceBounds.min || experienceRange[1] < experienceBounds.max)
  ) {
    const maxExpLabel =
      experienceRange[1] >= experienceBounds.max
        ? `${experienceRange[1]}+`
        : `${experienceRange[1]}`;
    activeChips.push({
      id: "filter-exp",
      label: `Exp: ${experienceRange[0]}–${maxExpLabel} yrs`,
      onRemove: () => onExperienceChange?.([experienceBounds.min, experienceBounds.max]),
    });
  }

  // Active chip for salary filter
  if (
    salaryRange &&
    (salaryRange[0] > salaryBounds.min ||
      salaryRange[1] < salaryBounds.max ||
      includeUnstatedSalary === false)
  ) {
    const minSalLabel = formatSalaryNumber(salaryRange[0]);
    const maxSalLabel = formatSalaryNumber(salaryRange[1]);
    const unstatedSuffix = includeUnstatedSalary === false ? " (stated only)" : "";
    activeChips.push({
      id: "filter-salary",
      label: `Salary: ${minSalLabel}–${maxSalLabel} ${salaryBounds.currency}${unstatedSuffix}`,
      onRemove: () => {
        onSalaryChange?.([salaryBounds.min, salaryBounds.max]);
        if (includeUnstatedSalary === false) {
          onToggleIncludeUnstatedSalary?.();
        }
      },
    });
  }

  // Status options for category picker
  const statusOptions: Array<{ id: QueueFilterTab; label: string; count: number }> = useMemo(
    () => [
      { id: "fast_clear", label: "Confirmed", count: tabCounts?.fastClear ?? 0 },
      { id: "needs_attention", label: "2nd Look", count: tabCounts?.needsAttention ?? 0 },
      { id: "contradicted", label: "Contradicted", count: tabCounts?.contradicted ?? 0 },
    ],
    [tabCounts]
  );

  // Structured definitions for all available filter categories in menu sequence
  const groups: FilterGroupDef[] = useMemo(() => {
    const list: FilterGroupDef[] = [];

    // Category 1: Queue Status
    if (onSelectTab && tabCounts) {
      list.push({
        id: "status",
        title: "Queue Status",
        countLabel: String(tabCounts.all),
        isOpen: statusOpen,
        onToggleOpen: toggleStatus,
        renderContent: () => (
          <div className="space-y-1 pl-0.5">
            {statusOptions.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onSelectTab("all");
                    } else {
                      onSelectTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                    isSelected
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        ),
      });
    }

    // Category 2: Location
    list.push({
      id: "location",
      title: "Location",
      countLabel: String(cityDistribution.length),
      isOpen: locationOpen,
      onToggleOpen: toggleLocation,
      renderContent: () => (
        <div className="space-y-1 pl-0.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
          {cityDistribution.map(({ city, count }) => {
            const isSelected = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectCity(null);
                  } else {
                    onSelectCity(city);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                  isSelected
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium"
                }`}
              >
                <span>{city}</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      ),
    });

    // Category 3: University
    if (universityDistribution.length > 0 && onSelectUniversity) {
      list.push({
        id: "university",
        title: "University",
        countLabel: String(universityDistribution.length),
        isOpen: universityOpen,
        onToggleOpen: toggleUniversity,
        renderContent: () => (
          <div className="space-y-1 pl-0.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
            {universityDistribution.map(({ university, count }) => {
              const isSelected = selectedUniversity === university;
              return (
                <button
                  key={university}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onSelectUniversity(null);
                    } else {
                      onSelectUniversity(university);
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                    isSelected
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium"
                  }`}
                >
                  <span className="truncate" title={university}>{university}</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isSelected
                        ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ),
      });
    }

    // Category 4: Experience
    if (experienceRange && onExperienceChange) {
      list.push({
        id: "experience",
        title: "Experience",
        countLabel: `${experienceRange[0]}–${experienceRange[1] >= experienceBounds.max ? `${experienceRange[1]}+` : experienceRange[1]} yrs`,
        isOpen: experienceOpen,
        onToggleOpen: () => setExperienceOpen((prev) => !prev),
        renderContent: () => (
          <div className="px-1 pt-1 pb-2">
            <DualRangeSlider
              min={experienceBounds.min}
              max={experienceBounds.max}
              step={experienceBounds.step}
              value={experienceRange}
              onChange={onExperienceChange}
              formatValue={(val) => (val >= experienceBounds.max ? `${val}+ yrs` : `${val} yr${val === 1 ? "" : "s"}`)}
              formatBound={(val) => (val >= experienceBounds.max ? `${val}+` : String(val))}
            />
          </div>
        ),
      });
    }

    // Category 5: Salary Expectation
    if (salaryRange && onSalaryChange) {
      list.push({
        id: "salary",
        title: "Salary Expectation",
        countLabel: `${formatSalaryNumber(salaryRange[0])}–${formatSalaryNumber(salaryRange[1])} ${salaryBounds.currency}`,
        isOpen: salaryOpen,
        onToggleOpen: () => setSalaryOpen((prev) => !prev),
        renderContent: () => (
          <div className="px-1 pt-1 pb-2 space-y-3">
            <DualRangeSlider
              min={salaryBounds.min}
              max={salaryBounds.max}
              step={salaryBounds.step}
              value={salaryRange}
              onChange={onSalaryChange}
              formatValue={(val) => `${formatSalaryNumber(val)} ${salaryBounds.currency}`}
              formatBound={(val) => formatSalaryNumber(val)}
            />

            {onToggleIncludeUnstatedSalary && (
              <label className="flex items-center gap-2 pt-1 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeUnstatedSalary}
                  onChange={onToggleIncludeUnstatedSalary}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
                <span>Include unstated salary</span>
              </label>
            )}
          </div>
        ),
      });
    }

    return list;
  }, [
    onSelectTab,
    tabCounts,
    statusOpen,
    toggleStatus,
    activeTab,
    statusOptions,
    cityDistribution,
    locationOpen,
    toggleLocation,
    selectedCity,
    onSelectCity,
    universityDistribution,
    onSelectUniversity,
    universityOpen,
    toggleUniversity,
    selectedUniversity,
    experienceRange,
    onExperienceChange,
    experienceBounds,
    experienceOpen,
    salaryRange,
    onSalaryChange,
    salaryBounds,
    salaryOpen,
    includeUnstatedSalary,
    onToggleIncludeUnstatedSalary,
  ]);

  // Heading pointer-down tear-off trigger: movement past 6px detaches group into floating portal card
  const onHeadingPointerDown = useCallback(
    (e: React.PointerEvent, groupId: FilterGroupId) => {
      if (e.button !== 0) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const rect = e.currentTarget.getBoundingClientRect();
      const dx = startX - rect.left;
      const dy = startY - rect.top;

      let detached = false;

      const onWindowPointerMove = (ev: PointerEvent) => {
        if (!detached) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
            detached = true;
            setIsInitialDragging(true);
            const initialPos = clampPosition(ev.clientX - dx, ev.clientY - dy);
            setFloating({
              groupId,
              x: initialPos.x,
              y: initialPos.y,
            });
          }
        } else {
          const currentPos = clampPosition(ev.clientX - dx, ev.clientY - dy);
          setFloating((prev) => (prev ? { ...prev, x: currentPos.x, y: currentPos.y } : null));
        }
      };

      const onWindowPointerUp = () => {
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);

        if (!detached) {
          const targetGroup = groups.find((g) => g.id === groupId);
          targetGroup?.onToggleOpen();
        } else {
          setIsInitialDragging(false);
        }
      };

      window.addEventListener("pointermove", onWindowPointerMove);
      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerUp);
    },
    [groups]
  );

  // Subsequent drags handled on the floating card header using pointer capture
  const onCardHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 || !floating) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsCardDragging(true);
      cardDragOffset.current = {
        dx: e.clientX - floating.x,
        dy: e.clientY - floating.y,
      };
    },
    [floating]
  );

  const onCardHandlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isCardDragging || !floating) return;
      const newPos = clampPosition(
        e.clientX - cardDragOffset.current.dx,
        e.clientY - cardDragOffset.current.dy
      );
      setFloating((prev) => (prev ? { ...prev, x: newPos.x, y: newPos.y } : null));
    },
    [isCardDragging, floating]
  );

  const onCardHandlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isCardDragging) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if pointer capture already lost
        }
        setIsCardDragging(false);
      }
    },
    [isCardDragging]
  );

  // Switch button handler cycling groups in menu order
  const onSwitchNext = useCallback(() => {
    if (!floating) return;
    const currentIdx = groups.findIndex((g) => g.id === floating.groupId);
    if (currentIdx === -1) return;
    const nextIdx = (currentIdx + 1) % groups.length;
    setFloating((prev) => (prev ? { ...prev, groupId: groups[nextIdx].id } : null));
  }, [floating, groups]);

  // Active floating group definition for portal rendering
  const activeFloatingGroup = floating
    ? groups.find((g) => g.id === floating.groupId) || groups[0]
    : null;

  const floatingCardPortal =
    activeFloatingGroup && floating ? (
      <FloatingFilterCard
        group={activeFloatingGroup}
        pos={{ x: floating.x, y: floating.y }}
        isDragging={isInitialDragging || isCardDragging}
        onHandlePointerDown={onCardHandlePointerDown}
        onHandlePointerMove={onCardHandlePointerMove}
        onHandlePointerUp={onCardHandlePointerUp}
        onSwitchNext={onSwitchNext}
        onClose={() => setFloating(null)}
      />
    ) : null;

  // When drawer is closed, keep floating card portal alive if detached
  if (!isOpen) {
    return floatingCardPortal;
  }

  const asideContent = (
    <aside
      className={
        variant === "overlay"
          ? "fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-92 flex flex-col bg-surface-container-low border-r border-outline-variant/40 shadow-2xl p-5 overflow-y-auto custom-scrollbar animate-in slide-in-from-left-4 duration-200 space-y-4"
          : "w-full lg:w-72 xl:w-80 shrink-0 bg-surface-container-low rounded-2xl p-4 space-y-4 border-0 shadow-xs"
      }
    >
      {/* Pane Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
          Queue Filters
        </span>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer border-0"
          aria-label="Close filters"
          title="Close filters"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Zone 1: Active Filter Chip Bar (Fixed at top, single source of truth) */}
      <div className="bg-surface-container rounded-xl p-3 space-y-2 border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Active Filters
          </span>
          {activeChips.length >= 1 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0"
            >
              Reset filters
            </button>
          )}
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300/50 dark:border-amber-800/50 shadow-2xs"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="h-4 w-4 rounded-full flex items-center justify-center text-amber-900/70 dark:text-amber-300/70 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition-colors cursor-pointer border-0 p-0 ml-0.5"
                  aria-label={`Remove ${chip.label} filter`}
                  title={`Remove ${chip.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-outline-variant/30" />

      {/* Zone 2: Category Pickers with tear-off draggable group headings */}
      <div className="space-y-4">
        {groups.map((group, index) => {
          const isFloating = floating?.groupId === group.id;

          return (
            <React.Fragment key={group.id}>
              {index > 0 && <div className="h-px bg-outline-variant/30" />}

              {isFloating ? (
                // Dashed placeholder remaining in menu when group is detached into floating card
                <div className="border border-dashed border-primary/50 bg-primary/5 rounded-xl p-3 flex items-center justify-between gap-2 select-none animate-in fade-in-50 duration-150">
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-primary truncate">
                      {group.title} (Detached)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFloating(null)}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer border-0 bg-transparent shrink-0 p-0"
                    title={`Dock ${group.title} back to menu`}
                  >
                    Dock back
                  </button>
                </div>
              ) : (
                // Docked group with tear-off draggable heading
                <div className="space-y-1.5">
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => onHeadingPointerDown(e, group.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        group.onToggleOpen();
                      }
                    }}
                    className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-grab active:cursor-grabbing select-none py-1 group focus:outline-hidden"
                    title="Drag to detach floating card, click to toggle"
                    style={{ touchAction: "none" }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GripVertical className="h-3.5 w-3.5 text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0" />
                      <span className="truncate">
                        {group.title} · {group.countLabel}
                      </span>
                    </div>
                    {group.isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 shrink-0 text-on-surface-variant group-hover:text-primary transition-colors" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-on-surface-variant group-hover:text-primary transition-colors" />
                    )}
                  </div>

                  {group.isOpen && group.renderContent()}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );

  if (variant === "overlay") {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
        {asideContent}
        {floatingCardPortal}
      </>
    );
  }

  return (
    <>
      {asideContent}
      {floatingCardPortal}
    </>
  );
}
