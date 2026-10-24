// Emergent Axes Tab displaying pool-relative differentiating criteria and anchoring citations

import React from "react";
import { Compass, Filter, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EmergentAxis } from "@/entities/extraction/matching/emergentAxes";
import type { CandidateReviewItem } from "../types";

export interface EmergentAxesTabProps {
  axes: EmergentAxis[];
  poolSummary?: string | null;
  queueMap: Map<string, CandidateReviewItem>;
  onJumpToCandidate: (candidateId: string) => void;
  onFilterCandidateIds?: (candidateIds: string[], label: string) => void;
}

export function EmergentAxesTab({
  axes,
  poolSummary,
  queueMap,
  onJumpToCandidate,
  onFilterCandidateIds,
}: EmergentAxesTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Compass className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Emergent Pool Summary
          </h4>
          <p className="text-sm text-on-surface leading-relaxed font-medium">
            {poolSummary ||
              "Discovered 4 orthogonal, pool-relative differentiating axes derived from verified claims to serve as a calibrated yardstick for candidate evaluation."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {axes.map((axis) => {
          // Collect candidate IDs anchoring this axis
          const citedCandidateIds = Array.from(
            new Set(axis.supporting_claims.map((sc) => sc.candidate_id))
          );

          return (
            <div
              key={axis.axis_id}
              className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                  <div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {axis.axis_id.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-on-surface mt-1 tracking-tight">
                      {axis.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                      {axis.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface border border-outline-variant/30">
                      {axis.estimated_pool_prevalence}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {axis.rationale}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                      Strong Benchmark ([action] required)
                    </p>
                    <p className="text-[11px] text-emerald-950/90 dark:text-emerald-200/90 leading-relaxed">
                      {axis.strong_criteria}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container/80 border border-outline-variant/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Moderate Benchmark
                    </p>
                    <p className="text-[11px] text-on-surface-variant/90 leading-relaxed">
                      {axis.moderate_criteria}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                    Anchoring Claims & Contenders
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {axis.supporting_claims.map((claim, idx) => {
                      const candidate = queueMap.get(claim.candidate_id)?.candidate;
                      const candidateName =
                        candidate?.identity?.name || claim.candidate_id;

                      return (
                        <div
                          key={`${claim.candidate_id}-${claim.ref_id}-${idx}`}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface/70 border border-outline-variant/30 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-on-surface text-[11px] truncate">
                                {candidateName}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-container font-bold text-primary">
                                [{claim.ref_id}]
                              </span>
                            </div>
                            {claim.evidence_span ? (
                              <p className="text-[10px] text-on-surface-variant italic truncate mt-0.5">
                                &quot;{claim.evidence_span}&quot;
                              </p>
                            ) : claim.digest_line ? (
                              <p className="text-[10px] text-on-surface-variant truncate mt-0.5">
                                {claim.digest_line}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() => onJumpToCandidate(claim.candidate_id)}
                            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                            title={`Inspect ${candidateName}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {onFilterCandidateIds && citedCandidateIds.length > 0 && (
                <div className="pt-3 border-t border-outline-variant/30 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onFilterCandidateIds(
                        citedCandidateIds,
                        `${axis.label} (${citedCandidateIds.length})`
                      )
                    }
                    className="h-7 px-2.5 gap-1.5 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 cursor-pointer"
                    title={`Filter queue to candidates anchoring ${axis.label}`}
                  >
                    <Filter className="h-3 w-3 shrink-0" />
                    <span>Filter Queue to Axis Contenders</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
