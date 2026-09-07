"use client";

import React from "react";
import type { ExperienceEvalResult } from "../types";
import { Clock, Cpu, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export interface ComparisonHeroProps {
  result: ExperienceEvalResult;
}

export function ComparisonHero({ result }: ComparisonHeroProps) {
  const { summary, status, durationMs, model } = result;

  const getStatusBadge = () => {
    switch (status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Passed Tolerance</span>
          </span>
        );
      case "warn":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Discrepancy Detected</span>
          </span>
        );
      case "fail":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            <span>Failed Tolerance</span>
          </span>
        );
    }
  };

  const deltaFormatted =
    summary.deltaVerifiedYears > 0
      ? `+${summary.deltaVerifiedYears} yrs`
      : `${summary.deltaVerifiedYears} yrs`;

  return (
    <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/40 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-on-surface-variant/40">•</span>
          <span className="font-mono">{result.fixtureTitle}</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{(durationMs / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" />
            <span className="font-mono">{model}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Expected Years */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Expected Ground Truth
          </span>
          <div className="text-2xl font-bold text-on-surface font-mono">
            {summary.expectedTotalYears.toFixed(1)}{" "}
            <span className="text-xs font-normal text-on-surface-variant">yrs</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Full-time expectation: {summary.expectedFullTimeYears.toFixed(1)} yrs
          </p>
        </div>

        {/* Metric 2: Extracted Verified Experience */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Verified Full-Time (AI)
          </span>
          <div className="text-2xl font-bold text-primary font-mono">
            {summary.extractedVerifiedYears.toFixed(1)}{" "}
            <span className="text-xs font-normal text-on-surface-variant">yrs</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Across {summary.fullTimeRolesCount} full-time role(s)
          </p>
        </div>

        {/* Metric 3: Total Raw Stated (All Roles) */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            All Occupancies (Total)
          </span>
          <div className="text-2xl font-bold text-on-surface font-mono">
            {summary.extractedTotalRawYears.toFixed(1)}{" "}
            <span className="text-xs font-normal text-on-surface-variant">yrs</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Across all {summary.rolesFound} extracted role(s)
          </p>
        </div>

        {/* Metric 4: Delta / Accuracy */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Variance (Delta)
          </span>
          <div
            className={`text-2xl font-bold font-mono ${
              summary.deltaVerifiedYears === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : Math.abs(summary.deltaVerifiedYears) <= 0.2
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {deltaFormatted}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Calendar tenure: {summary.calendarDeduplicatedYears.toFixed(1)} yrs
          </p>
        </div>
      </div>
    </div>
  );
}
