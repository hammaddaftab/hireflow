// Top Candidate Card rendering natural rank recommendation, why they stand out, resume proof, and review actions

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

// Strips internal bracket citation codes like [c1], [s2], [header], [work_1] from prose
function cleanProseText(text: string): string {
  return text
    .replace(/\s*\[(?:[cs]\d+|work_\d+|header)(?:,\s*(?:[cs]\d+|work_\d+|header))*\]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Converts a machine digest line into a natural, human-readable highlight title
function formatClaimHeadline(digestLine: string | null | undefined): string | null {
  if (!digestLine) return null;
  let line = digestLine.trim();

  // Handle header line
  if (/^\[cand_[^\]]+\]/i.test(line)) {
    return line.replace(/^\[cand_[^\]]+\]\s*/i, "").replace(/\|/g, "•").trim();
  }

  // Handle work_N line: "work_1: Role @ Employer (2024-2024, 0.3y internship)"
  if (/^work_\d+:\s*/i.test(line)) {
    return line
      .replace(/^work_\d+:\s*/i, "")
      .replace(/\s*@\s*/g, " at ")
      .replace(/,\s*[\d.]+y\s+internship/gi, "")
      .trim();
  }

  // Strip leading [c1:action] or [s2:peripheral] tag
  line = line.replace(/^\[[^\]]+\]\s*/, "").trim();

  // Check if line follows "Context: nouns -> action | outcome" or "nouns -> action | outcome"
  if (line.includes("->")) {
    const [leftRaw, rightRaw] = line.split("->").map((s) => s.trim());
    let categoryPrefix = "";
    let toolsList = leftRaw;

    if (leftRaw.includes(":")) {
      const colonIdx = leftRaw.indexOf(":");
      categoryPrefix = leftRaw.slice(0, colonIdx).trim();
      toolsList = leftRaw.slice(colonIdx + 1).trim();
    }

    const [actionPart, outcomePart] = (rightRaw || "").split("|").map((s) => s.trim());
    const cleanAction = actionPart
      ? actionPart.charAt(0).toUpperCase() + actionPart.slice(1)
      : "";

    const parts: string[] = [];
    if (categoryPrefix) {
      parts.push(`${categoryPrefix}: ${cleanAction}`);
    } else if (cleanAction) {
      parts.push(cleanAction);
    }

    if (outcomePart) {
      parts.push(`— ${outcomePart}`);
    } else if (toolsList) {
      const shortTools = toolsList.split(",").slice(0, 3).map((t) => t.trim()).join(", ");
      if (shortTools) {
        parts.push(`(${shortTools})`);
      }
    }

    return parts.join(" ").trim();
  }

  return line.replace(/\s*\|\s*/g, " — ").trim();
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

  // Derive years of experience or internship count
  const expYears = queueItem ? getCandidateExperienceYears(queueItem) : null;
  const expLabel =
    expYears !== null && expYears > 0
      ? `${expYears} yrs FT`
      : workEntries.length > 0
      ? `${workEntries.length} ${workEntries.length === 1 ? "internship" : "internships"}`
      : null;

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
          salaryReq.max && salaryReq.max !== salaryReq.min
            ? ` - ${formatSalaryNumber(salaryReq.max)}`
            : ""
        }/mo`
      : "Salary unstated";

  const currentDecision = queueItem?.decision || "pending";
  const totalMatchups =
    entry.pairwise_wins + entry.pairwise_ties + entry.pairwise_losses;

  const rankBadgeLabel =
    entry.status === "contested"
      ? `Tied for #${entry.rank}`
      : entry.rank === 1
      ? "#1 Top Pick"
      : entry.rank === 2
      ? "#2 Runner-Up"
      : `#${entry.rank} Pick`;

  // Filter out empty header claims when rich evidence claims exist
  const rawClaims = entry.supporting_claims || [];
  const nonHeaderClaims = rawClaims.filter(
    (c) => c.ref_id !== "header" && Boolean(c.evidence_span || c.digest_line)
  );
  const displayClaims = nonHeaderClaims.length > 0 ? nonHeaderClaims : rawClaims;

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
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                entry.status === "contested"
                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30"
                  : entry.rank === 1
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-surface-container-high text-on-surface border-outline-variant/40"
              }`}
            >
              {rankBadgeLabel}
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
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                Clear Match
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Close Call — Compare Below
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant font-medium mb-3.5 pb-3 border-b border-outline-variant/30">
          {expLabel && (
            <>
              <span className="font-semibold text-on-surface">{expLabel}</span>
              <span>•</span>
            </>
          )}
          <span className="truncate max-w-[220px]">{eduText}</span>
          <span>•</span>
          <span>{city}</span>
          <span>•</span>
          <span className="font-mono text-[11px]">{salaryText}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-container/70 border border-outline-variant/30 text-xs mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-medium text-[11px]">
              Head-to-Head vs. Finalists:
            </span>
            <span className="font-semibold text-on-surface">
              {entry.status === "confident"
                ? `Won ${entry.pairwise_wins} of ${totalMatchups} comparisons`
                : `Evenly matched (${entry.pairwise_wins}W - ${entry.pairwise_ties}T - ${entry.pairwise_losses}L)`}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold ${
              entry.status === "confident"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {entry.status === "confident"
              ? `Consistent #${entry.rank} across reading orders`
              : "Tied depending on reading order"}
          </span>
        </div>

        <div className="text-xs leading-relaxed text-on-surface mb-3.5 bg-surface/60 p-3.5 rounded-xl border border-outline-variant/30">
          <p className="font-bold mb-1 text-[11px] uppercase tracking-wider text-primary">
            Why They Stand Out
          </p>
          <p className="text-on-surface/90 leading-relaxed">
            {cleanProseText(entry.headline_rationale)}
          </p>
        </div>

        {entry.contested_with && (
          <div className="mb-3.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">How to Choose Between Them</p>
                <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  {cleanProseText(entry.contested_with)}
                </p>
              </div>
            </div>
          </div>
        )}

        {displayClaims.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
              Key Proof from Their Resume ({displayClaims.length})
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {displayClaims.map((claim, idx) => {
                const formattedTitle = formatClaimHeadline(claim.digest_line);
                return (
                  <div
                    key={`${claim.candidate_id}-${claim.ref_id}-${idx}`}
                    className="p-2.5 rounded-xl bg-surface/70 border border-outline-variant/30 text-xs space-y-1.5"
                  >
                    {formattedTitle && (
                      <div className="font-semibold text-on-surface text-[11px] leading-snug">
                        {formattedTitle}
                      </div>
                    )}
                    {claim.evidence_span ? (
                      <blockquote className="border-l-2 border-primary/50 pl-2.5 text-[11px] italic text-on-surface-variant leading-relaxed bg-surface-container/30 py-1 rounded-r">
                        &quot;{claim.evidence_span}&quot;
                      </blockquote>
                    ) : (
                      <p className="text-[11px] text-on-surface-variant/80 italic pl-1">
                        Verified from education and career history on resume.
                      </p>
                    )}
                  </div>
                );
              })}
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
          title={`View ${candidateName}'s full resume & profile`}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span>View Full Resume</span>
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
