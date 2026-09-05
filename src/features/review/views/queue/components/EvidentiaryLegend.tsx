"use client";

import { Quote, Tag } from "lucide-react";
import { EvidentiaryDot } from "../../../core/components/card/EvidentiaryDot";

export interface EvidentiaryLegendProps {
  className?: string;
}

export function EvidentiaryLegend({ className = "" }: EvidentiaryLegendProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <EvidentiaryDot type="confirmed" />
        <span>confirmed</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <EvidentiaryDot type="gap" />
        <span>worth a second look</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <EvidentiaryDot type="contradicted" />
        <span>contradicted</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <EvidentiaryDot type="not_stated" />
        <span>not stated</span>
      </span>
      <span className="hidden sm:inline text-outline-variant/60">•</span>
      <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
        <Quote className="h-2.5 w-2.5 text-blue-700 dark:text-blue-400" />
        <span>outcome attached</span>
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
        <Tag className="h-2.5 w-2.5 text-amber-700 dark:text-amber-400" />
        <span>self-reported only</span>
      </span>
    </div>
  );
}
