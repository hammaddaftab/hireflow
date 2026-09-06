"use client";

import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import type { FormFieldState } from "@/features/jobs/types";

export interface RequirementFieldProps {
  field: FormFieldState;
  onToggleMode: (id: string) => void;
  onUpdateValue: (id: string, value: string | number) => void;
  onToggleActive?: (id: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function RequirementField({
  field,
  onToggleMode,
  onUpdateValue,
  onToggleActive,
  onFocus,
  onBlur,
}: RequirementFieldProps) {
  const isHard = field.mode === "hard";
  const isActive = field.active !== false;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only allow mode swapping if requirement is actively included
    if (!isActive) return;
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
          <Typography
            variant="label-medium"
            as="label"
            htmlFor={field.id}
            className={`block transition-colors ${!isActive ? "text-on-surface-variant/60 line-through" : ""}`}
          >
            {field.label}
          </Typography>
          {field.helperText && <Tooltip content={field.helperText} />}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mode Toggle Button or Excluded Indicator */}
          {isActive ? (
            <button
              type="button"
              onClick={() => onToggleMode(field.id)}
              aria-label={`Toggle requirement mode for ${field.label}. Currently ${field.mode}`}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] transition-colors cursor-pointer select-none ${
                isHard
                  ? "shadow-xs hover:bg-on-surface/90 border text-surface bg-on-surface font-semibold"
                  : "border text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {isHard ? "HARD" : "SOFT"}
              <span className="text-[9px] font-normal">(Shift+X)</span>
            </button>
          ) : onToggleActive ? (
            <button
              type="button"
              onClick={() => onToggleActive(field.id)}
              aria-label={`Re-include ${field.label} in evaluation`}
              title="Click to re-include in screening"
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:border-outline border border-outline-variant/60 transition-colors cursor-pointer select-none"
            >
              EXCLUDED
            </button>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-container-highest text-on-surface-variant border border-outline-variant/60 select-none">
              EXCLUDED
            </span>
          )}
        </div>
      </div>

      {/* Form Control with Standard Neutral Styling */}
      <div className={`relative transition-opacity ${!isActive ? "opacity-40 pointer-events-none select-none" : ""}`}>
        {field.options ? (
          <select
            id={field.id}
            disabled={!isActive}
            value={String(field.value)}
            onChange={(e) => onUpdateValue(field.id, e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
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
              disabled={!isActive}
              min={0}
              value={field.value}
              onChange={(e) =>
                onUpdateValue(field.id, Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-32 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
            />
            <span className="text-xs font-medium text-on-surface-variant">{field.unit}</span>
          </div>
        ) : (
          <input
            id={field.id}
            type="text"
            disabled={!isActive}
            value={String(field.value)}
            onChange={(e) => onUpdateValue(field.id, e.target.value)}
            placeholder="Enter requirement..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
          />
        )}
      </div>
    </div>
  );
}
