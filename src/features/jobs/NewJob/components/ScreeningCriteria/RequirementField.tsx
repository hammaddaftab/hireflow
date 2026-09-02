"use client";

import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import type { FormFieldState } from "@/features/jobs/types";

export interface RequirementFieldProps {
  field: FormFieldState;
  onToggleMode: (id: string) => void;
  onUpdateValue: (id: string, value: string | number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function RequirementField({
  field,
  onToggleMode,
  onUpdateValue,
  onFocus,
  onBlur,
}: RequirementFieldProps) {
  const isHard = field.mode === "hard";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Hold/press Shift+X or Alt+X to toggle mode while focused
    if ((e.key === "x" || e.key === "X") && (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onToggleMode(field.id);
    }
  };

  return (
    <div
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Typography variant="label-medium" as="label" htmlFor={field.id} className="block">
            {field.label}
          </Typography>
          {field.helperText && <Tooltip content={field.helperText} />}
        </div>

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleMode(field.id)}
          aria-label={`Toggle requirement mode for ${field.label}. Currently ${field.mode}`}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] transition-colors cursor-pointer select-none ${
            isHard
              ? "shadow-xs hover:bg-on-surface/90 border text-surface bg-on-surface font-semibold"
              : "border text-on-surface-variant"
          }`}
        >
          {isHard ? "HARD" : "SOFT"}
          <span className="text-[9px] font-normal">(Shift+X)</span>
        </button>
      </div>

      {/* Form Control with Standard Neutral Styling */}
      <div className="relative">
        {field.options ? (
          <select
            id={field.id}
            value={String(field.value)}
            onChange={(e) => onUpdateValue(field.id, e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : typeof field.value === "number" ? (
          <div className="flex items-center gap-2">
            <input
              id={field.id}
              type="number"
              min={0}
              value={field.value}
              onChange={(e) =>
                onUpdateValue(field.id, Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-32 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <span className="text-xs font-medium text-on-surface-variant">{field.unit}</span>
          </div>
        ) : (
          <input
            id={field.id}
            type="text"
            value={String(field.value)}
            onChange={(e) => onUpdateValue(field.id, e.target.value)}
            placeholder="Enter requirement..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}
