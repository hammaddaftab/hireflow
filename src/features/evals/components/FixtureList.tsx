"use client";

import React from "react";
import { Play, Edit2, Trash2, Copy, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ExperienceTestFixture, ExperienceEvalResult } from "../types";

export interface FixtureListProps {
  fixtures: ExperienceTestFixture[];
  selectedFixtureId: string;
  onSelectFixture: (fixture: ExperienceTestFixture) => void;
  onRunSingle: (fixture: ExperienceTestFixture) => void;
  onEditFixture: (fixture: ExperienceTestFixture) => void;
  onDeleteFixture: (fixtureId: string) => void;
  onDuplicateFixture: (fixture: ExperienceTestFixture) => void;
  resultsMap: Record<string, ExperienceEvalResult>;
  runningFixtureId: string | null;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function FixtureList({
  fixtures,
  selectedFixtureId,
  onSelectFixture,
  onRunSingle,
  onEditFixture,
  onDeleteFixture,
  onDuplicateFixture,
  resultsMap,
  runningFixtureId,
  selectedCategory,
  onSelectCategory,
}: FixtureListProps) {
  const categories: { id: string; label: string }[] = [
    { id: "all", label: "All" },
    { id: "user_reported_bug", label: "User Issue" },
    { id: "standard_progression", label: "Standard" },
    { id: "concurrency_overlap", label: "Overlap" },
    { id: "contract_freelance", label: "Contract/Freelance" },
    { id: "date_formats", label: "Date Formats" },
    { id: "custom", label: "Custom" },
  ];

  const filteredFixtures = fixtures.filter((f) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "custom") return Boolean(f.isCustom);
    return f.category === selectedCategory;
  });

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Category Pills Header */}
      <div className="p-3 border-b border-outline-variant/40 bg-surface-container-low/50">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCategory(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/40"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fixtures List */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 p-2 space-y-1">
        {filteredFixtures.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant">
            No fixtures match the selected category.
          </div>
        ) : (
          filteredFixtures.map((fixture) => {
            const isSelected = fixture.id === selectedFixtureId;
            const result = resultsMap[fixture.id];
            const isRunning = runningFixtureId === fixture.id;

            return (
              <div
                key={fixture.id}
                onClick={() => onSelectFixture(fixture)}
                className={`p-3 rounded-xl transition-all cursor-pointer text-xs space-y-2 border ${
                  isSelected
                    ? "bg-primary/5 border-primary/40 shadow-2xs"
                    : "bg-surface border-transparent hover:bg-surface-container-low/70 hover:border-outline-variant/30"
                }`}
              >
                {/* Top Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-on-surface text-[13px] truncate">
                        {fixture.title}
                      </span>
                      {fixture.isCustom && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          custom
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                      {fixture.description}
                    </p>
                  </div>

                  {/* Result pill */}
                  {result && (
                    <div className="shrink-0">
                      {result.status === "pass" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Pass</span>
                        </span>
                      )}
                      {result.status === "warn" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Warn</span>
                        </span>
                      )}
                      {result.status === "fail" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          <span>Fail</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics Badges & Action Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/20">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant">
                    <span>Exp: {fixture.expected.totalYears}y</span>
                    <span>•</span>
                    <span>{fixture.expected.rolesCount} roles</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicateFixture(fixture)}
                      title="Duplicate fixture"
                      className="h-6 w-6 p-0 text-on-surface-variant hover:text-on-surface"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>

                    {fixture.isCustom && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditFixture(fixture)}
                          title="Edit fixture"
                          className="h-6 w-6 p-0 text-on-surface-variant hover:text-on-surface"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteFixture(fixture.id)}
                          title="Delete fixture"
                          className="h-6 w-6 p-0 text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isRunning}
                      onClick={() => onRunSingle(fixture)}
                      className="h-6 px-2 text-[11px] gap-1 font-semibold"
                    >
                      <Play className={`h-2.5 w-2.5 ${isRunning ? "animate-spin" : ""}`} />
                      <span>{isRunning ? "Running..." : "Test"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
