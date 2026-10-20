"use client";

import { useMemo } from "react";
import type { QueueFilterTab } from "@/entities/review";
import { formatSalaryNumber } from "@/features/review/core/utils/queueCalculations";

export interface ActiveReviewChip {
  id: string;
  label: string;
  category: "status" | "city" | "university" | "experience" | "salary";
  onRemove: () => void;
}

export interface UseActiveReviewChipsParams {
  activeTab?: QueueFilterTab;
  onSelectTab?: (tab: QueueFilterTab) => void;
  selectedCity?: string | null;
  onSelectCity?: (city: string | null) => void;
  selectedUniversity?: string | null;
  onSelectUniversity?: (university: string | null) => void;
  experienceRange?: [number, number];
  onExperienceChange?: (range: [number, number]) => void;
  experienceBounds?: { min: number; max: number; step: number };
  salaryRange?: [number, number];
  onSalaryChange?: (range: [number, number]) => void;
  salaryBounds?: { min: number; max: number; step: number; currency: string };
  includeUnstatedSalary?: boolean;
  onToggleIncludeUnstatedSalary?: () => void;
}

// Generates an array of individual active filter chips with removal handlers
export function useActiveReviewChips({
  activeTab,
  onSelectTab,
  selectedCity,
  onSelectCity,
  selectedUniversity,
  onSelectUniversity,
  experienceRange,
  onExperienceChange,
  experienceBounds = { min: 0, max: 15, step: 1 },
  salaryRange,
  onSalaryChange,
  salaryBounds = { min: 0, max: 1000000, step: 25000, currency: "PKR" },
  includeUnstatedSalary = true,
  onToggleIncludeUnstatedSalary,
}: UseActiveReviewChipsParams): ActiveReviewChip[] {
  return useMemo(() => {
    const chips: ActiveReviewChip[] = [];

    // Queue Status Tab Chip
    if (activeTab && activeTab !== "all" && onSelectTab) {
      const tabLabels: Record<string, string> = {
        fast_clear: "Confirmed",
        needs_attention: "2nd Look",
        contradicted: "Contradicted",
      };
      chips.push({
        id: `tab-${activeTab}`,
        label: tabLabels[activeTab] || activeTab,
        category: "status",
        onRemove: () => onSelectTab("all"),
      });
    }

    // City Location Chip
    if (selectedCity && onSelectCity) {
      chips.push({
        id: `city-${selectedCity}`,
        label:
          selectedCity === "Need Attention" || selectedCity === "Unspecified"
            ? `Location: ${selectedCity}`
            : selectedCity,
        category: "city",
        onRemove: () => onSelectCity(null),
      });
    }

    // University Chip
    if (selectedUniversity && onSelectUniversity) {
      chips.push({
        id: `university-${selectedUniversity}`,
        label:
          selectedUniversity === "Need Attention" || selectedUniversity === "Unspecified"
            ? `University: ${selectedUniversity}`
            : selectedUniversity,
        category: "university",
        onRemove: () => onSelectUniversity(null),
      });
    }

    // Experience Range Chip
    if (
      experienceRange &&
      onExperienceChange &&
      (experienceRange[0] > experienceBounds.min || experienceRange[1] < experienceBounds.max)
    ) {
      const maxExpLabel =
        experienceRange[1] >= experienceBounds.max
          ? `${experienceRange[1]}+`
          : `${experienceRange[1]}`;
      chips.push({
        id: "filter-exp",
        label: `Exp: ${experienceRange[0]}–${maxExpLabel} yrs`,
        category: "experience",
        onRemove: () => onExperienceChange([experienceBounds.min, experienceBounds.max]),
      });
    }

    // Salary Range and Unstated Salary Chip
    if (
      salaryRange &&
      onSalaryChange &&
      (salaryRange[0] > salaryBounds.min ||
        salaryRange[1] < salaryBounds.max ||
        includeUnstatedSalary === false)
    ) {
      const minSalLabel = formatSalaryNumber(salaryRange[0]);
      const maxSalLabel = formatSalaryNumber(salaryRange[1]);
      const unstatedSuffix = includeUnstatedSalary === false ? " (stated only)" : "";
      chips.push({
        id: "filter-salary",
        label: `Salary: ${minSalLabel}–${maxSalLabel} ${salaryBounds.currency}${unstatedSuffix}`,
        category: "salary",
        onRemove: () => {
          onSalaryChange([salaryBounds.min, salaryBounds.max]);
          if (includeUnstatedSalary === false && onToggleIncludeUnstatedSalary) {
            onToggleIncludeUnstatedSalary();
          }
        },
      });
    }

    return chips;
  }, [
    activeTab,
    onSelectTab,
    selectedCity,
    onSelectCity,
    selectedUniversity,
    onSelectUniversity,
    experienceRange,
    onExperienceChange,
    experienceBounds,
    salaryRange,
    onSalaryChange,
    salaryBounds,
    includeUnstatedSalary,
    onToggleIncludeUnstatedSalary,
  ]);
}
