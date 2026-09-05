"use client";

import React from "react";
import {
  calculateQuadraticBezierPoint,
  DEFAULT_RING_TRACK_POINTS,
} from "../utils/arcGeometry";

export interface CircularRingTrackProps {
  activeIndex: number;
  totalCandidates: number;
}

export function CircularRingTrack({ activeIndex, totalCandidates }: CircularRingTrackProps) {
  // Generate candidate position pips along the circular arc
  // Center is at 0 degrees, left is negative angle, right is positive angle
  const maxPips = Math.min(totalCandidates, 9);
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -translate-y-4 sm:-translate-y-6 z-0 select-none opacity-80"
      aria-hidden="true"
    >
      <svg
        className="w-[1400px] h-[700px] max-w-none"
        viewBox="0 0 1400 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ringTrackFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="20%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.75" />
            <stop offset="80%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="ringGlowFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient Top Glow Apex beneath active center card */}
        <ellipse
          cx="700"
          cy="280"
          rx="380"
          ry="120"
          fill="url(#ringGlowFade)"
        />

        {/* Primary Circumference Arc Line */}
        <path
          d="M 120 480 Q 700 230 1280 480"
          stroke="url(#ringTrackFade)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          className="text-outline-variant/60 dark:text-outline-variant/40"
        />

        {/* Outer subtle concentric guide */}
        <path
          d="M 180 505 Q 700 270 1220 505"
          stroke="url(#ringTrackFade)"
          strokeWidth="1"
          strokeDasharray="2 8"
          className="text-outline-variant/30 dark:text-outline-variant/20"
        />

        {/* Candidate Arc Pips */}
        {Array.from({ length: maxPips }).map((_, idx) => {
          // Spread pips evenly across the arc curve from -32 degrees to +32 degrees
          const t = maxPips === 1 ? 0.5 : idx / (maxPips - 1);
          const point = calculateQuadraticBezierPoint(
            t,
            DEFAULT_RING_TRACK_POINTS.p0,
            DEFAULT_RING_TRACK_POINTS.p1,
            DEFAULT_RING_TRACK_POINTS.p2
          );
          const px = point.x;
          const py = point.y;
          const isCurrent = idx === activeIndex;

          return (
            <g key={idx} className="transition-all duration-300">
              {isCurrent ? (
                <>
                  <circle
                    cx={px}
                    cy={py}
                    r="8"
                    className="fill-primary/20 animate-ping opacity-60"
                  />
                  <circle
                    cx={px}
                    cy={py}
                    r="5"
                    className="fill-primary stroke-background"
                    strokeWidth="2"
                  />
                </>
              ) : (
                <circle
                  cx={px}
                  cy={py}
                  r="3.5"
                  className="fill-surface-container-highest stroke-outline-variant/40"
                  strokeWidth="1"
                />
              )}
            </g>
          );
        })}

        {/* Tangent Tick Marks at Left and Right Hint Gateways */}
        <line
          x1="220"
          y1="420"
          x2="235"
          y2="450"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-outline-variant/50"
        />
        <line
          x1="1180"
          y1="420"
          x2="1165"
          y2="450"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-outline-variant/50"
        />
      </svg>
    </div>
  );
}
