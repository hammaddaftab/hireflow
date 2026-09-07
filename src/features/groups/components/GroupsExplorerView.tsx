"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Network, Inbox, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GroupsCanvas } from "./GroupsCanvas";
import { INITIAL_GROUPS, INITIAL_EDGES } from "../mockGroupsData";
import type {
  GroupNode,
  GroupEdge,
  CandidateMemberSummary,
  PersistedGroupWithMembers,
} from "../types";
import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";

export interface GroupsExplorerViewProps {
  activeJob?: Job | null;
  candidates?: ParsedCandidateProfile[];
  persistedGroups?: PersistedGroupWithMembers[];
}

// Merges baseline topology with persisted PostgreSQL groups and real candidate metadata
export function buildCanvasTopology(
  baseNodes: GroupNode[],
  baseEdges: GroupEdge[],
  persistedGroups: PersistedGroupWithMembers[] = [],
  candidates: ParsedCandidateProfile[] = []
): { nodes: GroupNode[]; edges: GroupEdge[] } {
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const rootMemberSummaries: CandidateMemberSummary[] = candidates.map((c) => {
    const verifiedYears = c?.work_history?.entries?.length || 3;
    return {
      id: c.id,
      name: c.identity.name,
      role: c.work_history?.entries?.[0]?.title || "Full Stack Engineer",
      verifiedYears,
      matchScore: 90,
      status: "knockout_passed",
      highlights: c.skills_demonstrated?.skills?.slice(0, 2).map((s) => s.skill) || ["Ingested"],
    };
  });

  const rootBase = baseNodes.find((n) => n.id === "node-root") || baseNodes[0];
  const rootNode: GroupNode = {
    ...rootBase,
    id: "node-root",
    candidateCount: rootMemberSummaries.length,
    candidates: rootMemberSummaries,
    childrenIds: [],
    x: 572,
    y: 90,
    width: 56,
    height: 56,
  };

  if (persistedGroups.length === 0) {
    return { nodes: [rootNode], edges: [] };
  }

  // Layout node structure for recursive hierarchical tree placement
  interface LayoutItem {
    id: string;
    isRoot: boolean;
    pg?: PersistedGroupWithMembers;
    children: LayoutItem[];
    subtreeWidth: number;
    x: number;
    y: number;
  }

  const rootItem: LayoutItem = {
    id: "node-root",
    isRoot: true,
    children: [],
    subtreeWidth: 0,
    x: 572,
    y: 90,
  };

  const itemMap = new Map<string, LayoutItem>();
  itemMap.set("node-root", rootItem);

  // Deterministic order: oldest groups first so layouts are consistent
  const sortedGroups = [...persistedGroups].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.name.localeCompare(b.name);
  });

  for (const pg of sortedGroups) {
    if (pg.id === "node-root") continue;
    itemMap.set(pg.id, {
      id: pg.id,
      isRoot: false,
      pg,
      children: [],
      subtreeWidth: 0,
      x: 0,
      y: 0,
    });
  }

  // Link parent-child hierarchy regardless of input array ordering
  for (const pg of sortedGroups) {
    if (pg.id === "node-root") continue;
    const item = itemMap.get(pg.id);
    if (!item) continue;

    const parentItem =
      pg.parentId && itemMap.has(pg.parentId) && pg.parentId !== pg.id
        ? itemMap.get(pg.parentId)!
        : rootItem;

    parentItem.children.push(item);
  }

  const NODE_SIZE = 56;
  const MIN_SLOT_WIDTH = 260;
  const LEVEL_HEIGHT = 210;
  const ROOT_CENTER_X = 600;
  const ROOT_Y = 90;

  // Bottom-up traversal: calculate horizontal bounding width of each subtree
  function computeSubtreeWidth(item: LayoutItem): number {
    if (item.children.length === 0) {
      item.subtreeWidth = MIN_SLOT_WIDTH;
      return MIN_SLOT_WIDTH;
    }
    const childrenTotal = item.children.reduce((sum, c) => sum + computeSubtreeWidth(c), 0);
    item.subtreeWidth = Math.max(MIN_SLOT_WIDTH, childrenTotal);
    return item.subtreeWidth;
  }

  computeSubtreeWidth(rootItem);

  // Top-down traversal: position each node centered above its allocated child slots
  function layoutItem(item: LayoutItem, centerX: number, y: number) {
    item.x = Math.round(centerX - NODE_SIZE / 2);
    item.y = Math.round(y);

    if (item.children.length === 0) return;

    const totalChildrenWidth = item.children.reduce((sum, c) => sum + c.subtreeWidth, 0);
    let childStartX = centerX - totalChildrenWidth / 2;

    for (const child of item.children) {
      const childCenterX = childStartX + child.subtreeWidth / 2;
      layoutItem(child, childCenterX, y + LEVEL_HEIGHT);
      childStartX += child.subtreeWidth;
    }
  }

  rootItem.x = Math.round(ROOT_CENTER_X - NODE_SIZE / 2);
  rootItem.y = ROOT_Y;

  if (rootItem.children.length > 0) {
    const totalTopLevelWidth = rootItem.children.reduce((sum, c) => sum + c.subtreeWidth, 0);
    let topStartX = ROOT_CENTER_X - totalTopLevelWidth / 2;

    for (const child of rootItem.children) {
      const childCenterX = topStartX + child.subtreeWidth / 2;
      layoutItem(child, childCenterX, ROOT_Y + LEVEL_HEIGHT);
      topStartX += child.subtreeWidth;
    }
  }

  const nodes: GroupNode[] = [];
  const edges: GroupEdge[] = [];

  rootNode.x = rootItem.x;
  rootNode.y = rootItem.y;
  rootNode.childrenIds = rootItem.children.map((c) => c.id);
  nodes.push(rootNode);

  for (const child of rootItem.children) {
    edges.push({
      id: `edge-${rootNode.id}-${child.id}`,
      sourceId: rootNode.id,
      targetId: child.id,
    });
  }

  for (const pg of sortedGroups) {
    if (pg.id === "node-root") continue;
    const layout = itemMap.get(pg.id);
    if (!layout) continue;

    const memberSummaries: CandidateMemberSummary[] = pg.candidateIds.map((cid) => {
      const c = candidateMap.get(cid);
      const verifiedYears = c?.work_history?.entries?.length || 3;
      return {
        id: cid,
        name: c?.identity.name || cid,
        role: c?.work_history?.entries?.[0]?.title || "Full Stack Engineer",
        verifiedYears,
        matchScore: 88,
        status: "knockout_passed",
        highlights: c?.skills_demonstrated?.skills?.slice(0, 2).map((s) => s.skill) || ["Member"],
      };
    });

    const isSubgroup = Boolean(pg.parentId && itemMap.has(pg.parentId) && pg.parentId !== "node-root");

    const newNode: GroupNode = {
      id: pg.id,
      title: pg.name,
      subtitle: isSubgroup ? "Custom Subgroup" : "Persisted Group",
      description: pg.description || `Persisted group containing ${memberSummaries.length} candidate(s).`,
      badge: isSubgroup ? "Subgroup" : "Saved Group",
      status: "active",
      parentId: isSubgroup ? pg.parentId : "node-root",
      childrenIds: layout.children.map((c) => c.id),
      x: layout.x,
      y: layout.y,
      width: NODE_SIZE,
      height: NODE_SIZE,
      candidateCount: memberSummaries.length,
      criteriaDescription: "Saved from Candidate Review decisions",
      candidates: memberSummaries,
    };

    nodes.push(newNode);

    for (const child of layout.children) {
      edges.push({
        id: `edge-${pg.id}-${child.id}`,
        sourceId: pg.id,
        targetId: child.id,
      });
    }
  }

  return { nodes, edges };
}

export function GroupsExplorerView({
  activeJob = null,
  candidates = [],
  persistedGroups = [],
}: GroupsExplorerViewProps) {
  const { nodes, edges } = useMemo(() => {
    return buildCanvasTopology(INITIAL_GROUPS, INITIAL_EDGES, persistedGroups, candidates);
  }, [persistedGroups, candidates]);

  const totalCandidates = nodes[0]?.candidateCount || candidates.length || 6;
  const totalGroups = nodes.length;

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
                {activeJob ? `Job: ${activeJob.title} · ` : ""}
                Interactive node hierarchy with persistent PostgreSQL groups & dealbreaker branches
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
        initialNodes={nodes}
        initialEdges={edges}
        activeJobId={activeJob?.id || null}
      />
    </div>
  );
}
