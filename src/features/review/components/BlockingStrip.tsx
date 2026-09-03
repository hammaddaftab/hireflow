"use client";

import React from "react";
import { CheckCircle2, AlertCircle, XCircle, MinusCircle, FileWarning } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { BlockingRequirementItem } from "../types";
import { EvidenceStatus } from "@/features/extraction/shared/evidenceStatus";

export interface BlockingStripProps {
  items: BlockingRequirementItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

export function BlockingStrip({ items, selectedItemId, onSelectItem }: BlockingStripProps) {
  const getStatusConfig = (status: EvidenceStatus) => {
    switch (status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          style: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
          label: "Confirmed",
        };
      case "ambiguous":
        return {
          icon: AlertCircle,
          style: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30",
          label: "Ambiguous",
        };
      case "contradicted":
        return {
          icon: XCircle,
          style: "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30",
          label: "Contradicted",
        };
      case "not_stated":
        return {
          icon: MinusCircle,
          style: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20",
          label: "Not Stated",
        };
      case "unparseable":
      default:
        return {
          icon: FileWarning,
          style: "text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/30",
          label: "Unparseable",
        };
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
        Blocking Strip:
      </span>
      <div className="flex items-center gap-1.5 p-1 rounded-md bg-surface-container border border-outline-variant">
        {items.map((item, index) => {
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          const isSelected = selectedItemId === item.id;

          return (
            <Tooltip
              key={item.id}
              content={
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-on-surface">{item.label}</div>
                  <div className="text-on-surface-variant">
                    Status: <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="text-on-surface-variant/80 text-[11px]">
                    Click or press {index + 1} to inspect Layer 2 evidence
                  </div>
                </div>
              }
            >
              <button
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`flex items-center justify-center h-8 w-8 rounded border transition-colors cursor-pointer focus:outline-none ${
                  config.style
                } ${
                  isSelected
                    ? "ring-2 ring-primary border-primary shadow-xs"
                    : "hover:border-outline"
                }`}
                aria-label={`${item.label} - Status: ${config.label}`}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{item.label} ({config.label})</span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
