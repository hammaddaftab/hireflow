"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

export interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
  formatValue?: (val: number) => string;
  formatBound?: (val: number) => string;
  label?: string;
  minDistance?: number;
  disabled?: boolean;
  className?: string;
}

// Snaps a raw numeric value to the nearest step increment relative to min
function snapToStep(val: number, min: number, max: number, step: number): number {
  const steps = Math.round((val - min) / step);
  const snapped = min + steps * step;
  return Math.max(min, Math.min(max, snapped));
}

// Truncates floating point calculation artifacts based on step decimal places
function roundToStepDecimals(val: number, step: number): number {
  const stepStr = step.toString();
  const decimals = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
  return Number(val.toFixed(decimals));
}

// Reusable dual-thumb range slider with a draggable active window
export function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  onChangeEnd,
  formatValue = (v) => String(v),
  formatBound,
  label,
  minDistance = 0,
  disabled = false,
  className = "",
}: DualRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDrag, setActiveDrag] = useState<"min" | "max" | "range" | null>(null);

  // Safely clamp incoming values
  const currentMin = Math.max(min, Math.min(value[0], max));
  const currentMax = Math.max(min, Math.max(currentMin, Math.min(value[1], max)));

  // Calculate percentage positions for track rendering
  const totalRange = max - min || 1;
  const minPercent = Math.max(0, Math.min(100, ((currentMin - min) / totalRange) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((currentMax - min) / totalRange) * 100));
  const rangeWidth = Math.max(0, maxPercent - minPercent);

  // References to track drag session state
  const dragSessionRef = useRef<{
    type: "min" | "max" | "range";
    startX: number;
    startValues: [number, number];
    trackLeft: number;
    trackWidth: number;
  } | null>(null);

  // Start dragging handle or active range segment
  const startDrag = useCallback(
    (type: "min" | "max" | "range", clientX: number) => {
      if (disabled) return;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      dragSessionRef.current = {
        type,
        startX: clientX,
        startValues: [currentMin, currentMax],
        trackLeft: rect.left,
        trackWidth: Math.max(1, rect.width),
      };
      setActiveDrag(type);
    },
    [disabled, currentMin, currentMax]
  );

  // Global pointer move and pointer up listeners during active drag
  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session) return;

      const deltaX = e.clientX - session.startX;
      const valPerPx = (max - min) / session.trackWidth;
      const deltaVal = deltaX * valPerPx;

      if (session.type === "range") {
        // Draggable active range window: shifts both bounds proportionally
        const span = session.startValues[1] - session.startValues[0];
        const rawMin = session.startValues[0] + deltaVal;
        const steppedMin = snapToStep(rawMin, min, max, step);

        // Keep the entire span clamped within min and max bounds
        const clampedMin = Math.max(min, Math.min(max - span, steppedMin));
        const clampedMax = clampedMin + span;

        const finalMin = roundToStepDecimals(clampedMin, step);
        const finalMax = roundToStepDecimals(clampedMax, step);

        if (finalMin !== currentMin || finalMax !== currentMax) {
          onChange([finalMin, finalMax]);
        }
      } else if (session.type === "min") {
        // Dragging left thumb: constrained by min and currentMax - minDistance
        const currentPx = e.clientX - session.trackLeft;
        const rawVal = min + (currentPx / session.trackWidth) * (max - min);
        const steppedVal = snapToStep(rawVal, min, max, step);
        const clampedVal = Math.max(min, Math.min(currentMax - minDistance, steppedVal));
        const finalVal = roundToStepDecimals(clampedVal, step);

        if (finalVal !== currentMin) {
          onChange([finalVal, currentMax]);
        }
      } else if (session.type === "max") {
        // Dragging right thumb: constrained by currentMin + minDistance and max
        const currentPx = e.clientX - session.trackLeft;
        const rawVal = min + (currentPx / session.trackWidth) * (max - min);
        const steppedVal = snapToStep(rawVal, min, max, step);
        const clampedVal = Math.max(currentMin + minDistance, Math.min(max, steppedVal));
        const finalVal = roundToStepDecimals(clampedVal, step);

        if (finalVal !== currentMax) {
          onChange([currentMin, finalVal]);
        }
      }
    };

    const handlePointerUp = () => {
      if (dragSessionRef.current) {
        onChangeEnd?.([currentMin, currentMax]);
        dragSessionRef.current = null;
        setActiveDrag(null);
      }
    };

    // Prevent text selection during active dragging
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [
    activeDrag,
    min,
    max,
    step,
    minDistance,
    currentMin,
    currentMax,
    onChange,
    onChangeEnd,
  ]);

  // Click on empty track area snaps closest handle
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || activeDrag) return;
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const clickPx = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickPx / rect.width));
    const rawVal = min + clickRatio * (max - min);
    const steppedVal = snapToStep(rawVal, min, max, step);

    const distToMin = Math.abs(steppedVal - currentMin);
    const distToMax = Math.abs(steppedVal - currentMax);

    if (distToMin <= distToMax) {
      const clampedMin = Math.min(currentMax - minDistance, steppedVal);
      const finalMin = roundToStepDecimals(clampedMin, step);
      onChange([finalMin, currentMax]);
      startDrag("min", e.clientX);
    } else {
      const clampedMax = Math.max(currentMin + minDistance, steppedVal);
      const finalMax = roundToStepDecimals(clampedMax, step);
      onChange([currentMin, finalMax]);
      startDrag("max", e.clientX);
    }
  };

  // Keyboard accessibility for min and max thumbs
  const handleKeyDown = (type: "min" | "max", e: React.KeyboardEvent) => {
    if (disabled) return;
    const isMin = type === "min";
    const current = isMin ? currentMin : currentMax;
    let delta = 0;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      delta = -step;
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      delta = step;
    } else if (e.key === "PageDown") {
      delta = -step * 5;
    } else if (e.key === "PageUp") {
      delta = step * 5;
    } else if (e.key === "Home") {
      delta = isMin ? min - current : currentMin + minDistance - current;
    } else if (e.key === "End") {
      delta = isMin ? currentMax - minDistance - current : max - current;
    } else {
      return;
    }

    e.preventDefault();
    const nextVal = current + delta;

    if (isMin) {
      const clamped = Math.max(min, Math.min(currentMax - minDistance, nextVal));
      const finalVal = roundToStepDecimals(clamped, step);
      onChange([finalVal, currentMax]);
    } else {
      const clamped = Math.max(currentMin + minDistance, Math.min(max, nextVal));
      const finalVal = roundToStepDecimals(clamped, step);
      onChange([currentMin, finalVal]);
    }
  };

  // Keyboard accessibility for active range window
  const handleRangeKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let delta = 0;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      delta = -step;
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      delta = step;
    } else if (e.key === "PageDown") {
      delta = -step * 5;
    } else if (e.key === "PageUp") {
      delta = step * 5;
    } else {
      return;
    }

    e.preventDefault();
    const span = currentMax - currentMin;
    const nextMin = currentMin + delta;
    const clampedMin = Math.max(min, Math.min(max - span, nextMin));
    const clampedMax = clampedMin + span;

    onChange([roundToStepDecimals(clampedMin, step), roundToStepDecimals(clampedMax, step)]);
  };

  const boundMinFormatted = formatBound ? formatBound(min) : formatValue(min);
  const boundMaxFormatted = formatBound ? formatBound(max) : formatValue(max);

  return (
    <div className={`space-y-2 select-none ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}>
      {/* Label and Current Selected Range Display */}
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-on-surface">{label}</span>
          <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full">
            {formatValue(currentMin)} – {formatValue(currentMax)}
          </span>
        </div>
      )}

      {/* Slider Interactive Track Area */}
      <div className="relative py-3">
        {/* Background Track */}
        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          className="relative h-2 w-full rounded-full bg-surface-container-highest cursor-pointer"
        >
          {/* Draggable Active Highlighted Range Bar */}
          <div
            tabIndex={0}
            role="slider"
            aria-label="Selected range window. Use arrow keys to shift range left or right."
            aria-valuenow={currentMin}
            aria-valuemin={min}
            aria-valuemax={max}
            onKeyDown={handleRangeKeyDown}
            onPointerDown={(e) => {
              e.stopPropagation();
              startDrag("range", e.clientX);
            }}
            className={`absolute top-0 bottom-0 rounded-full transition-colors ${
              activeDrag === "range"
                ? "bg-primary shadow-sm ring-2 ring-primary/40 cursor-grabbing"
                : "bg-primary/80 hover:bg-primary cursor-grab"
            }`}
            style={{
              left: `${minPercent}%`,
              width: `${rangeWidth}%`,
            }}
            title="Click and drag to shift range window"
          >
            {/* Structural grip affordance indicating draggable center bar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="h-1 w-3 rounded-full bg-surface/50" />
            </div>
          </div>

          {/* Left Thumb (Min Handle) */}
          <div
            tabIndex={0}
            role="slider"
            aria-label={`${label ? `${label} ` : ""}Minimum`}
            aria-valuemin={min}
            aria-valuemax={currentMax - minDistance}
            aria-valuenow={currentMin}
            aria-valuetext={formatValue(currentMin)}
            onKeyDown={(e) => handleKeyDown("min", e)}
            onPointerDown={(e) => {
              e.stopPropagation();
              startDrag("min", e.clientX);
            }}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-surface border-2 border-primary shadow-sm flex items-center justify-center transition-transform cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-surface ${
              activeDrag === "min" ? "scale-115 ring-2 ring-primary/40 cursor-grabbing" : "hover:scale-110"
            }`}
            style={{ left: `${minPercent}%` }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>

          {/* Right Thumb (Max Handle) */}
          <div
            tabIndex={0}
            role="slider"
            aria-label={`${label ? `${label} ` : ""}Maximum`}
            aria-valuemin={currentMin + minDistance}
            aria-valuemax={max}
            aria-valuenow={currentMax}
            aria-valuetext={formatValue(currentMax)}
            onKeyDown={(e) => handleKeyDown("max", e)}
            onPointerDown={(e) => {
              e.stopPropagation();
              startDrag("max", e.clientX);
            }}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-surface border-2 border-primary shadow-sm flex items-center justify-center transition-transform cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-surface ${
              activeDrag === "max" ? "scale-115 ring-2 ring-primary/40 cursor-grabbing" : "hover:scale-110"
            }`}
            style={{ left: `${maxPercent}%` }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Track Footnote: Outer Bounds & Shift Hint */}
      <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant pt-0.5">
        <span>{boundMinFormatted}</span>
        <span className="text-[9px] text-on-surface-variant/80 font-sans">
          Drag bar to shift
        </span>
        <span>{boundMaxFormatted}</span>
      </div>
    </div>
  );
}
