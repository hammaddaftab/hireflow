"use client";

import React from "react";
import { motion } from "motion/react";
import type { GroupNode, GroupEdge, ViewportState } from "../types";

export interface MinimapRadarProps {
  nodes: GroupNode[];
  edges: GroupEdge[];
  viewport: ViewportState;
  selectedNodeId: string;
  containerDimensions: { width: number; height: number };
  onNavigateToWorldPoint: (worldX: number, worldY: number) => void;
  isDragging?: boolean;
}

export function MinimapRadar({
  nodes,
  edges,
  viewport,
  selectedNodeId,
  containerDimensions,
  onNavigateToWorldPoint,
  isDragging = false,
}: MinimapRadarProps) {
  const mapWidth = 200;
  const mapHeight = 130;
  const padding = 40;

  // Compute bounding box of all nodes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x + n.width);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y + n.height);
  });

  const worldWidth = Math.max(maxX - minX + padding * 2, 1200);
  const worldHeight = Math.max(maxY - minY + padding * 2, 800);
  const originX = minX - padding;
  const originY = minY - padding;

  const scaleX = mapWidth / worldWidth;
  const scaleY = mapHeight / worldHeight;
  const miniScale = Math.min(scaleX, scaleY);

  // Convert world coords to minimap coords
  const toMapX = (wx: number) => (wx - originX) * miniScale;
  const toMapY = (wy: number) => (wy - originY) * miniScale;

  // Compute viewport rectangle in minimap coords
  const viewWorldLeft = -viewport.x / viewport.scale;
  const viewWorldTop = -viewport.y / viewport.scale;
  const viewWorldWidth = containerDimensions.width / viewport.scale;
  const viewWorldHeight = containerDimensions.height / viewport.scale;

  const vpBoxX = Math.max(toMapX(viewWorldLeft), 0);
  const vpBoxY = Math.max(toMapY(viewWorldTop), 0);
  const vpBoxW = Math.min(viewWorldWidth * miniScale, mapWidth);
  const vpBoxH = Math.min(viewWorldHeight * miniScale, mapHeight);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickMiniX = e.clientX - rect.left;
    const clickMiniY = e.clientY - rect.top;

    // Convert back to world coordinates
    const targetWorldX = clickMiniX / miniScale + originX;
    const targetWorldY = clickMiniY / miniScale + originY;

    onNavigateToWorldPoint(targetWorldX, targetWorldY);
  };

  return (
    <div className="bg-neutral-100/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 rounded-xl p-2 shadow-xl select-none flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Radar
        </span>
        <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">
          {nodes.length} Nodes
        </span>
      </div>

      <svg
        width={mapWidth}
        height={mapHeight}
        onClick={handleClick}
        className="bg-neutral-200/40 dark:bg-black/60 rounded-lg cursor-crosshair overflow-hidden border border-neutral-300 dark:border-neutral-800/80"
      >
        {/* Render edges */}
        {edges.map((edge) => {
          const s = nodes.find((n) => n.id === edge.sourceId);
          const t = nodes.find((n) => n.id === edge.targetId);
          if (!s || !t) return null;
          return (
            <line
              key={edge.id}
              x1={toMapX(s.x + s.width / 2)}
              y1={toMapY(s.y + s.height / 2)}
              x2={toMapX(t.x + t.width / 2)}
              y2={toMapY(t.y + t.height / 2)}
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-neutral-300 dark:text-neutral-800"
            />
          );
        })}

        {/* Render circular nodes */}
        {nodes.map((node) => {
          const cx = toMapX(node.x + node.width / 2);
          const cy = toMapY(node.y + node.height / 2);
          const isSelected = node.id === selectedNodeId;

          return (
            <circle
              key={node.id}
              cx={cx}
              cy={cy}
              r={isSelected ? 4.5 : 3}
              className={
                isSelected
                  ? "fill-neutral-950 dark:fill-white stroke-neutral-500 dark:stroke-neutral-300 stroke-1"
                  : "fill-neutral-400 dark:fill-neutral-700"
              }
            />
          );
        })}

        {/* Viewport indicator box with spring physics */}
        <motion.rect
          animate={{
            x: vpBoxX,
            y: vpBoxY,
            width: vpBoxW,
            height: vpBoxH,
          }}
          transition={
            isDragging
              ? { duration: 0 }
              : { type: "spring", stiffness: 350, damping: 30 }
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-neutral-700 dark:text-neutral-300"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
}
