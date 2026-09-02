"use client";

import React from "react";

export interface JobFormStepperProps {
  currentStep: 1 | 2;
  onSelectStep: (step: 1 | 2) => void;
  isStep2Unlocked: boolean;
}

export function JobFormStepper({
  currentStep,
  onSelectStep,
  isStep2Unlocked,
}: JobFormStepperProps) {
  return (
    <div className="flex items-center gap-3 border-b border-outline-variant pb-3 text-xs font-semibold">
      <button
        type="button"
        onClick={() => onSelectStep(1)}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
          currentStep === 1
            ? "bg-primary-container text-on-primary-container font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface">
          1
        </span>
        <span>Role Identity</span>
      </button>

      <span className="text-outline-variant font-normal">/</span>

      <button
        type="button"
        disabled={!isStep2Unlocked}
        onClick={() => {
          if (isStep2Unlocked) {
            onSelectStep(2);
          }
        }}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
          currentStep === 2
            ? "bg-primary-container text-on-primary-container font-bold"
            : isStep2Unlocked
            ? "text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            : "text-on-surface-variant/50 cursor-not-allowed"
        }`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface">
          2
        </span>
        <span>Screening Criteria</span>
      </button>
    </div>
  );
}
