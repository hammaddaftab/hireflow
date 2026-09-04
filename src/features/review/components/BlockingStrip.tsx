"use client";

import React from "react";
import { Quote, Tag, AlertCircle } from "lucide-react";
import { CandidateReviewItem } from "../types";
import { getCompensationAssessment } from "../reviewQueueService";
import { Tooltip } from "@/components/ui/Tooltip";

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

function getPillStyles(status: EvidentiaryDotType) {
  switch (status) {
    case "confirmed":
      return "bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border-blue-200/90 dark:border-blue-800/60";
    case "gap":
      return "bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-200/90 dark:border-amber-800/60";
    case "contradicted":
      return "bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-rose-200/90 dark:border-rose-800/60";
    case "not_stated":
    default:
      return "bg-surface-container/40 text-on-surface-variant border-dashed border-outline-variant/60";
  }
}

export interface BlockingStripProps {
  item: CandidateReviewItem;
}

export function BlockingStrip({ item }: BlockingStripProps) {
  const { candidate, blockingItems, verifiedYearsExperience } = item;

  // 1. Experience
  const minYears = 5;
  const isExpConfirmed = verifiedYearsExperience >= minYears;
  const expDotType: EvidentiaryDotType = isExpConfirmed ? "confirmed" : "gap";

  // 2. Skills Analysis
  const skillItems = blockingItems.filter(
    (i) => i.category === "skill" || i.category === "dealbreaker"
  );
  const totalSkills = skillItems.length;

  const notStatedSkills = skillItems.filter(
    (i) => i.status === "not_stated" || i.status === "unparseable"
  );
  const statedSkills = skillItems.filter(
    (i) => i.status !== "not_stated" && i.status !== "unparseable"
  );

  // 3. Compensation Assessment
  const compAssessment = getCompensationAssessment(
    candidate.logistics.salary_expectation,
    item.compensationBand
  );

  // 4. Education (if blocking)
  const eduItem = blockingItems.find((i) => i.id === "req_edu");
  const eduDotType: EvidentiaryDotType = eduItem
    ? eduItem.status === "confirmed"
      ? "confirmed"
      : eduItem.status === "ambiguous"
      ? "gap"
      : "contradicted"
    : "confirmed";

  // 5. Notice Period
  const noticeItem = blockingItems.find((i) => i.id === "req_notice");
  const noticeRaw = candidate.logistics.notice_period.raw;
  const noticeDotType: EvidentiaryDotType = noticeItem
    ? noticeItem.status === "confirmed"
      ? "confirmed"
      : "gap"
    : noticeRaw
    ? "confirmed"
    : "not_stated";

  return (
    <div className="w-full space-y-3.5 text-xs">
      {/* Category 1: Experience */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          experience
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs p-0.5">
                <div className="flex items-center justify-between gap-2 font-bold text-on-surface">
                  <span>Experience Requirement</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isExpConfirmed
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold"
                        : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold"
                    }`}
                  >
                    {isExpConfirmed ? "Confirmed" : "Gap"}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {verifiedYearsExperience > 0
                    ? `${verifiedYearsExperience} yrs verified full-time experience across ${candidate.work_history.entries.length} roles · Job bar requires ${minYears}+ yrs.`
                    : `0 yrs verified full-time experience · Job bar requires ${minYears}+ yrs.`}
                </div>
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                expDotType
              )}`}
            >
              <EvidentiaryDot type={expDotType} />
              <span>
                {isExpConfirmed
                  ? `${verifiedYearsExperience} yrs verified experience · needs ${minYears}+`
                  : `${verifiedYearsExperience} / ${minYears} yrs exp`}
              </span>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Category 2: Skills */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          skills
        </div>

        {/* Required Technical Stack Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {statedSkills.map((skill) => {
            const normLabel = skill.label.toLowerCase();
            const demonstrated = candidate.skills_demonstrated.skills.find(
              (s) => s.skill.toLowerCase() === normLabel
            );

            const hasOutcome = Boolean(demonstrated?.outcome_attached);
            const outcomeText = demonstrated?.outcome_attached || null;
            const evidenceSpan = demonstrated?.evidence_span || skill.evidence_span;

            const isOrphan =
              item.orphanSkillsList.some((s) => s.toLowerCase() === normLabel) ||
              skill.status === "ambiguous" ||
              demonstrated?.syntactic_tier === "context_listed";

            const dotType: EvidentiaryDotType =
              skill.status === "confirmed"
                ? "confirmed"
                : skill.status === "contradicted"
                ? "contradicted"
                : "gap";

            return (
              <Tooltip
                key={skill.id}
                content={
                  <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                    <div className="flex items-center justify-between gap-2 font-bold text-on-surface">
                      <span>{skill.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          hasOutcome
                            ? "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold"
                            : isOrphan
                            ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold"
                            : skill.status === "contradicted"
                            ? "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold"
                            : "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold"
                        }`}
                      >
                        {hasOutcome
                          ? "Outcome Attached"
                          : isOrphan
                          ? "Self-Reported Only"
                          : skill.status === "confirmed"
                          ? "Confirmed"
                          : skill.status === "contradicted"
                          ? "Contradicted"
                          : "2nd Look"}
                      </span>
                    </div>

                    {hasOutcome && outcomeText && (
                      <div className="text-[11px] text-blue-900 dark:text-blue-200 font-medium bg-surface-container p-2 rounded-lg border-l-2 border-primary">
                        &ldquo;{outcomeText}&rdquo;
                      </div>
                    )}

                    {evidenceSpan ? (
                      <div className="text-[11px] text-on-surface-variant italic">
                        &ldquo;{evidenceSpan}&rdquo;
                      </div>
                    ) : isOrphan ? (
                      <div className="text-[11px] text-on-surface-variant">
                        Declared in resume skills list, but not corroborated with action verbs in work history.
                      </div>
                    ) : skill.reasoning ? (
                      <div className="text-[11px] text-on-surface-variant">
                        {skill.reasoning}
                      </div>
                    ) : null}
                  </div>
                }
              >
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                    dotType
                  )}`}
                >
                  <EvidentiaryDot type={dotType} />
                  <span>{skill.label}</span>
                  {hasOutcome && (
                    <Quote
                      className="h-2.5 w-2.5 text-blue-700 dark:text-blue-300 shrink-0"
                      aria-label="Outcome attached"
                    />
                  )}
                  {isOrphan && (
                    <Tag
                      className="h-2.5 w-2.5 text-amber-700 dark:text-amber-300 shrink-0"
                      aria-label="Self-reported only"
                    />
                  )}
                  {skill.status === "contradicted" && (
                    <AlertCircle
                      className="h-2.5 w-2.5 text-rose-600 dark:text-rose-400 shrink-0"
                      aria-label="Contradicted"
                    />
                  )}
                </span>
              </Tooltip>
            );
          })}

          {/* Collapsed Not-Stated Skills Exception */}
          {notStatedSkills.length > 0 && (
            <Tooltip
              content={
                <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                  <div className="font-bold text-on-surface">
                    Unstated Required Skills ({notStatedSkills.length} of {totalSkills})
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    The following mandatory skills were not found in the candidate resume:
                  </div>
                  <ul className="list-disc list-inside text-[11px] font-mono text-on-surface space-y-0.5">
                    {notStatedSkills.map((s) => (
                      <li key={s.id}>{s.label}</li>
                    ))}
                  </ul>
                </div>
              }
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                  "not_stated"
                )}`}
              >
                <EvidentiaryDot type="not_stated" />
                <span>+{notStatedSkills.length} unstated</span>
              </span>
            </Tooltip>
          )}
        </div>

        {/* Unverified Claims Subsection (distinct other section inside skills) */}
        <div className="pt-1.5 flex flex-wrap items-center gap-2 border-t border-outline-variant/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            other:
          </span>
          <Tooltip
            content={
              <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                <div className="flex items-center justify-between gap-2 font-bold text-on-surface">
                  <span>Unverified Claims</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      item.orphanSkillsCount === 0
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                        : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {item.orphanSkillsCount === 0 ? "Satisfied" : "Gap"}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {item.orphanSkillsCount === 0
                    ? "All declared skills are corroborated with active verbs in work history."
                    : "Declared in resume skills list, but not corroborated with action verbs in work history:"}
                </div>
                {item.orphanSkillsCount > 0 && (
                  <div className="text-[11px] font-mono text-on-surface pt-1 border-t border-outline-variant/40">
                    {item.orphanSkillsList.slice(0, 6).join(", ")}
                    {item.orphanSkillsList.length > 6 && ` +${item.orphanSkillsList.length - 6} more`}
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${
                item.orphanSkillsCount === 0
                  ? getPillStyles("confirmed")
                  : getPillStyles("gap")
              }`}
            >
              <EvidentiaryDot type={item.orphanSkillsCount === 0 ? "confirmed" : "gap"} />
              <span>
                {item.orphanSkillsCount === 0
                  ? "all claims verified"
                  : `${item.orphanSkillsCount} unverified ${item.orphanSkillsCount === 1 ? "claim" : "claims"}`}
              </span>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Category 3: Education (if blocking) */}
      {eduItem && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            education
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip
              content={
                <div className="text-xs space-y-1 max-w-xs p-0.5">
                  <div className="font-bold text-on-surface">Education Requirement</div>
                  <div className="text-[11px] text-on-surface-variant">
                    {candidate.education.entries[0]
                      ? `${candidate.education.entries[0].degree_level.raw}${
                          candidate.education.entries[0].is_current ? " (in progress)" : ""
                        } · required Bachelors`
                      : "No degree stated · required Bachelors"}
                  </div>
                </div>
              }
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                  eduDotType
                )}`}
              >
                <EvidentiaryDot type={eduDotType} />
                <span>
                  {candidate.education.entries[0]?.degree_level.normalized || "Bachelors"}
                </span>
              </span>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Category 4: Logistics */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          logistics
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Logistics Status Pill (all logistics provided vs fields missing) */}
          <Tooltip
            content={
              <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                <div className="flex items-center justify-between gap-2 font-bold text-on-surface">
                  <span>Logistics Status</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      item.logisticsNotStatedCount === 0
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                        : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {item.logisticsNotStatedCount === 0 ? "Satisfied" : "Gap"}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {item.logisticsNotStatedCount === 0
                    ? "All logistics details (salary, notice period, location) have been provided."
                    : "Unstated candidate logistics for recruiter follow-up:"}
                </div>
                {item.logisticsNotStatedCount > 0 && (
                  <ul className="list-disc list-inside text-on-surface-variant text-[11px] mt-1 space-y-0.5">
                    {item.logisticsNotStatedList.map((itemStr, idx) => (
                      <li key={idx}>{itemStr}</li>
                    ))}
                  </ul>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${
                item.logisticsNotStatedCount === 0
                  ? getPillStyles("confirmed")
                  : getPillStyles("gap")
              }`}
            >
              <EvidentiaryDot type={item.logisticsNotStatedCount === 0 ? "confirmed" : "gap"} />
              <span>
                {item.logisticsNotStatedCount === 0
                  ? "all logistics provided"
                  : `${item.logisticsNotStatedCount} logistics ${item.logisticsNotStatedCount === 1 ? "field" : "fields"} missing`}
              </span>
            </span>
          </Tooltip>

          {/* Compensation Pill */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs p-0.5">
                <div className="font-bold text-on-surface">Compensation Assessment</div>
                <div className="text-[11px] text-on-surface-variant">{compAssessment.text}</div>
                {candidate.logistics.salary_expectation.raw && (
                  <div className="text-[10px] text-on-surface-variant/80 border-t border-outline-variant/40 pt-1">
                    Stated: &ldquo;{candidate.logistics.salary_expectation.raw}&rdquo;
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                compAssessment.dotType
              )}`}
            >
              <EvidentiaryDot type={compAssessment.dotType} />
              <span>{compAssessment.text}</span>
            </span>
          </Tooltip>

          {/* Notice Period Pill */}
          {(noticeRaw || noticeItem) && (
            <Tooltip
              content={
                <div className="text-xs space-y-1 max-w-xs p-0.5">
                  <div className="font-bold text-on-surface">Notice Period</div>
                  <div className="text-[11px] text-on-surface-variant">
                    {noticeRaw
                      ? `Candidate stated: "${noticeRaw}"`
                      : "Notice period not stated"}
                    {noticeItem ? " · Required <= 1 mo" : ""}
                  </div>
                </div>
              }
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                  noticeDotType
                )}`}
              >
                <EvidentiaryDot type={noticeDotType} />
                <span>{noticeRaw ? `${noticeRaw} notice` : "notice unstated"}</span>
              </span>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
