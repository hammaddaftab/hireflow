"use client";

import React from "react";
import type { EvidentiaryDotType } from "../../evaluators/evaluationStatuses";

export type { EvidentiaryDotType };

export function EvidentiaryDot({ type }: { type: EvidentiaryDotType }) {
  switch (type) {
    case "confirmed":
      return (
        <span
          className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 inline-block"
          aria-hidden="true"
        />
      );
    case "gap":
      return (
        <span
          className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0 inline-block"
          aria-hidden="true"
        />
      );
    case "contradicted":
      return (
        <span
          className="w-2 h-2 rounded-full border-[1.5px] border-rose-600 dark:border-rose-400 bg-transparent shrink-0 inline-block"
          aria-hidden="true"
        />
      );
    case "not_stated":
    default:
      return (
        <span
          className="w-2 h-2 rounded-full border-[1.5px] border-dashed border-slate-400 dark:border-slate-500 bg-transparent shrink-0 inline-block"
          aria-hidden="true"
        />
      );
  }
}

