"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  X,
  Crosshair,
  ExternalLink,
  Plus,
  GitBranch,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { GroupNode } from "../types";

export interface GroupDetailsDrawerProps {
  node: GroupNode;
  allNodes: GroupNode[];
  onClose: () => void;
  onCenterNode: () => void;
  onSelectNode: (node: GroupNode) => void;
  onAddSubgroup?: (parentNodeId: string) => void;
  onActivateGroup?: (groupId: string) => void;
  isActive?: boolean;
}

export function GroupDetailsDrawer({
  node,
  allNodes,
  onClose,
  onCenterNode,
  onSelectNode,
  onAddSubgroup,
  onActivateGroup,
  isActive = false,
}: GroupDetailsDrawerProps) {
  const childrenNodes = node.childrenIds
    .map((cid) => allNodes.find((n) => n.id === cid))
    .filter((n): n is GroupNode => Boolean(n));

  const parentNode = node.parentId
    ? allNodes.find((n) => n.id === node.parentId)
    : null;

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        opacity: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
      }}
      aria-label={`Group Details: ${node.title}`}
      className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 flex flex-col bg-neutral-50/98 dark:bg-[#0c0c0c]/98 backdrop-blur-xl border-l border-neutral-200 dark:border-neutral-800 shadow-2xl h-full overflow-hidden select-none z-30 font-sans"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-3 shrink-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-neutral-900 dark:bg-white"}`} />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {node.title}
            </h2>
            {isActive && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">
            {node.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onCenterNode}
            title="Center viewport on this node"
            className="h-7 w-7 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close inspector"
            className="h-7 w-7 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Description & Criteria */}
        <div className="space-y-1.5 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Screening Criteria
          </div>
          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
            {node.criteriaDescription}
          </p>
        </div>

        {/* Hierarchy Relations */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Branch Topology</span>
            <GitBranch className="h-3 w-3 text-neutral-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {parentNode && (
              <div className="bg-neutral-100 dark:bg-neutral-900/60 rounded-lg p-2 border border-neutral-200 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400">Parent</div>
                <button
                  type="button"
                  onClick={() => onSelectNode(parentNode)}
                  className="font-bold text-neutral-900 dark:text-white truncate hover:underline text-left block w-full mt-0.5"
                >
                  {parentNode.title}
                </button>
              </div>
            )}

            <div className="bg-neutral-100 dark:bg-neutral-900/60 rounded-lg p-2 border border-neutral-200 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-400">Subgroups</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">
                {childrenNodes.length} Branches
              </div>
            </div>
          </div>

          {childrenNodes.length > 0 && (
            <div className="space-y-1 pt-1">
              {childrenNodes.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onSelectNode(child)}
                  className="w-full text-left flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                      {child.title}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      {child.candidateCount} Candidates
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                    {child.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Members in this Group */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Candidates ({node.candidates.length})
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Total {node.candidateCount}
            </span>
          </div>

          {node.candidates.length === 0 ? (
            <div className="text-xs text-neutral-400 italic p-3 text-center bg-neutral-100 dark:bg-neutral-900/40 rounded-lg border border-neutral-200 dark:border-neutral-800/60">
              No candidates assigned directly to this node.
            </div>
          ) : (
            <div className="space-y-2">
              {node.candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {cand.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {cand.role}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                      {cand.matchScore}%
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <span>{cand.verifiedYears}y verified exp</span>
                  </div>

                  {cand.highlights.length > 0 && (
                    <div className="space-y-0.5 pt-1 border-t border-neutral-200 dark:border-neutral-800/80">
                      {cand.highlights.map((hl, hIdx) => (
                        <div
                          key={hIdx}
                          className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5"
                        >
                          <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600 shrink-0" />
                          <span className="truncate">{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Quick Actions */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0c0c0c] shrink-0 space-y-2">
        {onActivateGroup ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onActivateGroup(node.id === "node-root" ? "grp_all" : node.id)}
            className="w-full text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-on-primary shadow-xs cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{isActive ? "Currently Active Group" : "Activate This Group (Enter)"}</span>
          </Button>
        ) : (
          <Link
            href={node.id === "node-root" ? "/review" : `/review?group=${node.id}`}
            className="block w-full"
          >
            <Button variant="primary" size="sm" className="w-full text-xs font-bold gap-1.5 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in Review Queue</span>
            </Button>
          </Link>
        )}

        {onAddSubgroup && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddSubgroup(node.id)}
            className="w-full text-xs font-bold gap-1.5 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Subgroup</span>
          </Button>
        )}

        {/* Keyboard navigation hints */}
        <div className="pt-1 text-[10px] text-neutral-400 flex items-center justify-between font-mono">
          <span>Arrows: Nav</span>
          {onActivateGroup ? <span>Enter: Activate</span> : <span>Space: Center</span>}
          <span>0: Fit</span>
        </div>
      </div>
    </motion.aside>
  );
}
