// Top Candidate Card rendering natural rank recommendation, why they stand out, resume proof, and review actions

import React from "react";
import { Check, Flag, XCircle, ExternalLink } from "lucide-react";
import type { TopCandidateEntry } from "@/entities/extraction/matching/topCandidatesRanking";
import type { CandidateReviewItem } from "../types";
import type { ReviewDecision } from "@/entities/review";
import { getCandidateExperienceYears } from "../core/utils/queueCalculations";

export interface TopCandidateCardProps {
  entry: TopCandidateEntry;
  queueItem?: CandidateReviewItem | null;
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

// Converts a machine digest line into a natural, human-readable highlight title
function formatClaimHeadline(digestLine: string | null | undefined): string | null {
  if (!digestLine) return null;
  let line = digestLine.trim();

  if (/^\[cand_[^\]]+\]/i.test(line)) {
    return line.replace(/^\[cand_[^\]]+\]\s*/i, "").replace(/\|/g, "•").trim();
  }

  if (/^work_\d+:\s*/i.test(line)) {
    return line
      .replace(/^work_\d+:\s*/i, "")
      .replace(/\s*@\s*/g, " at ")
      .replace(/,\s*[\d.]+y\s+internship/gi, "")
      .trim();
  }

  line = line.replace(/^\[[^\]]+\]\s*/, "").trim();

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
}: TopCandidateCardProps) {
  const candidate = queueItem?.candidate;
  const candidateName = candidate?.identity?.name || entry.candidate_id;

  // Derive current role and employer
  const workEntries = candidate?.work_history?.entries || [];
  const currentWork =
    workEntries.find((e) => e.is_current) ||
    workEntries[0];
  const roleTitle = currentWork ? `${currentWork.title} at ${currentWork.employer}` : "Software Engineer";

  // Derive experience label
  const expYears = queueItem ? getCandidateExperienceYears(queueItem) : null;
  const expLabel =
    workEntries.length > 0 && (expYears === null || expYears < 1)
      ? `${workEntries.length} ${workEntries.length === 1 ? "internship" : "internships"}`
      : expYears !== null && expYears > 0
      ? `${expYears} yrs experience`
      : null;

  // Derive concise education label
  const primaryEdu = candidate?.education?.entries?.[0];
  const rawInst = primaryEdu?.institution?.raw || primaryEdu?.institution?.normalized || "";
  const shortInst = /nust|national university of sciences and technology/i.test(rawInst)
    ? "NUST"
    : rawInst || "University";
  const rawDegree = primaryEdu?.degree_level?.raw || "BSc CS";
  const eduLabel = `${rawDegree}, ${shortInst}`;

  // Derive city
  const city =
    candidate?.identity?.location?.normalized?.city ||
    candidate?.identity?.location?.raw ||
    null;

  const metaParts = [eduLabel, city, expLabel].filter(Boolean);

  const currentDecision = queueItem?.decision || "pending";
  const totalMatchups =
    entry.pairwise_wins + entry.pairwise_ties + entry.pairwise_losses;

  const rankBadgeLabel =
    entry.status === "contested"
      ? `Tied #${entry.rank}`
      : `#${entry.rank} Pick`;

  const rawClaims = entry.supporting_claims || [];
  const nonHeaderClaims = rawClaims.filter(
    (c) => c.ref_id !== "header" && Boolean(c.evidence_span || c.digest_line)
  );
  const displayClaims = (nonHeaderClaims.length > 0 ? nonHeaderClaims : rawClaims).slice(0, 3);
  const resumePdfUrl = candidate?.source_document?.url || null;

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5 flex flex-col justify-between">
      <div>
        <div className="pb-3 mb-3.5 border-b border-outline-variant/25">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`shrink-0 whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  entry.rank === 1
                    ? "bg-primary/15 text-primary"
                    : "bg-surface-container-high text-on-surface"
                }`}
              >
                {rankBadgeLabel}
              </span>
              <h3 className="text-base font-bold text-on-surface tracking-tight truncate">
                {candidateName}
              </h3>
            </div>

            <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-on-surface-variant">
              {entry.status === "confident"
                ? `Won ${entry.pairwise_wins}/${totalMatchups} matchups`
                : `Tied (${entry.pairwise_wins}W–${entry.pairwise_losses}L)`}
            </span>
          </div>

          <p className="text-xs text-on-surface font-medium truncate mt-1.5" title={roleTitle}>
            {roleTitle}
          </p>

          <p className="text-xs text-on-surface-variant truncate mt-0.5">
            {metaParts.join(" • ")}
          </p>
        </div>

        <p className="text-xs sm:text-[13px] text-on-surface leading-relaxed mb-3.5">
          {cleanProseText(entry.headline_rationale)}
        </p>

        {entry.contested_with && (
          <div className="mb-3.5 pl-3 border-l-2 border-outline-variant text-xs text-on-surface-variant leading-relaxed">
            <span className="font-semibold text-on-surface">How to choose: </span>
            {cleanProseText(entry.contested_with)}
          </div>
        )}

        {displayClaims.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-on-surface-variant">
              Key Resume Proof
            </p>
            <div className="space-y-2.5">
              {displayClaims.map((claim, idx) => {
                const formattedTitle = formatClaimHeadline(claim.digest_line);
                return (
                  <div
                    key={`${claim.candidate_id}-${claim.ref_id}-${idx}`}
                    className="border-l-2 border-outline-variant/50 pl-3 py-0.5 space-y-0.5"
                  >
                    {formattedTitle && (
                      <p className="text-xs font-medium text-on-surface truncate" title={formattedTitle}>
                        {formattedTitle}
                      </p>
                    )}
                    {claim.evidence_span && (
                      <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                        &ldquo;{claim.evidence_span}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-outline-variant/25 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onJumpToCandidate(entry.candidate_id)}
            className="h-7 px-2.5 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            title={`Jump to ${candidateName} in review queue`}
          >
            View in Queue
          </button>

          {resumePdfUrl && (
            <a
              href={resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title={`Open ${candidateName}'s PDF resume`}
            >
              <span>Resume PDF</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDecision("keep", entry.candidate_id)}
            className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              currentDecision === "keep"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high"
            }`}
            title="Mark as Keep"
          >
            <Check className="h-3 w-3 shrink-0" />
            <span>Keep</span>
          </button>

          <button
            type="button"
            onClick={() => onDecision("flag", entry.candidate_id)}
            className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              currentDecision === "flag"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high"
            }`}
            title="Mark as Flagged"
          >
            <Flag className="h-3 w-3 shrink-0" />
            <span>Flag</span>
          </button>

          <button
            type="button"
            onClick={() => onDecision("pass", entry.candidate_id)}
            className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              currentDecision === "pass"
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high"
            }`}
            title="Mark as Pass"
          >
            <XCircle className="h-3 w-3 shrink-0" />
            <span>Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
