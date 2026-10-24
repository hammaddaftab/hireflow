// Top 3 Resolution Tab rendering executive synthesis, confident candidates, and contested split comparisons

import React from "react";
import { AlertTriangle, Trophy } from "lucide-react";
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

export function Top3ResolutionTab({
  ranking,
  queueMap,
  onJumpToCandidate,
  onDecision,
}: Top3ResolutionTabProps) {
  const isContested = ranking.top3_status === "contested";

  // Partition candidates into confident group vs contested group
  const confidentCandidates = ranking.top_candidates.filter(
    (c) => c.status === "confident"
  );
  const contestedCandidates = ranking.top_candidates.filter(
    (c) => c.status === "contested"
  );

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Trophy className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Executive Synthesis
          </h4>
          <p className="text-sm text-on-surface leading-relaxed font-medium">
            {ranking.summary}
          </p>
        </div>
      </div>

      {confidentCandidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Confident Finalists ({confidentCandidates.length})
            </h4>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              Zero positional bias flips detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Contested Slot: #3 Position Split
              </h4>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed mt-1">
                Forward versus reverse presentation order produced an order-flip tie in head-to-head pairwise verification.
                Both contenders earned identical Latin-Square averages and hold equal claim to the #3 shortlist position.
                Compare their domain strengths and system metrics side-by-side to make the decisive hiring call.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contestedCandidates.map((entry) => (
              <TopCandidateCard
                key={entry.candidate_id}
                entry={entry}
                queueItem={queueMap.get(entry.candidate_id)}
                onJumpToCandidate={onJumpToCandidate}
                onDecision={onDecision}
                isContestedGroupMember={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
