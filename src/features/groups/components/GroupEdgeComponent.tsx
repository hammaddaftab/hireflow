"use client";

import React from "react";
import type { GroupNode, GroupEdge } from "../types";

export interface GroupEdgeComponentProps {
  edge: GroupEdge;
  source: GroupNode;
  target: GroupNode;
  isActiveBranch: boolean;
}

export function GroupEdgeComponent({
  edge,
  source,
  target,
  isActiveBranch,
}: GroupEdgeComponentProps) {
  // Source bottom center to Target top center
  const sx = source.x + source.width / 2;
  const sy = source.y + source.height;
  const tx = target.x + target.width / 2;
  const ty = target.y;

  const dy = ty - sy;
  const cp1x = sx;
  const cp1y = sy + dy * 0.5;
  const cp2x = tx;
  const cp2y = ty - dy * 0.5;

  const pathData = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;

  return (
    <g id={edge.id} className="transition-colors duration-150">
      {/* Background shadow path for subtle glow on active */}
      {isActiveBranch && (
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-neutral-400/20 dark:text-white/10"
          strokeLinecap="round"
        />
      )}

      {/* Main minimalist monochrome connector path */}
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth={isActiveBranch ? 2 : 1.5}
        className={
          isActiveBranch
            ? "text-neutral-900 dark:text-neutral-200"
            : "text-neutral-300 dark:text-neutral-800"
        }
        strokeLinecap="round"
      />

      {/* Connection anchor dots */}
      <circle
        cx={sx}
        cy={sy}
        r={isActiveBranch ? 2.5 : 2}
        className={
          isActiveBranch
            ? "fill-neutral-900 dark:fill-neutral-200"
            : "fill-neutral-300 dark:fill-neutral-800"
        }
      />
      <circle
        cx={tx}
        cy={ty}
        r={isActiveBranch ? 2.5 : 2}
        className={
          isActiveBranch
            ? "fill-neutral-900 dark:fill-neutral-200"
            : "fill-neutral-300 dark:fill-neutral-800"
        }
      />
    </g>
  );
}
