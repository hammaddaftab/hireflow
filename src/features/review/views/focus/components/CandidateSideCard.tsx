"use client";

import React, { memo } from "react";
import { Building2, MapPin, Briefcase, FileText, GraduationCap } from "lucide-react";
import type { CandidateReviewItem } from "../../../types";
import { DECISION_CONFIGS, useRelativeTime } from "../../../core/utils/decisionStyles";

export interface CandidateSideCardProps {
  item: CandidateReviewItem;
}

// Lightweight static preview card for side slots with consistent aspect ratio
export const CandidateSideCard = memo(function CandidateSideCard({
  item,
}: CandidateSideCardProps) {
  const { candidate } = item;
  const currentRole = candidate.work_history.entries[0];
  const primaryEducation = candidate.education.entries[0];
  const normalizedCity = candidate.identity.location.normalized?.city || "Unspecified";

  const isDecided = item.decision !== "pending";
  const decisionConfig = DECISION_CONFIGS[item.decision];
  const DecisionIcon = decisionConfig.icon;
  const relativeTime = useRelativeTime(item.decidedAt);

  return (
    <div
      className={`relative h-[440px] sm:h-[460px] p-6 rounded-2xl border border-outline-variant/50 dark:border-outline-variant/30 shadow-md bg-surface/90 dark:bg-surface/90 flex flex-col justify-between select-none overflow-hidden transition-all duration-200 ${
        isDecided ? decisionConfig.surfaceWash : ""
      } ${
        item.decision === "pass"
          ? "opacity-70 grayscale-[60%] group-hover:opacity-100 group-hover:grayscale-0"
          : ""
      }`}
    >
      {/* 3px Top Decision Color Band */}
      {isDecided && (
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] ${decisionConfig.indicatorColor}`}
        />
      )}

      {/* Header Info */}
      <div className="space-y-3 pt-1">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold tracking-tight text-on-surface truncate">
              {candidate.identity.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface">
              <MapPin className="h-3 w-3 text-on-surface-variant shrink-0" />
              <span>{normalizedCity}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap pt-0.5">
            {currentRole && (
              <span className="flex items-center gap-1 font-semibold text-on-surface">
                <Briefcase className="h-3 w-3 text-on-surface-variant shrink-0" />
                <span className="truncate max-w-[200px]">{currentRole.title}</span>
              </span>
            )}
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="h-3 w-3 text-on-surface-variant shrink-0" />
              <span>{item.verifiedYearsExperience} yrs exp</span>
            </span>
            {candidate.source_document.url ? (
              <a
                href={candidate.source_document.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/70 hover:text-on-surface hover:underline cursor-pointer"
                title="View original resume document"
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[140px]">{candidate.source_document.filename}</span>
              </a>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/70">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[140px]">{candidate.source_document.filename}</span>
              </span>
            )}
          </div>

          {primaryEducation && (
            <div className="pt-1.5 text-xs text-on-surface-variant flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
              <span className="truncate max-w-[240px]">
                {primaryEducation.degree_level.normalized || primaryEducation.degree_level.raw} • {primaryEducation.institution.normalized || primaryEducation.institution.raw}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decision Status Bottom Footer Bar */}
      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant/70 font-mono">
        {isDecided ? (
          <span className={`font-semibold flex items-center gap-1.5 ${decisionConfig.textColor}`}>
            <DecisionIcon className="h-3 w-3 shrink-0" />
            <span>{decisionConfig.pastLabel}</span>
            {relativeTime && (
              <span className="text-on-surface-variant/60 font-normal">· {relativeTime}</span>
            )}
          </span>
        ) : (
          <span>Preview</span>
        )}
        <span>Click to focus</span>
      </div>
    </div>
  );
});
