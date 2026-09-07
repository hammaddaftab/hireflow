"use client";

import React from "react";
import { Play, Plus, RotateCcw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BatchEvalSummary } from "../types";

export interface StressTestSummaryBannerProps {
  summary: BatchEvalSummary | null;
  totalFixturesCount: number;
  isRunningBatch: boolean;
  onRunBatch: () => void;
  onOpenCreateModal: () => void;
  onResetDefaults: () => void;
}

export function StressTestSummaryBanner({
  summary,
  totalFixturesCount: _totalFixturesCount,
  isRunningBatch,
  onRunBatch,
  onOpenCreateModal,
  onResetDefaults,
}: StressTestSummaryBannerProps) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-primary font-semibold">
              OpenAI Reliability Testbed
            </span>
            <span className="text-on-surface-variant/40">•</span>
            <span className="text-xs text-on-surface-variant">
              Experience Parameter Benchmark
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
            AI Experience Parsing Benchmarks
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Stress test candidate work history extraction, date boundary arithmetic, and employment-type classification against ground-truth fixtures using the configured OpenAI provider.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetDefaults}
            className="h-8 px-3 text-xs gap-1.5 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Fixtures</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateModal}
            className="h-8 px-3 text-xs gap-1.5 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Fixture</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={isRunningBatch}
            onClick={onRunBatch}
            className="h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Play className={`h-3.5 w-3.5 ${isRunningBatch ? "animate-spin" : ""}`} />
            <span>{isRunningBatch ? "Running Suite..." : "Run All Fixtures"}</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Score Bar if summary exists */}
      {summary && (
        <div className="pt-3 border-t border-outline-variant/40 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Pass Rate
            </span>
            <div className="text-lg font-bold text-primary font-mono mt-0.5">
              {summary.passRate}%
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Passed
            </span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>{summary.passed}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Discrepancies
            </span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span>{summary.warned}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Failed
            </span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              <span>{summary.failed}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Avg Variance
            </span>
            <div className="text-lg font-bold text-on-surface font-mono mt-0.5">
              {summary.averageDeltaYears.toFixed(2)} yrs
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
