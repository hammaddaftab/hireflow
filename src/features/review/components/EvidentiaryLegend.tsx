"use client";

import React from "react";
import { EvidentiaryDot } from "./BlockingStrip";

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
    </div>
  );
}
