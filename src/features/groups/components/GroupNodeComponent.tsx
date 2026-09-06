"use client";

import React from "react";
import { motion } from "motion/react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { GroupNode } from "../types";

export const NODE_SIZE = 56; // Exact circular diameter in px

export interface GroupNodeComponentProps {
  node: GroupNode;
  isSelected: boolean;
  isAncestor: boolean;
  onSelect: (node: GroupNode) => void;
}

export function GroupNodeComponent({
  node,
  isSelected,
  isAncestor,
  onSelect,
}: GroupNodeComponentProps) {
  return (
    <div
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Group ${node.title} with ${node.candidateCount} candidates`}
      aria-selected={isSelected}
      className="absolute flex flex-col items-center select-none cursor-pointer group will-change-transform"
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        width: NODE_SIZE,
        height: NODE_SIZE,
      }}
    >
      {/* Monochrome Geometric Circle with GNOME spring hover/tap physics */}
      <Tooltip
        content={`${node.title} · ${node.candidateCount} Candidates`}
        side="top"
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isSelected ? 1.1 : isAncestor ? 1.04 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 28,
          }}
          className={`w-[56px] h-[56px] min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] aspect-square rounded-full flex items-center justify-center font-bold relative shrink-0 transition-colors duration-150 ${
            isSelected
              ? "bg-neutral-950 text-white dark:bg-white dark:text-black border-2 border-neutral-950 dark:border-white ring-4 ring-neutral-500/20 dark:ring-white/20 shadow-xl z-20"
              : isAncestor
              ? "bg-neutral-200 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-2 border-neutral-400 dark:border-neutral-600 ring-2 ring-neutral-500/20 z-10"
              : "bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-600 hover:text-neutral-950 dark:hover:text-white shadow-sm z-0"
          }`}
        >
          {/* Candidate count number in center */}
          <span className="text-sm font-mono font-semibold tracking-tight">
            {node.candidateCount}
          </span>
        </motion.div>
      </Tooltip>

      {/* Clean minimal title label below circle */}
      <div
        className={`mt-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-tight whitespace-nowrap pointer-events-none text-center transition-colors duration-150 ${
          isSelected
            ? "text-neutral-950 dark:text-white font-bold bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
            : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800/60"
        }`}
      >
        {node.title}
      </div>
    </div>
  );
}
