"use client";

import React from "react";
import Link from "next/link";
import { Network, Inbox, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GroupsCanvas } from "./GroupsCanvas";
import { INITIAL_GROUPS, INITIAL_EDGES } from "../mockGroupsData";

export function GroupsExplorerView() {
  const totalCandidates = INITIAL_GROUPS[0]?.candidateCount || 6;
  const totalGroups = INITIAL_GROUPS.length;

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                Candidate Groups & Topology
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                Minimalist node hierarchy with dealbreaker branches and auto-tracking viewport
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-800">
              {totalGroups} Groups
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-800">
              {totalCandidates} Candidates
            </span>
          </div>

          <Link href="/review">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5 border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <Inbox className="h-3.5 w-3.5" />
              <span>Review Queue</span>
            </Button>
          </Link>
          <Link href="/jobs/new">
            <Button variant="primary" size="sm" className="text-xs font-bold gap-1.5 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
              <FilePlus className="h-3.5 w-3.5" />
              <span>Create Requirement</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Pannable / Navigable Canvas */}
      <GroupsCanvas
        initialNodes={INITIAL_GROUPS}
        initialEdges={INITIAL_EDGES}
      />
    </div>
  );
}
