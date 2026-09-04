"use client";

import React, { useState } from "react";
import { Filter, X, Users, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { QueryGroup, QueueFilterTab } from "../types";

export interface ReviewFilterPaneProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  isGroupsOpen?: boolean;
  onToggleGroups?: () => void;
  isLocationOpen?: boolean;
  onToggleLocation?: () => void;
  isStatusOpen?: boolean;
  onToggleStatus?: () => void;
  queryGroups: QueryGroup[];
  cityDistribution: Array<{ city: string; count: number }>;
  totalCandidates: number;
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
}

export function ReviewFilterPane({
  isOpen,
  onClose,
  selectedGroupId,
  onSelectGroup,
  selectedCity,
  onSelectCity,
  isGroupsOpen = true,
  onToggleGroups,
  isLocationOpen = true,
  onToggleLocation,
  isStatusOpen = true,
  onToggleStatus,
  queryGroups,
  cityDistribution,
  totalCandidates,
  onResetFilters,
  variant = "sidebar",
  activeTab = "all",
  onSelectTab,
  tabCounts,
}: ReviewFilterPaneProps) {
  const [internalGroupsOpen, setInternalGroupsOpen] = useState(true);
  const [internalLocationOpen, setInternalLocationOpen] = useState(true);
  const [internalStatusOpen, setInternalStatusOpen] = useState(true);

  if (!isOpen) return null;

  const groupsOpen = onToggleGroups ? isGroupsOpen : internalGroupsOpen;
  const toggleGroups = onToggleGroups || (() => setInternalGroupsOpen((prev: boolean) => !prev));

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

  if (selectedGroupId && selectedGroupId !== "grp_all") {
    const group = queryGroups.find((g) => g.id === selectedGroupId);
    if (group) {
      activeChips.push({
        id: `group-${group.id}`,
        label: group.name,
        onRemove: () => onSelectGroup(null),
      });
    }
  }

  if (selectedCity !== null) {
    activeChips.push({
      id: `city-${selectedCity}`,
      label: selectedCity,
      onRemove: () => onSelectCity(null),
    });
  }

  // Filter out "grp_all" so category picker has pure condition lists
  const realGroups = queryGroups.filter((g) => g.id !== "grp_all");

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
          ? "fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-92 flex flex-col bg-surface-container-low/98 dark:bg-[#0c121e]/98 backdrop-blur-xl border-r border-outline-variant/40 shadow-2xl p-5 overflow-y-auto custom-scrollbar animate-in slide-in-from-left-4 duration-200 space-y-4"
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
      <div className="bg-surface-container/50 dark:bg-surface-container/30 rounded-xl p-3 space-y-2 border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Active Filters
          </span>
          {activeChips.length >= 2 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0"
            >
              Clear all
            </button>
          )}
        </div>

        {activeChips.length === 0 ? (
          <p className="text-xs text-on-surface-variant/70 italic py-0.5">
            No filters applied.
          </p>
        ) : (
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

        {/* Category 2: Groups */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={toggleGroups}
            className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
          >
            <span className="truncate">
              Groups · {realGroups.length}
            </span>
            {groupsOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
          </button>

          {groupsOpen && (
            <div className="space-y-1 pl-0.5">
              {realGroups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSelectGroup(null);
                      } else {
                        onSelectGroup(group.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                      isSelected
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium"
                    }`}
                  >
                    <span className="truncate pr-2">{group.name}</span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${
                        isSelected
                          ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {group.candidateIds.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-px bg-outline-variant/30" />

        {/* Category 3: Location */}
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
