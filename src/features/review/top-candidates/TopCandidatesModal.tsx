// Top Candidates Modal presenting AI shortlist recommendations, differentiating criteria, and comparison proof

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

  // Load ranking on open or when candidate pool size changes
  const fetchRanking = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/top-candidates`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to load top candidates shortlist");
      }
      setRanking(data.ranking);
      setMode(data.mode || "instant");
      setCanRunLive(Boolean(data.canRunLive));
      setUnrankedNames(Array.isArray(data.unrankedCandidateNames) ? data.unrankedCandidateNames : []);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load shortlist recommendations"
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

  // Run Live AI Re-Evaluation
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
        throw new Error(data.error || "Failed to re-evaluate candidates");
      }
      setRanking(data.ranking);
      setMode(data.mode || "live");
      setUnrankedNames([]);
      if (data.warnings && data.warnings.length > 0) {
        console.warn("Evaluation warnings:", data.warnings);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Live evaluation failed"
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
                    Top Candidates Recommendation
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
                        ? "Clear Top 2 + Tie for #3"
                        : "Clear Top 3"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  AI shortlist for {job.title} — backed by direct quotes from each applicant&apos;s resume
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
                  title="Show only these top picks in the main review queue"
                >
                  <Filter className="h-3.5 w-3.5 shrink-0" />
                  <span>Show Only Top Picks in Queue</span>
                </Button>
              )}

              {canRunLive && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunLiveTournament}
                  disabled={isRunningLive}
                  className="h-8 px-3 gap-1.5 text-xs font-bold rounded-xl bg-primary text-on-primary hover:bg-primary/90 border-0 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Re-run AI evaluation across all current applicants"
                >
                  {isRunningLive ? (
                    <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    {isRunningLive ? "Evaluating Candidates..." : "Re-evaluate Pool with AI"}
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
            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
              <span className="font-semibold text-on-surface">{totalPool} Resumes Reviewed</span>
              <span>&rarr;</span>
              <span className="font-semibold text-on-surface">{viableCount} Qualified</span>
              <span>&rarr;</span>
              <span className="font-semibold text-on-surface">{finalistsCount} Finalists Deep-Read</span>
              <span>&rarr;</span>
              <span className="font-bold text-primary">
                {ranking?.top3_status === "contested" ? "Top 4 Shortlisted (Tie at #3)" : "Top 3 Shortlisted"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container font-medium text-on-surface-variant border border-outline-variant/30">
                {mode === "live" ? "Updated Live" : "Bias-Checked AI Shortlist"}
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
              <span>Recommended Top Picks</span>
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
              <span>What Set Them Apart</span>
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
              <span>How AI Compared Them</span>
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
                    {unrankedNames.length} New Resume{unrankedNames.length > 1 ? "s" : ""} Added ({unrankedNames.join(", ")})
                  </p>
                  <p className="text-on-surface-variant">
                    Their resumes have been parsed. Click to compare them against the existing {totalPool - unrankedNames.length} candidates and update the shortlist.
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
                      ? `Comparing All ${totalPool} Candidates...`
                      : `Include in Top Picks (${totalPool} Total)`}
                  </span>
                </Button>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Could not load recommendations</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {isLoading && !ranking ? (
            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Comparing candidates and gathering resume proof...</p>
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
              No shortlist data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
