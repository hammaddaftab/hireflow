// Initial topology definitions with mock groups cleared

import type { GroupNode, GroupEdge } from "./types";

export const INITIAL_GROUPS: GroupNode[] = [
  {
    id: "node-root",
    title: "All Applicants",
    subtitle: "Job Ingress Pipeline Root",
    description: "Root cluster containing parsed candidate profiles evaluated against job requirements.",
    badge: "Master Pool",
    status: "active",
    parentId: null,
    childrenIds: [],
    x: 572,
    y: 90,
    width: 56,
    height: 56,
    candidateCount: 0,
    criteriaDescription: "All candidates submitted for active job position",
    candidates: [],
  },
];

export const INITIAL_EDGES: GroupEdge[] = [];
