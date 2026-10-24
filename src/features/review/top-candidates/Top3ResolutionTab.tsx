// Top 3 Resolution Tab rendering conversational AI shortlist summary, clear frontrunners, and close-call ties

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
            AI Shortlist Summary
          </h4>
          <p className="text-sm text-on-surface leading-relaxed font-medium">
            {cleanProseText(ranking.summary)}
          </p>
        </div>
      </div>

      {confidentCandidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Clear Frontrunners ({confidentCandidates.length})
            </h4>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              Unanimous winners across every head-to-head comparison
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
                Close Call for #3 — Tied Finalists
              </h4>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed mt-1">
                When the AI compared these two candidates head-to-head, they were so evenly matched that each won depending on who was read second.
                Rather than guessing or hiding one of them, both are shown side-by-side below so you can choose the better fit for your team.
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
