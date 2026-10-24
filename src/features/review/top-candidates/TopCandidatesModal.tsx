// Top Candidates Modal displaying Mechanism E Tournament Results, Emergent Axes, and Bias Audits

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Play, Filter, Trophy, Compass, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/entities/job";
import type { CandidateReviewItem } from "../types";
import type { ReviewDecision } from "@/entities/review";
import type { TopCandidatesRankingResult } from "@/entities/extraction/matching/topCandidatesRanking";
import { Top3ResolutionTab } from "./Top3ResolutionTab";
import { EmergentAxesTab } from "./EmergentAxesTab";
import { TournamentAuditTab } from "./TournamentAuditTab";

export interface TopCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  queue: CandidateReviewItem[];
  onJumpToCandidate: (candidateId: string) => void;
  onFilterCandidateIds?: (candidateIds: string[], label: string) => void;
  onDecision: (decision: ReviewDecision, candidateId?: string) => void;
}

export function TopCandidatesModal({
  isOpen,
  onClose,
  job,
  queue,
  onJumpToCandidate,
  onFilterCandidateIds,
  onDecision,
}: TopCandidatesModalProps) {
  const [activeTab, setActiveTab] = useState<"top3" | "axes" | "audit">("top3");
  const [ranking, setRanking] = useState<TopCandidatesRankingResult | null>(null);
  const [mode, setMode] = useState<"instant" | "live">("instant");
  const [canRunLive, setCanRunLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningLive, setIsRunningLive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unrankedNames, setUnrankedNames] = useState<string[]>([]);

  // Map candidate IDs to CandidateReviewItems for quick lookup
  const queueMap = useMemo(() => {
    const map = new Map<string, CandidateReviewItem>();
    for (const item of queue) {
      map.set(item.candidate.id, item);
    }
    return map;
  }, [queue]);

  // Load deterministic or cached ranking on open or when candidate pool size changes
  const fetchRanking = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/top-candidates`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to load top candidates ranking");
      }
      setRanking(data.ranking);
      setMode(data.mode || "instant");
      setCanRunLive(Boolean(data.canRunLive));
      setUnrankedNames(Array.isArray(data.unrankedCandidateNames) ? data.unrankedCandidateNames : []);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load tournament data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [job.id]);

  useEffect(() => {
    if (isOpen) {
      fetchRanking();
    }
  }, [isOpen, queue.length, fetchRanking]);

  // Run Live AI Tournament
  const handleRunLiveTournament = async () => {
    setIsRunningLive(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/top-candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "live" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to run live tournament");
      }
      setRanking(data.ranking);
      setMode(data.mode || "live");
      setUnrankedNames([]);
      if (data.warnings && data.warnings.length > 0) {
        // Display any informative warnings
        console.warn("Tournament warnings:", data.warnings);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Live tournament failed"
      );
    } finally {
      setIsRunningLive(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Funnel counts calculation
  const totalPool = queue.length;
  const viableCount = ranking?.telemetry?.stage0_viable_count ?? totalPool;
  const finalistsCount = ranking?.telemetry?.stage3_finalist_ids?.length ?? 5;
  const topCandidateIds = ranking?.top_candidates?.map((c) => c.candidate_id) || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-surface rounded-3xl border border-outline-variant/40 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                    Mechanism E Top Candidates Tournament
                  </h2>
                  {ranking && (
                    <span
                      className={`font-semibold text-xs px-2.5 py-0.5 rounded-full border ${
                        ranking.top3_status === "contested"
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {ranking.top3_status === "contested"
                        ? "Contested #3 Slot"
                        : "Confident Top 3"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Positionally-balanced tournament ranking for {job.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onFilterCandidateIds && topCandidateIds.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onFilterCandidateIds(
                      topCandidateIds,
                      `Top Picks (${topCandidateIds.length})`
                    );
                    onClose();
                  }}
                  className="h-8 px-3 gap-1.5 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 cursor-pointer"
                  title="Filter review queue to top candidates"
                >
                  <Filter className="h-3.5 w-3.5 shrink-0" />
                  <span>Filter Queue to Top Picks</span>
                </Button>
              )}

              {canRunLive && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunLiveTournament}
                  disabled={isRunningLive}
                  className="h-8 px-3 gap-1.5 text-xs font-bold rounded-xl bg-primary text-on-primary hover:bg-primary/90 border-0 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Execute live multi-pass tournament via LLM"
                >
                  {isRunningLive ? (
                    <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    {isRunningLive ? "Running Tournament..." : "Run Live AI Tournament"}
                  </span>
                </Button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer border-0 bg-transparent"
                title="Close modal (Esc)"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-outline-variant/20">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant">
              <span className="font-semibold text-on-surface">{totalPool} Pool</span>
              <span>&rarr;</span>
              <span className="font-semibold text-on-surface">{viableCount} Viable</span>
              <span>&rarr;</span>
              <span className="font-semibold text-on-surface">{finalistsCount} Finalists</span>
              <span>&rarr;</span>
              <span className="font-bold text-primary">
                {ranking?.top3_status === "contested" ? "Top 3 (4 Contenders)" : "Top 3"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-container font-semibold text-on-surface-variant border border-outline-variant/30">
                Mode: {mode === "live" ? "Live Multi-Pass Tournament" : "Instant Seeded Benchmark"}
              </span>
            </div>
          </div>
        </header>

        <div className="px-6 pt-3 pb-2 border-b border-outline-variant/30 bg-surface shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("top3")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                activeTab === "top3"
                  ? "bg-surface text-on-surface shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              <span>Top 3 Resolution</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("axes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                activeTab === "axes"
                  ? "bg-surface text-on-surface shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
              }`}
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span>Emergent Pool Axes (Stage 1)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                activeTab === "audit"
                  ? "bg-surface text-on-surface shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface/40"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Bias Cancellation & Audit (Stages 0, 2, 3)</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {unrankedNames.length > 0 && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-on-surface">
                    {unrankedNames.length} New Candidate CV{unrankedNames.length > 1 ? "s" : ""} Added to Pool ({unrankedNames.join(", ")})
                  </p>
                  <p className="text-on-surface-variant">
                    Their pointer-aspect digests are extracted and ready. Re-run the tournament to rank them against the existing {totalPool - unrankedNames.length} compressed candidates.
                  </p>
                </div>
              </div>
              {canRunLive && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunLiveTournament}
                  disabled={isRunningLive}
                  className="h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl bg-primary text-on-primary hover:bg-primary/90 border-0 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                >
                  {isRunningLive ? (
                    <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    {isRunningLive
                      ? `Ranking ${totalPool} Candidates...`
                      : `Rank All ${totalPool} Candidates Now`}
                  </span>
                </Button>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {isLoading && !ranking ? (
            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Resolving candidate ranking tournament...</p>
            </div>
          ) : ranking ? (
            <>
              {activeTab === "top3" && (
                <Top3ResolutionTab
                  ranking={ranking}
                  queueMap={queueMap}
                  onJumpToCandidate={(cid) => {
                    onJumpToCandidate(cid);
                    onClose();
                  }}
                  onDecision={onDecision}
                />
              )}

              {activeTab === "axes" && (
                <EmergentAxesTab
                  axes={ranking.emergent_axes}
                  poolSummary={ranking.emergent_pool_summary}
                  queueMap={queueMap}
                  onJumpToCandidate={(cid) => {
                    onJumpToCandidate(cid);
                    onClose();
                  }}
                  onFilterCandidateIds={onFilterCandidateIds}
                />
              )}

              {activeTab === "audit" && (
                <TournamentAuditTab
                  ranking={ranking}
                  queueMap={queueMap}
                  onJumpToCandidate={(cid) => {
                    onJumpToCandidate(cid);
                    onClose();
                  }}
                />
              )}
            </>
          ) : (
            <div className="py-20 text-center text-xs text-on-surface-variant">
              No tournament data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
