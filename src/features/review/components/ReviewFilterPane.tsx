"use client";

import React from "react";
import { Filter, PanelLeftClose, Users, ChevronUp, ChevronDown, MapPin, Layers } from "lucide-react";
import { FocusDimension, QueryGroup } from "../types";

export interface ReviewFilterPaneProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  activeDimension: FocusDimension;
  onSelectDimension: (dim: FocusDimension) => void;
  isGroupsOpen: boolean;
  onToggleGroups: () => void;
  isLocationOpen: boolean;
  onToggleLocation: () => void;
  isDimensionsOpen: boolean;
  onToggleDimensions: () => void;
  queryGroups: QueryGroup[];
  cityDistribution: Array<{ city: string; count: number }>;
  totalCandidates: number;
  onResetFilters: () => void;
}

export function ReviewFilterPane({
  isOpen,
  onClose,
  selectedGroupId,
  onSelectGroup,
  selectedCity,
  onSelectCity,
  activeDimension,
  onSelectDimension,
  isGroupsOpen,
  onToggleGroups,
  isLocationOpen,
  onToggleLocation,
  isDimensionsOpen,
  onToggleDimensions,
  queryGroups,
  cityDistribution,
  totalCandidates,
  onResetFilters,
}: ReviewFilterPaneProps) {
  if (!isOpen) return null;

  const isAnyFilterActive =
    selectedGroupId !== null || selectedCity !== null || activeDimension !== "all";

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-surface-container-low rounded-2xl p-4 space-y-4 border-0 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-on-surface-variant" />
          <span>Queue Filters</span>
        </span>
        <div className="flex items-center gap-1.5">
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer mr-1"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer border-0"
            aria-label="Collapse filter sidebar"
            title="Collapse filter sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Section 1: Groups (Free-Text Semantic Query Lists) */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onToggleGroups}
          className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>Groups</span>
          </span>
          {isGroupsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isGroupsOpen && (
          <div className="space-y-1 pl-0.5">
            {queryGroups.map((group) => {
              const isSelected =
                selectedGroupId === group.id || (!selectedGroupId && group.id === "grp_all");
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => onSelectGroup(group.id === "grp_all" ? null : group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                    isSelected
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
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

      {/* Section 2: Location (Flat list, Existing-only, Count-sorted) */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onToggleLocation}
          className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>Location</span>
          </span>
          {isLocationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isLocationOpen && (
          <div className="space-y-1 pl-0.5">
            <button
              type="button"
              onClick={() => onSelectCity(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                selectedCity === null
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span>All Cities</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  selectedCity === null
                    ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {totalCandidates}
              </span>
            </button>

            {cityDistribution.map(({ city, count }) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(isSelected ? null : city)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left border-0 ${
                    isSelected
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
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

      <div className="h-px bg-outline-variant/30" />

      {/* Section 3: Focus Dimensions */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onToggleDimensions}
          className="w-full flex items-center justify-between text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>Focus Dimensions</span>
          </span>
          {isDimensionsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isDimensionsOpen && (
          <div className="space-y-1 pl-0.5">
            {[
              { id: "all", label: "All Dimensions" },
              { id: "skills", label: "Skills only" },
              { id: "experience", label: "Experience only" },
              { id: "logistics", label: "Logistics only" },
              { id: "education", label: "Education only" },
            ].map((dim) => {
              const isSelected = activeDimension === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => onSelectDimension(dim.id as FocusDimension)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border-0 ${
                    isSelected
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
