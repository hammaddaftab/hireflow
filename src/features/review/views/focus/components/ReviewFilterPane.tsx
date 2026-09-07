"use client";

import React, { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import type { QueueFilterTab } from "@/entities/review";
import { DualRangeSlider } from "@/components/ui/DualRangeSlider";
import { formatSalaryNumber } from "@/features/review/core/utils/queueCalculations";

export interface ReviewFilterPaneProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  isLocationOpen?: boolean;
  onToggleLocation?: () => void;
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
  const [internalStatusOpen, setInternalStatusOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [salaryOpen, setSalaryOpen] = useState(true);

  if (!isOpen) return null;

  const locationOpen = onToggleLocation ? isLocationOpen : internalLocationOpen;
  const toggleLocation = onToggleLocation || (() => setInternalLocationOpen((prev: boolean) => !prev));

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
  const statusOptions: Array<{ id: QueueFilterTab; label: string; count: number }> = [
    { id: "fast_clear", label: "Confirmed", count: tabCounts?.fastClear ?? 0 },
    { id: "needs_attention", label: "2nd Look", count: tabCounts?.needsAttention ?? 0 },
    { id: "contradicted", label: "Contradicted", count: tabCounts?.contradicted ?? 0 },
  ];

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

      {/* Zone 2: Category Pickers (Pure condition lists, no 'All' rows) */}
      <div className="space-y-4">
        {/* Category 1: Queue Status */}
        {onSelectTab && tabCounts && (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={toggleStatus}
              className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
            >
              <span className="truncate">
                Queue Status · {tabCounts.all}
              </span>
              {statusOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
            </button>

            {statusOpen && (
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
            )}
          </div>
        )}

        <div className="h-px bg-outline-variant/30" />

        {/* Category 2: Location */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={toggleLocation}
            className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
          >
            <span className="truncate">
              Location · {cityDistribution.length}
            </span>
            {locationOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
          </button>

          {locationOpen && (
            <div className="space-y-1 pl-0.5">
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
          )}
        </div>

        {/* Category 3: Experience */}
        {experienceRange && onExperienceChange && (
          <>
            <div className="h-px bg-outline-variant/30" />
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setExperienceOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
              >
                <span className="truncate">
                  Experience · {experienceRange[0]}–{experienceRange[1] >= experienceBounds.max ? `${experienceRange[1]}+` : experienceRange[1]} yrs
                </span>
                {experienceOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
              </button>

              {experienceOpen && (
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
              )}
            </div>
          </>
        )}

        {/* Category 4: Salary Expectation */}
        {salaryRange && onSalaryChange && (
          <>
            <div className="h-px bg-outline-variant/30" />
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setSalaryOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
              >
                <span className="truncate">
                  Salary · {formatSalaryNumber(salaryRange[0])}–{formatSalaryNumber(salaryRange[1])} {salaryBounds.currency}
                </span>
                {salaryOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
              </button>

              {salaryOpen && (
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
              )}
            </div>
          </>
        )}
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
      </>
    );
  }

  return asideContent;
}
