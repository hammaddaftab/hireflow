// Emergent Axes Tab displaying natural pool-relative criteria and resume examples

import React from "react";
import { Filter, ExternalLink } from "lucide-react";
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

// Strips internal bracket tags like ([action]), ([peripheral]), [c1], [s2] from axis text
function cleanAxisProse(text: string): string {
  return text
    .replace(/\s*\(\[(?:action|peripheral|action_attributed|peripheral_action|listed|unanchored_claim)\]\)/gi, "")
    .replace(/\s*\[(?:action|peripheral|action_attributed|peripheral_action|listed|unanchored_claim)\]/gi, "")
    .replace(/\s*\[(?:[cs]\d+|work_\d+|header)(?:,\s*(?:[cs]\d+|work_\d+|header))*\]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function EmergentAxesTab({
  axes,
  poolSummary,
  queueMap,
  onJumpToCandidate,
  onFilterCandidateIds,
}: EmergentAxesTabProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {cleanAxisProse(
          poolSummary ||
            "Instead of using a generic checklist, the AI read every qualified resume to see what sets the strongest applicants apart in this specific pool."
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {axes.map((axis) => {
          const citedCandidateIds = Array.from(
            new Set(axis.supporting_claims.map((sc) => sc.candidate_id))
          );

          return (
            <div
              key={axis.axis_id}
              className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-between gap-3 pb-2.5 mb-3 border-b border-outline-variant/25">
                  <h3 className="text-sm font-bold text-on-surface tracking-tight truncate">
                    {axis.label}
                  </h3>
                  <span className="shrink-0 text-[11px] font-medium text-on-surface-variant whitespace-nowrap">
                    {axis.estimated_pool_prevalence}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed mb-3.5">
                  {cleanAxisProse(axis.rationale)}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="pl-3 border-l-2 border-primary/50 space-y-0.5">
                    <p className="text-[11px] font-semibold text-on-surface">
                      Top Candidates
                    </p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {cleanAxisProse(axis.strong_criteria)}
                    </p>
                  </div>

                  <div className="pl-3 border-l-2 border-outline-variant/50 space-y-0.5">
                    <p className="text-[11px] font-semibold text-on-surface-variant">
                      Typical Applicant
                    </p>
                    <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                      {cleanAxisProse(axis.moderate_criteria)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="text-[11px] uppercase font-semibold tracking-wider text-on-surface-variant">
                    Resume Examples
                  </p>
                  <div className="divide-y divide-outline-variant/20">
                    {axis.supporting_claims.slice(0, 3).map((claim, idx) => {
                      const candidate = queueMap.get(claim.candidate_id)?.candidate;
                      const candidateName =
                        candidate?.identity?.name || claim.candidate_id;

                      return (
                        <div
                          key={`${claim.candidate_id}-${claim.ref_id}-${idx}`}
                          className="flex items-center justify-between gap-2 py-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-on-surface text-xs truncate block">
                              {candidateName}
                            </span>
                            {claim.evidence_span ? (
                              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                                &ldquo;{claim.evidence_span}&rdquo;
                              </p>
                            ) : claim.digest_line ? (
                              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                                {claim.digest_line.replace(/^\[[^\]]+\]\s*/, "")}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() => onJumpToCandidate(claim.candidate_id)}
                            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
                            title={`Jump to ${candidateName}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {onFilterCandidateIds && citedCandidateIds.length > 0 && (
                <div className="pt-3 border-t border-outline-variant/25 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onFilterCandidateIds(
                        citedCandidateIds,
                        `${axis.label} (${citedCandidateIds.length})`
                      )
                    }
                    className="h-7 px-2.5 gap-1.5 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 cursor-pointer"
                    title={`Filter queue to candidates demonstrating ${axis.label}`}
                  >
                    <Filter className="h-3 w-3 shrink-0" />
                    <span>Show in Queue ({citedCandidateIds.length})</span>
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
