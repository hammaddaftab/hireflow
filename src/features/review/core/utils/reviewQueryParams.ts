// Review filter query parameter parsing and serialization utilities

import type { QueueFilterTab } from "@/entities/review";

export const DEFAULT_GROUP_ID = "grp_all";

export function isDefaultGroup(groupId: string | null | undefined): boolean {
  return !groupId || groupId === "grp_all" || groupId === "node-root";
}

export interface ReviewFilterQueryParams {
  candidateIndex?: number;
  tab?: QueueFilterTab;
  city?: string | null;
  group?: string | null;
}

// Builds a query string for review navigation preserving active filter and candidate state
export function buildReviewQueryString(params: ReviewFilterQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.candidateIndex !== undefined && params.candidateIndex > 0) {
    searchParams.set("candidateIndex", String(params.candidateIndex));
  }

  if (params.tab && params.tab !== "all") {
    searchParams.set("tab", params.tab);
  }

  if (params.city) {
    searchParams.set("city", params.city);
  }

  if (params.group && !isDefaultGroup(params.group)) {
    searchParams.set("group", params.group);
  }

  return searchParams.toString();
}

// Parses raw search params into typed review query parameters
export function parseReviewQueryParams(
  searchParams: Record<string, string | undefined> | URLSearchParams
): ReviewFilterQueryParams {
  const getParam = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || undefined;
    }
    return searchParams[key];
  };

  const candidateIndexRaw = getParam("candidateIndex");
  const parsedIndex = candidateIndexRaw ? parseInt(candidateIndexRaw, 10) : 0;
  const rawGroup = getParam("group");

  return {
    candidateIndex: isNaN(parsedIndex) ? 0 : parsedIndex,
    tab: (getParam("tab") as QueueFilterTab) || "all",
    city: getParam("city") || null,
    group: isDefaultGroup(rawGroup) ? DEFAULT_GROUP_ID : rawGroup!,
  };
}

