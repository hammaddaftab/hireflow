// Tournament Audit Tab displaying bias cancellation across Stages 0, 2, and 3

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Scale, Split, XCircle } from "lucide-react";
import type {
  TopCandidatesRankingResult,
  PairwiseMatchupTelemetry,
  LatinSquareOrderingTelemetry,
  HalvingRoundTelemetry,
} from "@/entities/extraction/matching/topCandidatesRanking";
import type { CandidateReviewItem } from "../types";

export interface TournamentAuditTabProps {
  ranking: TopCandidatesRankingResult;
  queueMap: Map<string, CandidateReviewItem>;
  onJumpToCandidate: (candidateId: string) => void;
}

export function TournamentAuditTab({
  ranking,
  queueMap,
  onJumpToCandidate,
}: TournamentAuditTabProps) {
  const [activeSection, setActiveSection] = useState<"pairwise" | "latin" | "halving" | "gatekeeper">("pairwise");

  const telemetry = ranking.telemetry;
  const pairwiseMatchups = telemetry.stage3_pairwise_matchups || [];
  const latinSquareOrderings = telemetry.stage3_latin_square_orderings || [];
  const halvingRounds = telemetry.stage2_rounds || [];
  const knockedOut = telemetry.stage0_knocked_out || [];

  const getName = (id: string) => {
    return queueMap.get(id)?.candidate?.identity?.name || id;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
        <button
          type="button"
          onClick={() => setActiveSection("pairwise")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
            activeSection === "pairwise"
              ? "bg-surface text-on-surface shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          <Scale className="h-3.5 w-3.5 shrink-0" />
          <span>Stage 3B: Pairwise Matrix ({pairwiseMatchups.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("latin")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
            activeSection === "latin"
              ? "bg-surface text-on-surface shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          <Split className="h-3.5 w-3.5 shrink-0" />
          <span>Stage 3A: Latin-Square Permutations ({latinSquareOrderings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("halving")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
            activeSection === "halving"
              ? "bg-surface text-on-surface shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span>Stage 2: Halving Telemetry ({halvingRounds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("gatekeeper")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
            activeSection === "gatekeeper"
              ? "bg-surface text-on-surface shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
          }`}
        >
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Stage 0: Gatekeeper Knockouts ({knockedOut.length})</span>
        </button>
      </div>

      {activeSection === "pairwise" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-3">
            <Scale className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-on-surface mb-0.5">
                Bidirectional Pairwise Positional Bias Cancellation
              </p>
              <p className="leading-relaxed">
                Each finalist matchup is evaluated in both presentation orders (A vs B, and B vs A).
                A clean win requires winning both directions. If the verdict flips when presentation order reverses,
                the matchup is marked as an order-flip tie, preventing presentation-order bias from inflating ratings.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container border-b border-outline-variant/40 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Matchup</th>
                    <th className="px-4 py-3">Forward Order (A vs B)</th>
                    <th className="px-4 py-3">Reverse Order (B vs A)</th>
                    <th className="px-4 py-3">Resolved Outcome</th>
                    <th className="px-4 py-3">Decisive Factors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                  {pairwiseMatchups.map((matchup, idx) => {
                    const isTie = matchup.resolved_outcome === "tie";
                    const candAName = getName(matchup.candidate_a);
                    const candBName = getName(matchup.candidate_b);
                    const fwdWinnerName = getName(matchup.forward_winner);
                    const revWinnerName = getName(matchup.reverse_winner);

                    return (
                      <tr
                        key={`${matchup.candidate_a}-${matchup.candidate_b}-${idx}`}
                        className={`hover:bg-surface-container/50 transition-colors ${
                          isTie ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onJumpToCandidate(matchup.candidate_a)}
                              className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                            >
                              {candAName}
                            </button>
                            <span className="text-on-surface-variant text-[11px]">vs</span>
                            <button
                              type="button"
                              onClick={() => onJumpToCandidate(matchup.candidate_b)}
                              className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                            >
                              {candBName}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-on-surface">
                            {fwdWinnerName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant ml-1 font-mono">
                            ({matchup.forward_confidence})
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-on-surface">
                            {revWinnerName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant ml-1 font-mono">
                            ({matchup.reverse_confidence})
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {isTie ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold text-[11px] border border-amber-500/30">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Order-Flip Tie
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              Clean Win
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs leading-relaxed max-w-sm text-on-surface-variant font-medium">
                          {matchup.decisive_reasons}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSection === "latin" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-3">
            <Split className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-on-surface mb-0.5">
                Latin-Square Positional Rotation Table
              </p>
              <p className="leading-relaxed">
                Finalists are rotated across 4 distinct Latin-Square ordering permutations so every candidate is evaluated
                in multiple positions (early, middle, late). The final ranking reflects the balanced average position across all runs.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container border-b border-outline-variant/40 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Finalist</th>
                    {latinSquareOrderings.map((run, i) => (
                      <th key={run.permutation_index} className="px-4 py-3">
                        Run {i + 1} Rank
                      </th>
                    ))}
                    <th className="px-4 py-3">Averaged Rank</th>
                    <th className="px-4 py-3">Primary Standing Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                  {telemetry.stage3_top5_candidate_ids.map((candidateId) => {
                    const candidateName = getName(candidateId);
                    const ranks = latinSquareOrderings.map((run) => {
                      const entry = run.rankings.find((r) => r.candidate_id === candidateId);
                      return entry ? entry.rank : null;
                    });

                    const validRanks = ranks.filter((r): r is number => r !== null);
                    const avgRank =
                      validRanks.length > 0
                        ? (validRanks.reduce((a, b) => a + b, 0) / validRanks.length).toFixed(2)
                        : "N/A";

                    const firstNote =
                      latinSquareOrderings[0]?.rankings.find((r) => r.candidate_id === candidateId)
                        ?.comparative_notes || "Consistently ranked across permutations.";

                    return (
                      <tr key={candidateId} className="hover:bg-surface-container/50 transition-colors">
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onJumpToCandidate(candidateId)}
                            className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                          >
                            {candidateName}
                          </button>
                        </td>

                        {ranks.map((r, i) => (
                          <td key={i} className="px-4 py-3 font-mono">
                            {r !== null ? `#${r}` : "-"}
                          </td>
                        ))}

                        <td className="px-4 py-3 font-mono font-bold text-primary">
                          #{avgRank}
                        </td>

                        <td className="px-4 py-3 text-on-surface-variant text-xs leading-relaxed max-w-sm">
                          {firstNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSection === "halving" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-on-surface mb-0.5">
                Stage 2 Halving Forward/Reverse Group Evaluation
              </p>
              <p className="leading-relaxed">
                Viable contenders are evaluated in forward and reverse orders to cancel first-seen vs last-seen bias.
                Exceptional out-of-band spikes are preserved via the outside-axes standout override.
              </p>
            </div>
          </div>

          {halvingRounds.map((round) => (
            <div key={round.round_number} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Halving Round {round.round_number} ({round.input_candidate_count} Contenders &rarr; {round.survivor_count} Survivors)
              </h4>

              {round.groups.map((group) => (
                <div
                  key={group.group_index}
                  className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden shadow-2xs"
                >
                  <div className="px-4 py-2.5 bg-surface-container border-b border-outline-variant/40 font-semibold text-xs text-on-surface">
                    Group {group.group_index + 1} ({group.candidates.length} candidates)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-container/60 border-b border-outline-variant/30 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        <tr>
                          <th className="px-4 py-2.5">Candidate</th>
                          <th className="px-4 py-2.5">Forward Rank</th>
                          <th className="px-4 py-2.5">Reverse Rank</th>
                          <th className="px-4 py-2.5">Average Rank</th>
                          <th className="px-4 py-2.5">Standout Override</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Rationale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                        {group.evaluations.map((item) => {
                          const candidateName = getName(item.candidate_id);

                          return (
                            <tr key={item.candidate_id} className="hover:bg-surface-container/50 transition-colors">
                              <td className="px-4 py-3 font-semibold whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onJumpToCandidate(item.candidate_id)}
                                  className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                                >
                                  {candidateName}
                                </button>
                              </td>
                              <td className="px-4 py-3 font-mono">#{item.forward_rank}</td>
                              <td className="px-4 py-3 font-mono">#{item.reverse_rank}</td>
                              <td className="px-4 py-3 font-mono font-bold text-on-surface">
                                #{item.avg_rank.toFixed(1)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {item.outside_axes_standout ? (
                                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold text-[10px]">
                                    Standout Preserved
                                  </span>
                                ) : (
                                  <span className="text-on-surface-variant text-[11px]">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {item.survived ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                                    Advanced
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-[10px]">
                                    Eliminated
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs leading-relaxed text-on-surface-variant max-w-sm">
                                {item.rationale}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {activeSection === "gatekeeper" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-3">
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-on-surface mb-0.5">
                Deterministic Stage 0 Gatekeeper Contradiction Knockouts
              </p>
              <p className="leading-relaxed">
                Before AI emergent axes or tournaments run, candidates with hard contradicted blocking requirements
                (such as missing mandatory skills or deficient years of full-time experience) are eliminated deterministically.
              </p>
            </div>
          </div>

          {knockedOut.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-dashed border-outline-variant text-on-surface-variant text-xs">
              No candidates in this pool were knocked out by deterministic Stage 0 gates.
            </div>
          ) : (
            <div className="space-y-3">
              {knockedOut.map((cand) => (
                <div
                  key={cand.candidate_id}
                  className="p-4 rounded-2xl bg-surface-container-low border border-rose-500/30 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">
                        {cand.candidate_name}
                      </h4>
                      <p className="text-[11px] font-mono text-on-surface-variant">
                        ID: {cand.candidate_id}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-300 font-bold text-[10px] border border-rose-500/30">
                      Knocked Out (Stage 0)
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] uppercase font-bold tracking-wider text-rose-700 dark:text-rose-400">
                      Blocking Contradictions:
                    </p>
                    <div className="space-y-1.5">
                      {cand.contradictions.map((c, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-surface/70 border border-outline-variant/30 text-xs text-on-surface space-y-0.5"
                        >
                          <span className="font-semibold text-rose-600 dark:text-rose-400 text-xs">
                            {c.label}:
                          </span>
                          <p className="text-on-surface/90 text-xs leading-relaxed">
                            {c.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
