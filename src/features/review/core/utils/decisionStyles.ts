// Unified style and typography tokens for candidate review decisions

import { useState, useEffect } from "react";
import type { ReviewDecision } from "@/entities/review";
import { Check, Bookmark, X, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DecisionConfig {
  label: string;
  pastLabel: string;
  icon: LucideIcon;
  // Border and accent rail colors
  railColor: string;
  // Subtle tinted surface wash for card background
  surfaceWash: string;
  // Text color classes
  textColor: string;
  // Status strip container background
  stripBg: string;
  // Active action button classes
  activeButtonClass: string;
  // Inactive outline action button classes
  inactiveButtonClass: string;
  // Indicator dot or pill badge color
  indicatorColor: string;
}

export const DECISION_CONFIGS: Record<ReviewDecision, DecisionConfig> = {
  keep: {
    label: "Keep",
    pastLabel: "Kept",
    icon: Check,
    railColor: "border-l-emerald-600 dark:border-l-emerald-500",
    surfaceWash: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
    textColor: "text-emerald-700 dark:text-emerald-300",
    stripBg: "bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20",
    activeButtonClass: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-2xs",
    inactiveButtonClass: "bg-transparent text-on-surface hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 border border-outline-variant hover:border-emerald-500/60 shadow-2xs",
    indicatorColor: "bg-emerald-600 dark:bg-emerald-500",
  },
  flag: {
    label: "Flag",
    pastLabel: "Flagged",
    icon: Bookmark,
    railColor: "border-l-amber-500 dark:border-l-amber-400",
    surfaceWash: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
    textColor: "text-amber-700 dark:text-amber-300",
    stripBg: "bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20",
    activeButtonClass: "bg-amber-500 text-white hover:bg-amber-600 border-amber-500 shadow-2xs",
    inactiveButtonClass: "bg-transparent text-on-surface hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 border border-outline-variant hover:border-amber-500/60 shadow-2xs",
    indicatorColor: "bg-amber-500 dark:bg-amber-400",
  },
  pass: {
    label: "Pass",
    pastLabel: "Passed",
    icon: X,
    railColor: "border-l-rose-600 dark:border-l-rose-500",
    surfaceWash: "bg-rose-500/[0.03] dark:bg-rose-500/[0.08]",
    textColor: "text-rose-700 dark:text-rose-300",
    stripBg: "bg-rose-500/10 dark:bg-rose-950/40 border-b border-rose-500/20",
    activeButtonClass: "bg-rose-600 text-white hover:bg-rose-700 border-rose-600 shadow-2xs",
    inactiveButtonClass: "bg-transparent text-on-surface hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 border border-outline-variant hover:border-rose-500/60 shadow-2xs",
    indicatorColor: "bg-rose-600 dark:bg-rose-500",
  },
  pending: {
    label: "Undecided",
    pastLabel: "Undecided",
    icon: Clock,
    railColor: "border-l-transparent",
    surfaceWash: "",
    textColor: "text-on-surface-variant",
    stripBg: "bg-surface-container-low/70 dark:bg-surface-container/50 border-b border-outline-variant/20",
    activeButtonClass: "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30",
    inactiveButtonClass: "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30",
    indicatorColor: "bg-outline-variant",
  },
};

// Returns format-friendly relative time string ("just now", "3 min ago", "yesterday", "12 Sep")
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0 || isNaN(diffMs)) return "";

    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 45) return "just now";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return diffMinutes === 1 ? "1 min ago" : `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return diffHours === 1 ? "1 hr ago" : `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

// Hook that re-evaluates relative time every minute while component is mounted
export function useRelativeTime(dateString?: string | null): string {
  const [relativeTime, setRelativeTime] = useState<string>(() => formatRelativeTime(dateString));

  useEffect(() => {
    setRelativeTime(formatRelativeTime(dateString));
    if (!dateString) return;

    // Tick every minute to keep relative timestamps accurate
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(dateString));
    }, 60000);

    return () => clearInterval(interval);
  }, [dateString]);

  return relativeTime;
}
