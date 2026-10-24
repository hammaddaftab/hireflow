// Tournament Audit Tab displaying how AI compared candidates fairly across rounds

import React, { useState } from "react";
import type {
  TopCandidatesRankingResult,
} from "@/entities/extraction/matching/topCandidatesRanking";
import type { CandidateReviewItem } from "../types";

export interface TournamentAuditTabProps {
  ranking: TopCandidatesRankingResult;
  queueMap: Map<string, CandidateReviewItem>;
  onJumpToCandidate: (candidateId: string) => void;
}

// Strips internal bracket citation codes like [c1], [s2], [header], [work_1] from prose
function cleanAuditText(text: string): string {
  return text
    .replace(/\s*\[(?:[cs]\d+|work_\d+|header)(?:,\s*(?:[cs]\d+|work_\d+|header))*\]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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
    <div className="space-y-5">
      <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/25">
        <button
          type="button"
          onClick={() => setActiveSection("pairwise")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
            activeSection === "pairwise"
              ? "bg-surface text-on-surface shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Head-to-Head ({pairwiseMatchups.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("latin")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
            activeSection === "latin"
              ? "bg-surface text-on-surface shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Reading-Order Checks ({latinSquareOrderings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("halving")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
            activeSection === "halving"
              ? "bg-surface text-on-surface shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Qualifying Rounds ({halvingRounds.length})
        </button>

        {knockedOut.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveSection("gatekeeper")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
              activeSection === "gatekeeper"
                ? "bg-surface text-on-surface shadow-2xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Filtered Out ({knockedOut.length})
          </button>
        )}
      </div>

      {activeSection === "pairwise" && (
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Every pair of finalists is compared twice in opposite reading orders so the AI does not favor whichever resume it reads second. A candidate only earns a clean win if they win both passes.
          </p>

          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container border-b border-outline-variant/30 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Matchup</th>
                    <th className="px-4 py-3">Pass 1</th>
                    <th className="px-4 py-3">Pass 2</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/25 text-on-surface">
                  {pairwiseMatchups.map((matchup, idx) => {
                    const isTie = matchup.resolved_outcome === "tie";
                    const candAName = getName(matchup.candidate_a);
                    const candBName = getName(matchup.candidate_b);
                    const fwdWinnerName = getName(matchup.forward_winner);
                    const revWinnerName = getName(matchup.reverse_winner);

                    return (
                      <tr
                        key={`${matchup.candidate_a}-${matchup.candidate_b}-${idx}`}
                        className="hover:bg-surface-container/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onJumpToCandidate(matchup.candidate_a)}
                              className="text-on-surface hover:text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                            >
                              {candAName}
                            </button>
                            <span className="text-on-surface-variant text-[11px]">vs</span>
                            <button
                              type="button"
                              onClick={() => onJumpToCandidate(matchup.candidate_b)}
                              className="text-on-surface hover:text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                            >
                              {candBName}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-on-surface-variant">
                          {fwdWinnerName}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-on-surface-variant">
                          {revWinnerName}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {isTie ? (
                            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface font-semibold text-[11px]">
                              Close Tie
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-primary/12 text-primary font-semibold text-[11px]">
                              Unanimous
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs leading-relaxed max-w-md text-on-surface-variant">
                          {cleanAuditText(matchup.decisive_reasons)}
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
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Finalists are full-read in 4 rotated reading orders so every candidate is evaluated first, in the middle, and last.
          </p>

          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container border-b border-outline-variant/30 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Finalist</th>
                    {latinSquareOrderings.map((run, i) => (
                      <th key={run.permutation_index} className="px-4 py-3">
                        Order {i + 1}
                      </th>
                    ))}
                    <th className="px-4 py-3">Avg Rank</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/25 text-on-surface">
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
                        ?.comparative_notes || "Consistently ranked across reading orders.";

                    return (
                      <tr key={candidateId} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onJumpToCandidate(candidateId)}
                            className="text-on-surface hover:text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                          >
                            {candidateName}
                          </button>
                        </td>

                        {ranks.map((r, i) => (
                          <td key={i} className="px-4 py-3 text-on-surface-variant">
                            {r !== null ? `#${r}` : "-"}
                          </td>
                        ))}

                        <td className="px-4 py-3 font-semibold text-on-surface">
                          #{avgRank}
                        </td>

                        <td className="px-4 py-3 text-on-surface-variant text-xs leading-relaxed max-w-md">
                          {cleanAuditText(firstNote)}
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
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Candidates are reviewed in small groups of up to 8—read both top-to-bottom and bottom-to-top—so no strong resume gets overlooked in the middle of a long list.
          </p>

          {halvingRounds.map((round) => (
            <div key={round.round_number} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Round {round.round_number} ({round.input_candidate_count} Applicants &rarr; {round.survivor_count} Advanced)
              </h4>

              {round.groups.map((group) => (
                <div
                  key={group.group_index}
                  className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-surface-container border-b border-outline-variant/30 font-semibold text-xs text-on-surface">
                    Group {group.group_index + 1} ({group.candidates.length} candidates)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-container/60 border-b border-outline-variant/25 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                        <tr>
                          <th className="px-4 py-2.5">Candidate</th>
                          <th className="px-4 py-2.5">Pass 1</th>
                          <th className="px-4 py-2.5">Pass 2</th>
                          <th className="px-4 py-2.5">Avg</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/25 text-on-surface">
                        {group.evaluations.map((item) => {
                          const candidateName = getName(item.candidate_id);

                          return (
                            <tr key={item.candidate_id} className="hover:bg-surface-container/40 transition-colors">
                              <td className="px-4 py-3 font-semibold whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onJumpToCandidate(item.candidate_id)}
                                  className="text-on-surface hover:text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-semibold p-0"
                                >
                                  {candidateName}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant">#{item.forward_rank}</td>
                              <td className="px-4 py-3 text-on-surface-variant">#{item.reverse_rank}</td>
                              <td className="px-4 py-3 font-semibold text-on-surface">
                                #{item.avg_rank.toFixed(1)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {item.survived ? (
                                  <span className="px-2 py-0.5 rounded-md bg-primary/12 text-primary font-semibold text-[11px]">
                                    Advanced
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-medium text-[11px]">
                                    Filtered
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs leading-relaxed text-on-surface-variant max-w-md">
                                {cleanAuditText(item.rationale)}
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
        <div className="space-y-3">
          {knockedOut.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-xs">
              All candidates in this pool met the baseline job requirements.
            </div>
          ) : (
            <div className="space-y-3">
              {knockedOut.map((cand) => (
                <div
                  key={cand.candidate_id}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-on-surface">
                      {cand.candidate_name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-semibold text-[11px]">
                      Missing Mandatory Criteria
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {cand.contradictions.map((c, i) => (
                      <div key={i} className="text-xs text-on-surface-variant">
                        <span className="font-semibold text-on-surface">{c.label}: </span>
                        {c.reasoning}
                      </div>
                    ))}
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
