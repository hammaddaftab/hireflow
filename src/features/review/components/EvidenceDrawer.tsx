"use client";

import React from "react";
import { X, Quote, CheckCircle2, AlertCircle, XCircle, MinusCircle, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BlockingRequirementItem } from "../types";
import { EvidenceStatus } from "@/features/extraction/shared/evidenceStatus";

export interface EvidenceDrawerProps {
  items: BlockingRequirementItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onClose: () => void;
}

export function EvidenceDrawer({
  items,
  selectedItemId,
  onSelectItem,
  onClose,
}: EvidenceDrawerProps) {
  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];
  if (!activeItem) return null;

  const getStatusBadgeVariant = (status: EvidenceStatus) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "ambiguous":
        return "warning";
      case "contradicted":
        return "dealbreaker";
      case "not_stated":
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status: EvidenceStatus) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "ambiguous":
        return <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
      case "contradicted":
        return <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />;
      case "not_stated":
        return <MinusCircle className="h-3.5 w-3.5 text-slate-500" />;
      case "unparseable":
      default:
        return <FileWarning className="h-3.5 w-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-outline-variant space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
            Layer 2 • On-Demand Evidence
          </span>
          <span className="text-xs text-on-surface-variant hidden sm:inline">
            (Ground truth from candidate extraction)
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close evidence panel">
          <X className="h-3.5 w-3.5 mr-1" />
          <span>Close (Esc)</span>
        </Button>
      </div>

      {/* Requirement Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-surface-container-high text-on-surface font-semibold border-outline shadow-2xs"
                  : "bg-surface text-on-surface-variant border-outline-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {getStatusIcon(item.status)}
              <span>{idx + 1}. {item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Requirement Detail Box */}
      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-on-surface">
              {activeItem.label}
            </h4>
            <Badge variant={getStatusBadgeVariant(activeItem.status)}>
              <span className="flex items-center gap-1 capitalize">
                {getStatusIcon(activeItem.status)}
                {activeItem.status}
              </span>
            </Badge>
          </div>
          <span className="text-xs font-mono text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-outline-variant">
            blocking: true
          </span>
        </div>

        {/* Reasoning */}
        <div>
          <div className="text-xs font-medium text-on-surface-variant mb-1">
            Reasoning:
          </div>
          <p className="text-sm text-on-surface leading-relaxed">
            {activeItem.reasoning}
          </p>
        </div>

        {/* Evidence Span */}
        <div>
          <div className="text-xs font-medium text-on-surface-variant mb-1 flex items-center gap-1">
            <Quote className="h-3 w-3 text-on-surface-variant" />
            <span>Verbatim Evidence Span:</span>
          </div>
          {activeItem.evidence_span ? (
            <blockquote className="text-sm italic text-on-surface border-l-2 border-primary pl-3 py-1 bg-surface rounded-r border-t border-r border-b border-outline-variant/60">
              &ldquo;{activeItem.evidence_span}&rdquo;
            </blockquote>
          ) : (
            <div className="text-xs text-on-surface-variant italic bg-surface p-2.5 rounded border border-outline-variant">
              No evidence stated in document (status: {activeItem.status}).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
