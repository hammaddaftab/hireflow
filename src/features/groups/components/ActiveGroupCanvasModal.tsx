"use client";

import React, { useMemo, useCallback } from "react";
import { X, Network } from "lucide-react";
import { GroupsCanvas } from "./GroupsCanvas";
import { buildCanvasTopology } from "./GroupsExplorerView";
import { INITIAL_GROUPS, INITIAL_EDGES } from "../mockGroupsData";
import type { PersistedGroupWithMembers } from "../types";
import type { ParsedCandidateProfile } from "@/entities/candidate";

export interface ActiveGroupCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGroupId: string | null;
  onActivateGroup: (groupId: string) => void;
  candidates: ParsedCandidateProfile[];
  persistedGroups: PersistedGroupWithMembers[];
  activeJobId?: string | null;
}

export function ActiveGroupCanvasModal({
  isOpen,
  onClose,
  activeGroupId,
  onActivateGroup,
  candidates,
  persistedGroups,
  activeJobId = null,
}: ActiveGroupCanvasModalProps) {
  const { nodes, edges } = useMemo(() => {
    return buildCanvasTopology(
      INITIAL_GROUPS,
      INITIAL_EDGES,
      persistedGroups,
      candidates
    );
  }, [persistedGroups, candidates]);

  const activeGroupInfo = useMemo(() => {
    if (!activeGroupId || activeGroupId === "grp_all") {
      return {
        name: "All Applicants (Default)",
        count: candidates.length,
      };
    }
    const found = persistedGroups.find((g) => g.id === activeGroupId);
    return {
      name: found?.name || "Active Group",
      count: found?.candidateIds?.length || 0,
    };
  }, [activeGroupId, persistedGroups, candidates.length]);

  const handleActivate = useCallback(
    (groupId: string) => {
      onActivateGroup(groupId);
      onClose();
    },
    [onActivateGroup, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Candidate Groups Topology Picker"
    >
      <div className="relative w-full h-[94vh] max-w-[1550px] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/90 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white shrink-0">
              <Network className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Candidate Groups Topology
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-primary/20 text-primary border border-primary/30">
                  Active: {activeGroupInfo.name} ({activeGroupInfo.count})
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Focus any group node and press Enter to activate
              </span>
            </div>
          </div>

          {/* Quick instructions bar */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Arrows</kbd> Nav
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Enter</kbd> Activate
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Space</kbd> Center
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Esc</kbd> Close
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-neutral-700/50"
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Canvas Field */}
        <div className="flex-1 w-full relative overflow-hidden bg-black">
          <GroupsCanvas
            initialNodes={nodes}
            initialEdges={edges}
            activeJobId={activeJobId}
            activeGroupId={activeGroupId}
            onActivateGroup={handleActivate}
            onClose={onClose}
            className="relative w-full h-full border-0 rounded-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
