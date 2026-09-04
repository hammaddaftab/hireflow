"use client";

import React from "react";
import { CandidateReviewItem } from "../types";
import { getCompensationAssessment } from "../reviewQueueService";

export type EvidentiaryDotType = "confirmed" | "gap" | "contradicted" | "not_stated";

export function EvidentiaryDot({ type }: { type: EvidentiaryDotType }) {
  switch (type) {
    case "confirmed":
      return (
        <span
          className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 inline-block"
          aria-hidden="true"
        />
      );
    case "gap":
      return (
        <span
          className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0 inline-block"
          aria-hidden="true"
        />
      );
    case "contradicted":
      return (
        <span
          className="w-2 h-2 rounded-full border-[1.5px] border-rose-600 dark:border-rose-400 bg-transparent shrink-0 inline-block"
          aria-hidden="true"
        />
      );
    case "not_stated":
    default:
      return (
        <span
          className="w-2 h-2 rounded-full border-[1.5px] border-dashed border-slate-400 dark:border-slate-500 bg-transparent shrink-0 inline-block"
          aria-hidden="true"
        />
      );
  }
}

export interface BlockingStripProps {
  item: CandidateReviewItem;
}

export function BlockingStrip({ item }: BlockingStripProps) {
  const { candidate, blockingItems, verifiedYearsExperience } = item;

  // 1. Experience
  const expItem = blockingItems.find((i) => i.category === "experience");
  const minYears = 5; // Job bar
  const isExpConfirmed = verifiedYearsExperience >= minYears;
  const expDotType: EvidentiaryDotType = isExpConfirmed ? "confirmed" : "gap";

  // 2. Skills (Exception Collapse)
  const skillItems = blockingItems.filter(
    (i) => i.category === "skill" || i.category === "dealbreaker"
  );
  const totalSkills = skillItems.length;
  const confirmedSkills = skillItems.filter((i) => i.status === "confirmed");
  const ambiguousSkills = skillItems.filter((i) => i.status === "ambiguous");
  const contradictedSkills = skillItems.filter((i) => i.status === "contradicted");
  const notStatedSkills = skillItems.filter(
    (i) => i.status === "not_stated" || i.status === "unparseable"
  );

  // 3. Compensation Row Calculation
  const compAssessment = getCompensationAssessment(
    candidate.logistics.salary_expectation,
    item.compensationBand
  );

  // 4. Education (if blocking)
  const eduItem = blockingItems.find((i) => i.id === "req_edu");

  // 5. Notice Period (if blocking)
  const noticeItem = blockingItems.find((i) => i.id === "req_notice");

  return (
    <div className="w-full space-y-2 text-xs">
      {/* Category 1: Experience */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[11px] font-medium text-on-surface-variant w-24 shrink-0">
          experience
        </span>
        <span className="inline-flex items-center gap-2 text-on-surface text-[13px]">
          <EvidentiaryDot type={expDotType} />
          <span>
            {verifiedYearsExperience > 0
              ? `${verifiedYearsExperience} yrs stated · needs ${minYears}+`
              : `0 stated · needs ${minYears}+`}
          </span>
        </span>
      </div>

      {/* Category 2: Skills (Exception-based Collapse) */}
      <div className="flex items-start gap-2.5 flex-wrap">
        <span className="text-[11px] font-medium text-on-surface-variant w-24 shrink-0 pt-0.5">
          skills
        </span>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] flex-1">
          {/* If all required skills are not stated, collapse to single count line */}
          {notStatedSkills.length === totalSkills ? (
            <span className="inline-flex items-center gap-2 text-on-surface-variant">
              <EvidentiaryDot type="not_stated" />
              <span>
                {totalSkills} of {totalSkills} required skills not stated
              </span>
            </span>
          ) : (
            <>
              {/* Confirmed skills named individually */}
              {confirmedSkills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 text-on-surface"
                >
                  <EvidentiaryDot type="confirmed" />
                  <span>{s.label}</span>
                </span>
              ))}

              {/* Ambiguous / Gap skills named individually */}
              {ambiguousSkills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 text-on-surface"
                >
                  <EvidentiaryDot type="gap" />
                  <span>{s.label} (claimed, not shown)</span>
                </span>
              ))}

              {/* Contradicted skills named individually */}
              {contradictedSkills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 text-on-surface"
                >
                  <EvidentiaryDot type="contradicted" />
                  <span>{s.label} (contradicted)</span>
                </span>
              ))}

              {/* Collapsed not stated count */}
              {notStatedSkills.length > 0 && (
                <span className="inline-flex items-center gap-2 text-on-surface-variant">
                  <EvidentiaryDot type="not_stated" />
                  <span>
                    {notStatedSkills.length} of {totalSkills} required skills not stated
                  </span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category 3: Compensation */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[11px] font-medium text-on-surface-variant w-24 shrink-0">
          compensation
        </span>
        <span className="inline-flex items-center gap-2 text-on-surface text-[13px]">
          <EvidentiaryDot type={compAssessment.dotType} />
          <span>{compAssessment.text}</span>
        </span>
      </div>

      {/* Category 4: Education (if blocking) */}
      {eduItem && (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-medium text-on-surface-variant w-24 shrink-0">
            education
          </span>
          <span className="inline-flex items-center gap-2 text-on-surface text-[13px]">
            <EvidentiaryDot
              type={
                eduItem.status === "confirmed"
                  ? "confirmed"
                  : eduItem.status === "ambiguous"
                  ? "gap"
                  : "contradicted"
              }
            />
            <span>
              {candidate.education.entries[0]
                ? `${candidate.education.entries[0].degree_level.raw}${
                    candidate.education.entries[0].is_current ? " (in progress)" : ""
                  } · required Bachelors`
                : "No degree stated · required Bachelors"}
            </span>
          </span>
        </div>
      )}

      {/* Category 5: Notice Period (if blocking) */}
      {noticeItem && (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-medium text-on-surface-variant w-24 shrink-0">
            notice period
          </span>
          <span className="inline-flex items-center gap-2 text-on-surface text-[13px]">
            <EvidentiaryDot
              type={noticeItem.status === "confirmed" ? "confirmed" : "gap"}
            />
            <span>
              {candidate.logistics.notice_period.raw || "Not stated"} · required &le; 1 mo
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
