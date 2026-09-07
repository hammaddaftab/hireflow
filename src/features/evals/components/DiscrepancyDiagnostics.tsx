"use client";

import React from "react";
import type { EvalDiagnostic } from "../types";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface DiscrepancyDiagnosticsProps {
  diagnostics: EvalDiagnostic[];
}

export function DiscrepancyDiagnostics({ diagnostics }: DiscrepancyDiagnosticsProps) {
  if (!diagnostics || diagnostics.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2">
        <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>No discrepancies detected. AI extraction matches expected parameters within configured tolerance.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
        Diagnostic Root-Cause Analysis
      </div>

      <div className="space-y-2">
        {diagnostics.map((d, idx) => {
          const isError = d.level === "error";
          const isWarning = d.level === "warning";

          const containerStyle = isError
            ? "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200"
            : isWarning
            ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
            : "bg-surface-container-low border-outline-variant/40 text-on-surface";

          const icon = isError ? (
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : isWarning ? (
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          );

          return (
            <div
              key={`${d.code}-${idx}`}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${containerStyle}`}
            >
              {icon}
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="font-semibold text-[13px]">{d.title}</div>
                <div className="text-on-surface-variant text-xs leading-relaxed">{d.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
