"use client";

import React from "react";
import type { ExtractedOccupancyAnalysis } from "../types";
import { Check, X } from "lucide-react";

export interface OccupanciesTableProps {
  entries: ExtractedOccupancyAnalysis[];
}

export function OccupanciesTable({ entries }: OccupanciesTableProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant text-center">
        No work history entries extracted.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Extracted Occupancies Breakdown ({entries.length} Roles)
        </span>
        <span className="text-xs text-on-surface-variant">
          {entries.filter((e) => e.includedInVerified).length} included in verified full-time total
        </span>
      </div>

      <div className="rounded-xl border border-outline-variant/50 overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/40 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              <tr>
                <th className="py-2.5 px-3">Role & Employer</th>
                <th className="py-2.5 px-3">Date Range</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Verified Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {entries.map((entry) => {
                const isFullTime = entry.employmentType.value === "full_time";
                const isConfirmed = entry.employmentType.status === "confirmed";

                return (
                  <tr
                    key={entry.entryId}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-medium text-on-surface">{entry.title}</div>
                      <div className="text-on-surface-variant text-[11px]">{entry.employer}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                      {entry.startDate} – {entry.isCurrent ? "Present" : entry.endDate || "N/A"}
                    </td>

                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                      <div className="font-semibold text-on-surface">
                        {entry.durationYears.toFixed(1)} yrs
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        {entry.durationMonths} mos
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-0.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                            isFullTime
                              ? "bg-surface-container-high text-on-surface font-semibold"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          }`}
                        >
                          {entry.employmentType.value.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-on-surface-variant/70">
                          {isConfirmed ? "explicitly stated" : "inferred"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {entry.includedInVerified ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                          <span>Counted</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            <X className="h-3.5 w-3.5" />
                            <span>Excluded</span>
                          </div>
                          {entry.exclusionReason && (
                            <p className="text-[10px] text-on-surface-variant leading-tight max-w-[200px]">
                              {entry.exclusionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
