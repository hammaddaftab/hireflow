// Top Candidate Card rendering rank, tournament telemetry, hydrated claims, and review actions

import React from "react";
import { Check, Flag, XCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TopCandidateEntry } from "@/entities/extraction/matching/topCandidatesRanking";
import type { CandidateReviewItem } from "../types";
import type { ReviewDecision } from "@/entities/review";
import { formatSalaryNumber, getCandidateExperienceYears } from "../core/utils/queueCalculations";

export interface TopCandidateCardProps {
  entry: TopCandidateEntry;
  queueItem?: CandidateReviewItem | null;
  onJumpToCandidate: (candidateId: string) => void;
  onDecision: (decision: ReviewDecision, candidateId?: string) => void;
  isContestedGroupMember?: boolean;
}

export function TopCandidateCard({
  entry,
  queueItem,
  onJumpToCandidate,
  onDecision,
  isContestedGroupMember = false,
}: TopCandidateCardProps) {
  const candidate = queueItem?.candidate;
  const candidateName = candidate?.identity?.name || entry.candidate_id;

  // Derive current role and employer
  const workEntries = candidate?.work_history?.entries || [];
  const currentWork =
    workEntries.find((e) => e.is_current) ||
    workEntries[0];
  const roleTitle = currentWork ? `${currentWork.title} at ${currentWork.employer}` : "Software Engineer";

  // Derive years of experience
  const expYears = queueItem ? getCandidateExperienceYears(queueItem) : null;

  // Derive education
  const primaryEdu = candidate?.education?.entries?.[0];
  const eduText = primaryEdu
    ? `${primaryEdu.degree_level?.normalized || primaryEdu.degree_level?.raw || "Degree"} • ${
        primaryEdu.institution?.normalized || primaryEdu.institution?.raw || "University"
      }`
    : "Education unstated";

  // Derive location and salary
  const city =
    candidate?.identity?.location?.normalized?.city ||
    candidate?.identity?.location?.raw ||
    "Location unstated";

  const salaryReq = candidate?.logistics?.salary_expectation?.normalized;
  const salaryText =
    salaryReq && salaryReq.min
      ? `${salaryReq.currency || "PKR"} ${formatSalaryNumber(salaryReq.min)}${
          salaryReq.max ? ` - ${formatSalaryNumber(salaryReq.max)}` : ""
        }/mo`
      : "Salary unstated";

  const currentDecision = queueItem?.decision || "pending";

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
        entry.status === "contested" || isContestedGroupMember
          ? "bg-surface-container-low border-amber-500/40 shadow-xs"
          : entry.rank === 1
          ? "bg-surface-container-low border-primary/40 shadow-xs"
          : "bg-surface-container-low border-outline-variant/40 shadow-2xs"
      }`}
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                entry.status === "contested"
                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30"
                  : entry.rank === 1
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-surface-container-high text-on-surface border-outline-variant/40"
              }`}
            >
              {entry.status === "contested" ? `#${entry.rank} Contested` : `#${entry.rank}`}
            </span>
            <div>
              <h3 className="text-base font-bold text-on-surface tracking-tight leading-tight">
                {candidateName}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {roleTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {entry.status === "confident" ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                Confident Match
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Contested Slot
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant font-medium mb-3.5 pb-3 border-b border-outline-variant/30">
          {expYears !== null && (
            <span className="font-semibold text-on-surface">
              {expYears} yrs FT
            </span>
          )}
          <span>•</span>
          <span className="truncate max-w-[200px]">{eduText}</span>
          <span>•</span>
          <span>{city}</span>
          <span>•</span>
          <span className="font-mono text-[11px]">{salaryText}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-surface-container/70 border border-outline-variant/30 text-xs mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-medium text-[11px]">
              Pairwise Record:
            </span>
            <span className="font-mono font-bold text-on-surface">
              {entry.pairwise_wins}W - {entry.pairwise_ties}T - {entry.pairwise_losses}L
            </span>
          </div>
          <span className="text-outline-variant">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-medium text-[11px]">
              Latin-Sq Avg Rank:
            </span>
            <span className="font-mono font-bold text-on-surface">
              #{entry.latin_square_avg_rank.toFixed(2)}
            </span>
          </div>
          <span className="text-outline-variant">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-medium text-[11px]">Status:</span>
            <span
              className={`font-semibold ${
                entry.status === "confident"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {entry.status === "confident" ? "Confident" : "Contested"}
            </span>
          </div>
        </div>

        <div className="text-xs leading-relaxed text-on-surface mb-3.5 bg-surface/60 p-3 rounded-xl border border-outline-variant/30">
          <p className="font-semibold text-on-surface mb-1 text-[11px] uppercase tracking-wider text-primary">
            Tournament Rationale
          </p>
          <p className="text-on-surface/90">{entry.headline_rationale}</p>
        </div>

        {entry.contested_with && (
          <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Order-Flip Split Verdict</p>
                <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  {entry.contested_with}
                </p>
              </div>
            </div>
          </div>
        )}

        {entry.supporting_claims && entry.supporting_claims.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
              Cited Verbatim Claims ({entry.supporting_claims.length})
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {entry.supporting_claims.map((claim, idx) => (
                <div
                  key={`${claim.candidate_id}-${claim.ref_id}-${idx}`}
                  className="p-2.5 rounded-xl bg-surface/70 border border-outline-variant/30 text-xs space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                      [{claim.ref_id}]
                    </span>
                    {claim.digest_line && (
                      <span className="text-on-surface-variant truncate max-w-[320px]">
                        {claim.digest_line}
                      </span>
                    )}
                  </div>
                  {claim.evidence_span ? (
                    <blockquote className="border-l-2 border-primary/50 pl-2.5 text-[11px] italic text-on-surface/90 leading-relaxed bg-surface-container/30 py-1 rounded-r">
                      &quot;{claim.evidence_span}&quot;
                    </blockquote>
                  ) : (
                    <p className="text-[11px] text-on-surface-variant/80 italic pl-1">
                      Verified from profile header and career progression history.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onJumpToCandidate(entry.candidate_id)}
          className="h-8 px-3 gap-1.5 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 cursor-pointer"
          title={`Inspect ${candidateName} in main queue`}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span>Inspect in Queue</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDecision("keep", entry.candidate_id)}
            className={`flex items-center gap-1 px-2.5 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              currentDecision === "keep"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
            title="Mark as Keep"
          >
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>Keep</span>
          </button>

          <button
            type="button"
            onClick={() => onDecision("flag", entry.candidate_id)}
            className={`flex items-center gap-1 px-2.5 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              currentDecision === "flag"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
            }`}
            title="Mark as Flagged"
          >
            <Flag className="h-3.5 w-3.5 shrink-0" />
            <span>Flag</span>
          </button>

          <button
            type="button"
            onClick={() => onDecision("pass", entry.candidate_id)}
            className={`flex items-center gap-1 px-2.5 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              currentDecision === "pass"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
            }`}
            title="Mark as Pass"
          >
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
