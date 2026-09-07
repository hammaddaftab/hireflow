"use client";

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ExperienceTestFixture, FixtureCategory } from "../types";

export interface FixtureEditorModalProps {
  initialFixture?: ExperienceTestFixture | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fixture: ExperienceTestFixture) => void;
}

export function FixtureEditorModal({
  initialFixture,
  isOpen,
  onClose,
  onSave,
}: FixtureEditorModalProps) {
  const [title, setTitle] = useState(initialFixture?.title || "");
  const [description, setDescription] = useState(initialFixture?.description || "");
  const [category, setCategory] = useState<FixtureCategory>(
    initialFixture?.category || "custom"
  );
  const [resumeText, setResumeText] = useState(initialFixture?.resumeText || "");
  const [expectedTotalYears, setExpectedTotalYears] = useState(
    initialFixture?.expected.totalYears ?? 4.0
  );
  const [expectedFullTimeYears, setExpectedFullTimeYears] = useState(
    initialFixture?.expected.fullTimeYears ?? 4.0
  );
  const [expectedRolesCount, setExpectedRolesCount] = useState(
    initialFixture?.expected.rolesCount ?? 3
  );
  const [minYearsRequirement, setMinYearsRequirement] = useState(
    initialFixture?.targetJobRequirement.minYears ?? 5
  );
  const [toleranceYears] = useState(
    initialFixture?.toleranceYears ?? 0.2
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !resumeText.trim()) return;

    const fixture: ExperienceTestFixture = {
      id: initialFixture?.id || `fixture-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "User-defined custom stress-test fixture",
      category,
      resumeText: resumeText.trim(),
      expected: {
        totalYears: Number(expectedTotalYears),
        fullTimeYears: Number(expectedFullTimeYears),
        rolesCount: Number(expectedRolesCount),
      },
      targetJobRequirement: {
        minYears: Number(minYearsRequirement),
        blocking: true,
      },
      toleranceYears: Number(toleranceYears),
      createdAt: initialFixture?.createdAt || new Date().toISOString(),
      isCustom: true,
    };

    onSave(fixture);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-xs">
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/60">
          <div>
            <h2 className="text-base font-bold text-on-surface">
              {initialFixture ? "Edit Stress-Test Fixture" : "Create New Experience Fixture"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Define manual resume data, target job parameters, and expected ground truth.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-on-surface">Fixture Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3 Roles with Overlapping Dates"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FixtureCategory)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-xs focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="custom">Custom</option>
                <option value="user_reported_bug">User Issue</option>
                <option value="standard_progression">Standard Progression</option>
                <option value="concurrency_overlap">Concurrent Overlap</option>
                <option value="contract_freelance">Contract & Freelance</option>
                <option value="date_formats">Date Formats</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-on-surface">Description / Context</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context or specific edge-case tested by this fixture"
              className="text-xs"
            />
          </div>

          {/* Expected Values Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="space-y-1">
              <label className="font-medium text-on-surface-variant text-[11px]">
                Expected Total Yrs
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={expectedTotalYears}
                onChange={(e) => setExpectedTotalYears(parseFloat(e.target.value) || 0)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-on-surface-variant text-[11px]">
                Expected Full-Time Yrs
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={expectedFullTimeYears}
                onChange={(e) => setExpectedFullTimeYears(parseFloat(e.target.value) || 0)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-on-surface-variant text-[11px]">
                Expected Roles Count
              </label>
              <Input
                type="number"
                min="1"
                value={expectedRolesCount}
                onChange={(e) => setExpectedRolesCount(parseInt(e.target.value, 10) || 1)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-on-surface-variant text-[11px]">
                Job Min Requirement
              </label>
              <Input
                type="number"
                min="0"
                value={minYearsRequirement}
                onChange={(e) => setMinYearsRequirement(parseInt(e.target.value, 10) || 0)}
                required
                className="text-xs"
              />
            </div>
          </div>

          {/* Manual Resume Text Area */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-on-surface">
                Manual Resume Text (Work History Section)
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Include role titles, companies, dates (YYYY-MM), and descriptions
              </span>
            </div>
            <textarea
              rows={9}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste or write candidate work history here..."
              required
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs font-mono leading-relaxed focus:ring-1 focus:ring-primary outline-none resize-y"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5 font-semibold">
              <Save className="h-3.5 w-3.5" />
              <span>Save Fixture</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
