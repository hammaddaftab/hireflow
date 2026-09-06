"use client";

import React, { useEffect } from "react";
import { X, SlidersHorizontal, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { FormFieldState } from "@/features/jobs/types";

export interface CriteriaInclusionSliderProps {
  isOpen: boolean;
  onClose: () => void;
  fields: Record<string, FormFieldState>;
  onToggleActive: (id: string) => void;
  onIncludeAll?: () => void;
}

interface CriteriaGroup {
  name: string;
  fieldIds: string[];
}

const CRITERIA_GROUPS: CriteriaGroup[] = [
  {
    name: "Experience & Skills",
    fieldIds: ["minExperience", "skillsRequired", "skillsPreferred"],
  },
  {
    name: "Education & Credentials",
    fieldIds: ["degreeLevel", "fieldOfStudy"],
  },
  {
    name: "Location & Work Arrangement",
    fieldIds: ["locationCity", "locationProvince", "workMode"],
  },
  {
    name: "Compensation & Notice Period",
    fieldIds: [
      "compensationMin",
      "compensationMax",
      "compensationCurrency",
      "noticePeriod",
      "noticePeriodUnit",
    ],
  },
];

export function CriteriaInclusionSlider({
  isOpen,
  onClose,
  fields,
  onToggleActive,
  onIncludeAll,
}: CriteriaInclusionSliderProps) {
  // Listen for Escape key to close the slider
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fieldList = Object.values(fields);
  const totalCount = fieldList.length;
  const activeCount = fieldList.filter((f) => f.active !== false).length;
  const excludedCount = totalCount - activeCount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Hand Expandable Slide-over Panel */}
      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-84 sm:w-96 flex flex-col bg-surface-container-low/98 dark:bg-[#0c121e]/98 backdrop-blur-xl border-l border-outline-variant/40 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Slider Header */}
        <div className="p-5 border-b border-outline-variant/40 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-bold text-on-surface uppercase tracking-wider">
                Criteria Inclusion
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer border-0"
              aria-label="Close criteria inclusion slider"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Manage which requirement criteria are actively evaluated against candidate resumes.
          </p>

          {/* Metrics & Quick Actions Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface border border-outline-variant/40">
                {activeCount} Active
              </span>
              {excludedCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-container-lowest text-on-surface-variant/80 border border-outline-variant/30">
                  {excludedCount} Excluded
                </span>
              )}
            </div>

            {excludedCount > 0 && onIncludeAll && (
              <button
                type="button"
                onClick={onIncludeAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Include All</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Criteria Categories */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {CRITERIA_GROUPS.map((group) => {
            const groupFields = group.fieldIds
              .map((id) => fields[id])
              .filter((f): f is FormFieldState => Boolean(f));

            if (groupFields.length === 0) return null;

            return (
              <div key={group.name} className="space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {group.name}
                </div>

                <div className="space-y-1.5 bg-surface-container/50 rounded-xl p-2.5 border border-outline-variant/30">
                  {groupFields.map((field) => {
                    const isActive = field.active !== false;
                    const isHard = field.mode === "hard";

                    return (
                      <div
                        key={field.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-surface hover:bg-surface-container-high/60"
                            : "bg-surface-container-lowest/60 opacity-60"
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div
                            className={`text-xs font-medium truncate ${
                              !isActive
                                ? "text-on-surface-variant line-through"
                                : "text-on-surface font-semibold"
                            }`}
                          >
                            {field.label}
                          </div>
                          <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                                isHard
                                  ? "bg-on-surface text-surface font-bold"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              {isHard ? "KNOCKOUT" : "BONUS"}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Active / Excluded Badge Button */}
                        <button
                          type="button"
                          onClick={() => onToggleActive(field.id)}
                          aria-label={`Toggle active status for ${field.label}. Currently ${isActive ? "Active" : "Excluded"}`}
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer select-none border shrink-0 ${
                            isActive
                              ? "bg-primary text-on-primary border-primary shadow-2xs hover:bg-primary/90"
                              : "bg-surface-container-lowest text-on-surface-variant/60 border-outline-variant/40 line-through hover:text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "EXCLUDED"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Slider Bottom Action Bar */}
        <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/90 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full text-xs font-bold"
          >
            Done
          </Button>
        </div>
      </aside>
    </div>
  );
}
