"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SharedEvalInput, EvalRunOutput } from "../storage/evalStore";
import { NewInputModal } from "./NewInputModal";

export interface SharedInputListProps {
  inputs: SharedEvalInput[];
  selectedInputId: string;
  onSelectInput: (input: SharedEvalInput) => void;
  onSaveInput: (input: { name: string; resumeText: string; description?: string }) => Promise<void>;
  onDeleteInput: (id: string) => Promise<void>;
  latestRunsMap: Record<string, Record<string, EvalRunOutput>>;
  activeAspect: "experience" | "education" | "identity";
  isLoading?: boolean;
}

export function SharedInputList({
  inputs,
  selectedInputId,
  onSelectInput,
  onSaveInput,
  onDeleteInput,
  latestRunsMap,
  activeAspect,
  isLoading,
}: SharedInputListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredInputs = inputs.filter((inp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inp.name.toLowerCase().includes(q) ||
      (inp.description && inp.description.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (inputId: string) => {
    const runsForInput = latestRunsMap[inputId];
    const aspectRun = runsForInput ? runsForInput[activeAspect] : null;

    if (!aspectRun) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-medium">
          Not Run
        </span>
      );
    }

    if (activeAspect === "experience") {
      switch (aspectRun.status) {
        case "pass":
          return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
              <CheckCircle2 className="h-2.5 w-2.5" />
              <span>Passed</span>
            </span>
          );
        case "warn":
          return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20">
              <AlertTriangle className="h-2.5 w-2.5" />
              <span>Discrepancy</span>
            </span>
          );
        case "fail":
        default:
          return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/20">
              <XCircle className="h-2.5 w-2.5" />
              <span>Failed</span>
            </span>
          );
      }
    }

    // Education aspect
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
        <Clock className="h-2.5 w-2.5" />
        <span>Saved Output</span>
      </span>
    );
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header & Actions */}
      <div className="p-3.5 border-b border-outline-variant/40 bg-surface-container-low/50 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Input Collection
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {inputs.length} named profile{inputs.length === 1 ? "" : "s"} (shared)
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="h-7 px-2.5 text-xs font-semibold gap-1 bg-surface"
          >
            <Plus className="h-3 w-3" />
            <span>Add Input</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-surface border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Input Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 p-2 space-y-1">
        {isLoading && inputs.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant font-mono">
            Loading collection...
          </div>
        ) : filteredInputs.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant">
            No inputs match &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredInputs.map((input) => {
            const isSelected = input.id === selectedInputId;

            return (
              <div
                key={input.id}
                onClick={() => onSelectInput(input)}
                className={`p-3 rounded-xl transition-all cursor-pointer text-xs space-y-1.5 border group relative ${
                  isSelected
                    ? "bg-primary/5 border-primary/40 shadow-2xs"
                    : "bg-surface border-transparent hover:bg-surface-container-low/70 hover:border-outline-variant/30"
                }`}
              >
                {/* Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-on-surface text-[13px] leading-tight flex-1">
                    {input.name}
                  </span>
                  <div className="shrink-0">{getStatusBadge(input.id)}</div>
                </div>

                {/* Description snippet */}
                {input.description && (
                  <p className="text-[11px] text-on-surface-variant line-clamp-1">
                    {input.description}
                  </p>
                )}

                {/* Footer Meta & Actions */}
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant/70 pt-0.5">
                  <span className="font-mono">
                    {input.resumeText.length} chars
                  </span>

                  {!input.isDefault && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${input.name}" from collection?`)) {
                          onDeleteInput(input.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-rose-600 transition-opacity cursor-pointer"
                      title="Delete input"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Authoring Modal */}
      <NewInputModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveInput}
      />
    </div>
  );
}
