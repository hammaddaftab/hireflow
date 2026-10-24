// Review filter query parameter parsing and serialization utilities

import type { QueueFilterTab } from "@/entities/review";
import type { QueueSortOption } from "./queueCalculations";

export const DEFAULT_GROUP_ID = "grp_all";

export function isDefaultGroup(groupId: string | null | undefined): boolean {
  return !groupId || groupId === "grp_all" || groupId === "node-root";
}

export interface ReviewFilterQueryParams {
  jobId?: string | null;
  candidateIndex?: number;
  tab?: QueueFilterTab;
  city?: string | null;
  university?: string | null;
  group?: string | null;
  sort?: QueueSortOption;
}

// Builds a query string for review navigation preserving active filter and candidate state
export function buildReviewQueryString(params: ReviewFilterQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.jobId) {
    searchParams.set("jobId", params.jobId);
  }

  if (params.candidateIndex !== undefined && params.candidateIndex > 0) {
    searchParams.set("candidateIndex", String(params.candidateIndex));
  }

  if (params.tab && params.tab !== "all") {
    searchParams.set("tab", params.tab);
  }

  if (params.city) {
    searchParams.set("city", params.city);
  }

  if (params.university) {
    searchParams.set("university", params.university);
  }

  if (params.group && !isDefaultGroup(params.group)) {
    searchParams.set("group", params.group);
  }

  if (params.sort === "oldest") {
    searchParams.set("sort", params.sort);
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
  const rawSort = getParam("sort");

  return {
    candidateIndex: isNaN(parsedIndex) ? 0 : parsedIndex,
    tab: (getParam("tab") as QueueFilterTab) || "all",
    city: getParam("city") || null,
    university: getParam("university") || null,
    group: isDefaultGroup(rawGroup) ? DEFAULT_GROUP_ID : rawGroup!,
    sort: rawSort === "oldest" ? "oldest" : "latest",
  };
}

