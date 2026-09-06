"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Command } from "cmdk";
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
  const isMultiSelect = field.id === "skillsRequired" || field.id === "skillsPreferred";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const commandRef = useRef<HTMLDivElement>(null);

  const selectedItems = isMultiSelect
    ? String(field.value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleAddItem = (item: string) => {
    if (!item) return;
    const next = [...selectedItems, item];
    onUpdateValue(field.id, next.join(", "));
  };

  const handleRemoveItem = (itemToRemove: string) => {
    const next = selectedItems.filter((s) => s !== itemToRemove);
    onUpdateValue(field.id, next.join(", "));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out already selected items from the canonical closed set
  const availableOptions = useMemo(() => {
    if (!field.options) return [];
    const selectedSet = new Set(selectedItems.map((s) => s.toLowerCase()));
    return field.options.filter((opt) => !selectedSet.has(opt.toLowerCase()));
  }, [field.options, selectedItems]);

  // Custom cmdk prefix-prioritized filter
  const filterSkill = (value: string, query: string) => {
    const v = value.toLowerCase();
    const q = query.toLowerCase();
    if (v.startsWith(q)) return 1;
    if (v.includes(q)) return 0.5;
    return 0;
  };

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
        {isMultiSelect && field.options ? (
          <div className="space-y-2">
            {/* Selected canonical badges */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 rounded-md border border-outline-variant bg-surface-container-lowest">
              {selectedItems.length === 0 ? (
                <span className="text-xs text-on-surface-variant/60 italic py-0.5">
                  No canonical skills selected. Pick from the closed set below.
                </span>
              ) : (
                selectedItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-md bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface border border-outline-variant shadow-2xs"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      disabled={!isActive}
                      onClick={() => handleRemoveItem(item)}
                      aria-label={`Remove ${item}`}
                      className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* cmdk Autocomplete Combobox */}
            <div ref={commandRef} className="relative">
              <Command
                filter={filterSkill}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                  }
                  if (e.key === "Backspace" && !search && selectedItems.length > 0) {
                    handleRemoveItem(selectedItems[selectedItems.length - 1]);
                  }
                }}
              >
                <Command.Input
                  id={field.id}
                  disabled={!isActive}
                  value={search}
                  onValueChange={(val) => {
                    setSearch(val);
                    setOpen(val.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (search.trim().length > 0) setOpen(true);
                  }}
                  placeholder="Type skill prefix to search ~500 catalog (e.g. React, Python, AWS, Docker)..."
                  className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
                />

                {open && search.trim().length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-full rounded-md border border-outline-variant bg-surface-container-high shadow-lg z-40 overflow-hidden">
                    <Command.List className="max-h-48 overflow-y-auto p-1">
                      <Command.Empty className="px-3 py-2 text-xs text-on-surface-variant italic">
                        No matching canonical skills found
                      </Command.Empty>
                      {availableOptions.map((opt) => (
                        <Command.Item
                          key={opt}
                          value={opt}
                          onSelect={() => {
                            handleAddItem(opt);
                            setSearch("");
                            setOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-sm flex items-center justify-between cursor-pointer transition-colors text-on-surface data-[selected=true]:bg-on-surface data-[selected=true]:text-surface aria-selected:bg-on-surface aria-selected:text-surface"
                        >
                          <span>{opt}</span>
                          <span className="text-[10px] opacity-70">canonical</span>
                        </Command.Item>
                      ))}
                    </Command.List>
                  </div>
                )}
              </Command>
            </div>
          </div>
        ) : field.options ? (
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
