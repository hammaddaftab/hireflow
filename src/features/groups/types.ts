export type GroupStatus = "active" | "review" | "clear" | "hold";

export interface CandidateMemberSummary {
  id: string;
  name: string;
  role: string;
  verifiedYears: number;
  matchScore: number;
  status: "knockout_passed" | "review_needed" | "borderline";
  highlights: string[];
}

export interface GroupNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  status: GroupStatus;
  parentId: string | null;
  childrenIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  candidateCount: number;
  candidates: CandidateMemberSummary[];
  criteriaDescription: string;
}

export interface GroupEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}
