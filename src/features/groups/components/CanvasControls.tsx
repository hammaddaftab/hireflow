"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export interface CanvasControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  onCenterSelected: () => void;
  onPan: (dx: number, dy: number) => void;
}

export function CanvasControls({
  scale,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onCenterSelected,
  onPan,
}: CanvasControlsProps) {
  const panStep = 160;

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Directional D-Pad for manual viewport movement */}
      <div className="bg-neutral-100/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 rounded-xl p-1.5 shadow-sm flex items-center gap-1">
        <Tooltip content="Pan Left (Shift + Left)" side="top">
          <button
            type="button"
            onClick={() => onPan(panStep, 0)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
            aria-label="Pan Left"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <div className="flex flex-col gap-1">
          <Tooltip content="Pan Up (Shift + Up)" side="top">
            <button
              type="button"
              onClick={() => onPan(0, panStep)}
              className="h-6 w-6 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
              aria-label="Pan Up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Pan Down (Shift + Down)" side="bottom">
            <button
              type="button"
              onClick={() => onPan(0, -panStep)}
              className="h-6 w-6 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
              aria-label="Pan Down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>

        <Tooltip content="Pan Right (Shift + Right)" side="top">
          <button
            type="button"
            onClick={() => onPan(-panStep, 0)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
            aria-label="Pan Right"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Zoom & Fit Dock */}
      <div className="bg-neutral-100/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 rounded-xl p-1.5 shadow-sm flex items-center gap-1 font-mono">
        <Tooltip content="Zoom Out (-)" side="top">
          <button
            type="button"
            onClick={onZoomOut}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <span className="text-[11px] font-semibold px-2 text-neutral-800 dark:text-neutral-200 min-w-[42px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <Tooltip content="Zoom In (+)" side="top">
          <button
            type="button"
            onClick={onZoomIn}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-800 mx-0.5" />

        <Tooltip content="Center on Selected Node (Space)" side="top">
          <button
            type="button"
            onClick={onCenterSelected}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
            aria-label="Center on Selected Node"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Fit All Nodes into View (0)" side="top">
          <button
            type="button"
            onClick={onFitToView}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-0"
            aria-label="Fit Viewport to Graph"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
