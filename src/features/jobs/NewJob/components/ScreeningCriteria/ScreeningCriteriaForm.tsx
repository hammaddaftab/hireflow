"use client";

import React, { useState } from "react";
import { SlidersHorizontal, HelpCircle } from "lucide-react";
import { GroupContainer } from "@/components/ui/GroupContainer";
import { Button } from "@/components/ui/Button";
import type { FormFieldState } from "@/features/jobs/types";
import { RequirementField } from "./RequirementField";
import { CriteriaInclusionSlider } from "./CriteriaInclusionSlider";

export interface ScreeningCriteriaFormProps {
  fields: Record<string, FormFieldState>;
  onToggleMode: (id: string) => void;
  onUpdateValue: (id: string, value: string | number) => void;
  onToggleActive?: (id: string) => void;
  onBack: () => void;
  onSave: (e: React.FormEvent) => void;
  onPreviewOverlay: () => void;
  onOpenGuide?: () => void;
  submitLabel?: string;
}

export function ScreeningCriteriaForm({
  fields,
  onToggleMode,
  onUpdateValue,
  onToggleActive,
  onBack,
  onSave,
  onPreviewOverlay,
  onOpenGuide,
  submitLabel,
}: ScreeningCriteriaFormProps) {
  const [_focusedId, setFocusedId] = useState<string | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const fieldList = Object.values(fields);
  const hardCount = fieldList.filter((f) => f.active !== false && f.mode === "hard").length;
  const softCount = fieldList.filter((f) => f.active !== false && f.mode === "soft").length;
  const excludedCount = fieldList.filter((f) => f.active === false).length;
  const activeCount = fieldList.length - excludedCount;

  const handleIncludeAll = () => {
    if (!onToggleActive) return;
    fieldList.forEach((f) => {
      if (f.active === false) {
        onToggleActive(f.id);
      }
    });
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* Header with Live Counts, How Screening Works Trigger, and Slider Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {onOpenGuide && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<HelpCircle className="h-3.5 w-3.5" />}
              onClick={onOpenGuide}
              className="text-xs h-7.5 px-3 font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              How Screening Works
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-md bg-on-surface text-surface px-2.5 py-1 text-xs font-bold shadow-xs">
            {hardCount} Hard Dealbreakers
          </span>
          <span className="rounded-md bg-surface-container-high text-on-surface px-2.5 py-1 text-xs font-semibold shadow-xs">
            {softCount} Soft Bonus Criteria
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Group 1: Experience & Skills Requirements */}
        <GroupContainer
          index={0}
          title="Experience & Skills Requirements"
          description="Minimum general career duration and mandatory vs. preferred skill proficiencies."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            {fields.minExperience && (
              <RequirementField
                field={fields.minExperience}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.minExperience.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.minExperience.id ? null : curr))}
              />
            )}
            <div className="hidden md:block" />
            {fields.skillsRequired && (
              <div className="col-span-1 md:col-span-2">
                <RequirementField
                  field={fields.skillsRequired}
                  onToggleMode={onToggleMode}
                  onUpdateValue={onUpdateValue}
                  onToggleActive={onToggleActive}
                  onFocus={() => setFocusedId(fields.skillsRequired.id)}
                  onBlur={() => setFocusedId((curr) => (curr === fields.skillsRequired.id ? null : curr))}
                />
              </div>
            )}
            {fields.skillsPreferred && (
              <div className="col-span-1 md:col-span-2">
                <RequirementField
                  field={fields.skillsPreferred}
                  onToggleMode={onToggleMode}
                  onUpdateValue={onUpdateValue}
                  onToggleActive={onToggleActive}
                  onFocus={() => setFocusedId(fields.skillsPreferred.id)}
                  onBlur={() => setFocusedId((curr) => (curr === fields.skillsPreferred.id ? null : curr))}
                />
              </div>
            )}
          </div>
        </GroupContainer>

        {/* Group 2: Education Requirements */}
        <GroupContainer
          index={1}
          title="Education & Credentials"
          description="Standardized degree tier requirements and academic disciplines."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            {fields.degreeLevel && (
              <RequirementField
                field={fields.degreeLevel}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.degreeLevel.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.degreeLevel.id ? null : curr))}
              />
            )}
            {fields.fieldOfStudy && (
              <RequirementField
                field={fields.fieldOfStudy}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.fieldOfStudy.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.fieldOfStudy.id ? null : curr))}
              />
            )}
          </div>
        </GroupContainer>

        {/* Group 3: Location & Work Mode */}
        <GroupContainer
          index={2}
          title="Location & Work Arrangement"
          description="Geographic jurisdiction boundaries and physical attendance arrangements."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            {fields.locationCity && (
              <RequirementField
                field={fields.locationCity}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.locationCity.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.locationCity.id ? null : curr))}
              />
            )}
            {fields.locationProvince && (
              <RequirementField
                field={fields.locationProvince}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.locationProvince.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.locationProvince.id ? null : curr))}
              />
            )}
            {fields.workMode && (
              <RequirementField
                field={fields.workMode}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.workMode.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.workMode.id ? null : curr))}
              />
            )}
          </div>
        </GroupContainer>

        {/* Group 4: Compensation & Notice Period Constraints */}
        <GroupContainer
          index={3}
          title="Compensation & Notice Period"
          description="Base compensation band limits and maximum allowable notice period before start date."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            {fields.compensationMin && (
              <RequirementField
                field={fields.compensationMin}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.compensationMin.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.compensationMin.id ? null : curr))}
              />
            )}
            {fields.compensationMax && (
              <RequirementField
                field={fields.compensationMax}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.compensationMax.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.compensationMax.id ? null : curr))}
              />
            )}
            {fields.compensationCurrency && (
              <RequirementField
                field={fields.compensationCurrency}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.compensationCurrency.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.compensationCurrency.id ? null : curr))}
              />
            )}
            {fields.noticePeriod && (
              <RequirementField
                field={fields.noticePeriod}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.noticePeriod.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.noticePeriod.id ? null : curr))}
              />
            )}
            {fields.noticePeriodUnit && (
              <RequirementField
                field={fields.noticePeriodUnit}
                onToggleMode={onToggleMode}
                onUpdateValue={onUpdateValue}
                onToggleActive={onToggleActive}
                onFocus={() => setFocusedId(fields.noticePeriodUnit.id)}
                onBlur={() => setFocusedId((curr) => (curr === fields.noticePeriodUnit.id ? null : curr))}
              />
            )}
          </div>
        </GroupContainer>
      </div>

      {/* Step 2 Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-outline-variant pt-5">
        <div className="text-xs text-on-surface-variant font-medium">
          Shortcut: Focus any requirement and press{" "}
          <kbd className="rounded bg-surface-container-high px-2 py-0.5 font-mono text-xs font-bold text-on-surface border border-outline-variant shadow-2xs">
            Shift+X
          </kbd>{" "}
          to swap between Hard Dealbreaker and Soft Scored.
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
          >
            Back to Identity
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onPreviewOverlay}
          >
            Preview in Overlay Container
          </Button>
          <Button type="submit" variant="primary" size="md">
            {submitLabel || "Save Requirements Schema"}
          </Button>
        </div>
      </div>

      {/* Right-edge Docked Slider Trigger Tab */}
      {onToggleActive && (
        <button
          type="button"
          onClick={() => setIsSliderOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2 rounded-l-xl bg-surface-container-highest border-l-2 border-y border-l-primary border-outline-variant px-3 py-2.5 shadow-lg hover:bg-surface-container-high transition-colors cursor-pointer group"
          title="Open Criteria Inclusion Slider"
          aria-label="Open Criteria Inclusion Slider"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-[11px] font-bold text-on-surface">Criteria</span>
            <span className="text-[10px] font-medium">
              {excludedCount > 0 ? (
                <span className="font-bold text-on-surface">{excludedCount} Excluded</span>
              ) : (
                <span className="text-on-surface-variant">{activeCount} Active</span>
              )}
            </span>
          </div>
        </button>
      )}

      {/* Right-Hand Expandable Criteria Inclusion Slider */}
      {onToggleActive && (
        <CriteriaInclusionSlider
          isOpen={isSliderOpen}
          onClose={() => setIsSliderOpen(false)}
          fields={fields}
          onToggleActive={onToggleActive}
          onIncludeAll={handleIncludeAll}
        />
      )}
    </form>
  );
}
