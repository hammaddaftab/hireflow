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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Hand Expandable Slide-over Panel */}
      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-84 sm:w-96 flex flex-col bg-surface-container-low border-l border-outline-variant/40 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
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
              {excludedCount > 0 ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-on-surface text-surface shadow-xs">
                  {excludedCount} Excluded
                </span>
              ) : (
                <span className="text-[11px] font-medium text-on-surface-variant">
                  All criteria active
                </span>
              )}
              <span className="text-[11px] text-on-surface-variant/70">
                ({activeCount} of {totalCount} active)
              </span>
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

            const groupExcludedCount = groupFields.filter((f) => f.active === false).length;

            return (
              <div key={group.name} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {group.name}
                  </div>
                  {groupExcludedCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-on-surface text-surface">
                      {groupExcludedCount} excluded
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 bg-surface-container rounded-xl p-2.5 border border-outline-variant/30">
                  {groupFields.map((field) => {
                    const isActive = field.active !== false;

                    return (
                      <div
                        key={field.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-transparent hover:bg-surface-container-high"
                            : "bg-surface-container-highest border border-outline/50 shadow-xs"
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div
                            className={`text-xs truncate ${
                              !isActive
                                ? "text-on-surface font-semibold line-through decoration-on-surface-variant/60"
                                : "text-on-surface font-normal"
                            }`}
                          >
                            {field.label}
                          </div>
                        </div>

                        {/* Interactive Active / Excluded Toggle Button */}
                        <button
                          type="button"
                          onClick={() => onToggleActive(field.id)}
                          aria-label={`Toggle active status for ${field.label}. Currently ${isActive ? "Active" : "Excluded"}`}
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase transition-all cursor-pointer select-none shrink-0 ${
                            isActive
                              ? "text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container border border-transparent hover:border-outline-variant/40 font-medium"
                              : "bg-on-surface text-surface font-bold shadow-xs hover:bg-on-surface/90"
                          }`}
                        >
                          {isActive ? "Active" : "EXCLUDED"}
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
        <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low shrink-0">
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
