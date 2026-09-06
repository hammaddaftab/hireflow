"use client";

import React from "react";
import { ChevronRight, Layers } from "lucide-react";
import type { GroupNode } from "../types";

export interface GroupBreadcrumbProps {
  selectedNode: GroupNode;
  allNodes: GroupNode[];
  onSelectNode: (node: GroupNode) => void;
}

export function GroupBreadcrumb({
  selectedNode,
  allNodes,
  onSelectNode,
}: GroupBreadcrumbProps) {
  // Build path from Root to selectedNode
  const path: GroupNode[] = [];
  let curr: GroupNode | undefined = selectedNode;

  while (curr) {
    path.unshift(curr);
    curr = curr.parentId ? allNodes.find((n) => n.id === curr!.parentId) : undefined;
  }

  return (
    <nav
      aria-label="Group Hierarchy Breadcrumb"
      className="flex items-center gap-1.5 bg-neutral-100/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-1.5 shadow-sm text-xs select-none font-mono"
    >
      <Layers className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400 shrink-0 mr-0.5" />

      {path.map((node, index) => {
        const isLast = index === path.length - 1;

        return (
          <React.Fragment key={node.id}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-neutral-400 dark:text-neutral-600 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => onSelectNode(node)}
              className={`transition-colors truncate max-w-[150px] cursor-pointer border-0 bg-transparent p-0 ${
                isLast
                  ? "text-neutral-950 dark:text-white font-bold cursor-default"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline"
              }`}
              title={node.title}
            >
              {node.title}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
