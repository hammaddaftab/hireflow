// Top 3 Resolution Tab rendering conversational AI shortlist summary, clear frontrunners, and close-call ties

import React from "react";
import type { TopCandidatesRankingResult } from "@/entities/extraction/matching/topCandidatesRanking";
import type { CandidateReviewItem } from "../types";
import type { ReviewDecision } from "@/entities/review";
import { TopCandidateCard } from "./TopCandidateCard";

export interface Top3ResolutionTabProps {
  ranking: TopCandidatesRankingResult;
  queueMap: Map<string, CandidateReviewItem>;
  onJumpToCandidate: (candidateId: string) => void;
  onDecision: (decision: ReviewDecision, candidateId?: string) => void;
}

// Strips internal bracket citation codes like [c1], [s2], [header], [work_1] from prose
function cleanProseText(text: string): string {
  return text
    .replace(/\s*\[(?:[cs]\d+|work_\d+|header)(?:,\s*(?:[cs]\d+|work_\d+|header))*\]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function Top3ResolutionTab({
  ranking,
  queueMap,
  onJumpToCandidate,
  onDecision,
}: Top3ResolutionTabProps) {
  const isContested = ranking.top3_status === "contested";

  const confidentCandidates = ranking.top_candidates.filter(
    (c) => c.status === "confident"
  );
  const contestedCandidates = ranking.top_candidates.filter(
    (c) => c.status === "contested"
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {cleanProseText(ranking.summary)}
      </p>

      {confidentCandidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Clear Frontrunners ({confidentCandidates.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {confidentCandidates.map((entry) => (
              <TopCandidateCard
                key={entry.candidate_id}
                entry={entry}
                queueItem={queueMap.get(entry.candidate_id)}
                onJumpToCandidate={onJumpToCandidate}
                onDecision={onDecision}
              />
            ))}
          </div>
        </div>
      )}

      {isContested && contestedCandidates.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Tied for #3 — Close Call ({contestedCandidates.length})
            </h3>
            <span className="text-xs text-on-surface-variant">
              Evenly matched head-to-head; compare their focus areas below
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {contestedCandidates.map((entry) => (
              <TopCandidateCard
                key={entry.candidate_id}
                entry={entry}
                queueItem={queueMap.get(entry.candidate_id)}
                onJumpToCandidate={onJumpToCandidate}
                onDecision={onDecision}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
