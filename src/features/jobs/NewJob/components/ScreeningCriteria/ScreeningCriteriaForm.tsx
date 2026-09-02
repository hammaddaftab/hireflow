"use client";

import React, { useState } from "react";
import { GroupContainer } from "@/components/ui/GroupContainer";
import { Button } from "@/components/ui/Button";
import type { FormFieldState } from "@/features/jobs/types";
import { RequirementField } from "./RequirementField";

export interface ScreeningCriteriaFormProps {
  fields: Record<string, FormFieldState>;
  onToggleMode: (id: string) => void;
  onUpdateValue: (id: string, value: string | number) => void;
  onBack: () => void;
  onSave: (e: React.FormEvent) => void;
  onPreviewOverlay: () => void;
}

export function ScreeningCriteriaForm({
  fields,
  onToggleMode,
  onUpdateValue,
  onBack,
  onSave,
  onPreviewOverlay,
}: ScreeningCriteriaFormProps) {
  const [_focusedId, setFocusedId] = useState<string | null>(null);

  const fieldList = Object.values(fields);
  const hardCount = fieldList.filter((f) => f.mode === "hard").length;
  const softCount = fieldList.filter((f) => f.mode === "soft").length;

  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* Header with Live Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div />
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
        {/* Group 1: Experience Container */}
        <GroupContainer
          index={0}
          title="Experience Requirements"
          description="Total career duration and backend domain depth thresholds."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            <RequirementField
              field={fields.totalExperience}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.totalExperience.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.totalExperience.id ? null : curr))}
            />
            <RequirementField
              field={fields.domainExperience}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.domainExperience.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.domainExperience.id ? null : curr))}
            />
          </div>
        </GroupContainer>

        {/* Group 2: Logistics & Work Arrangement Container */}
        <GroupContainer
          index={1}
          title="Logistics & Work Arrangement"
          description="Geographic jurisdiction, attendance presence, budget cap, and notice period constraints."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            <RequirementField
              field={fields.location}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.location.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.location.id ? null : curr))}
            />
            <RequirementField
              field={fields.workplace}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.workplace.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.workplace.id ? null : curr))}
            />
            <RequirementField
              field={fields.compensation}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.compensation.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.compensation.id ? null : curr))}
            />
            <RequirementField
              field={fields.noticePeriod}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.noticePeriod.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.noticePeriod.id ? null : curr))}
            />
          </div>
        </GroupContainer>

        {/* Group 3: Education & Credentials Container */}
        <GroupContainer
          index={2}
          title="Education & Credentials"
          description="Degree level qualifications and academic disciplines."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            <RequirementField
              field={fields.degree}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.degree.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.degree.id ? null : curr))}
            />
            <RequirementField
              field={fields.fieldOfStudy}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.fieldOfStudy.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.fieldOfStudy.id ? null : curr))}
            />
          </div>
        </GroupContainer>

        {/* Group 4: Language & Specialized Verifications Container */}
        <GroupContainer
          index={3}
          title="Language & Specialized Verifications"
          description="Required communication languages and industry domain certifications."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            <RequirementField
              field={fields.language}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.language.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.language.id ? null : curr))}
            />
            <RequirementField
              field={fields.certification}
              onToggleMode={onToggleMode}
              onUpdateValue={onUpdateValue}
              onFocus={() => setFocusedId(fields.certification.id)}
              onBlur={() => setFocusedId((curr) => (curr === fields.certification.id ? null : curr))}
            />
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
          to swap between Hard Knockout and Soft Scored.
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
            Save Requirements Schema
          </Button>
        </div>
      </div>
    </form>
  );
}
