"use client";

import React from "react";
import { Quote, Tag, AlertCircle } from "lucide-react";
import type {
  EvaluatedExperienceRequirement,
  EvaluatedEducationRequirement,
  SkillEvaluatorOutput,
  LogisticsEvaluatorOutput,
  EvidentiaryDotType,
} from "../evaluators";
import { Tooltip } from "@/components/ui/Tooltip";

export type { EvidentiaryDotType };

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

function getBadgeStyles(variant: EvidentiaryDotType) {
  switch (variant) {
    case "confirmed":
      return "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold";
    case "contradicted":
      return "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold";
    case "gap":
    case "not_stated":
    default:
      return "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold";
  }
}

export interface BlockingStripProps {
  experience: EvaluatedExperienceRequirement;
  skills: SkillEvaluatorOutput;
  education: EvaluatedEducationRequirement;
  logistics: LogisticsEvaluatorOutput;
}

export function BlockingStrip({
  experience,
  skills,
  education,
  logistics,
}: BlockingStripProps) {
  // 1. Skills
  const {
    statedSkills,
    notStatedSkills,
    totalSkillsCount,
    notStatedCount,
    orphanSkillsFormatted,
    orphanSkillsCount,
    derived: skillsDerived,
  } = skills;

  // 2. Logistics
  const {
    compensation,
    noticePeriod,
    workMode,
    location,
    missingLogistics,
    derived: logisticsDerived,
  } = logistics;

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
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${getBadgeStyles(
                      experience.derived.dotType
                    )}`}
                  >
                    {experience.derived.badgeText}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {experience.reasoning}
                </div>
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                experience.derived.dotType
              )}`}
            >
              <EvidentiaryDot type={experience.derived.dotType} />
              <span>{experience.derived.pillText}</span>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Category 2: Skills */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          skills
        </div>

        {/* Required & Preferred Technical Stack Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {statedSkills.map((skill) => (
            <Tooltip
              key={skill.id}
              content={
                <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                  <div className="flex items-center justify-between gap-2 font-bold text-on-surface">
                    <span>{skill.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${getBadgeStyles(
                        skill.derived.dotType
                      )}`}
                    >
                      {skill.derived.badgeText}
                    </span>
                  </div>

                  {skill.hasOutcome && (
                    <div className="text-[11px] text-blue-900 dark:text-blue-200 font-medium bg-surface-container p-2 rounded-lg border-l-2 border-primary">
                      &ldquo;{skill.outcome_attached}&rdquo;
                    </div>
                  )}

                  {skill.evidence_span ? (
                    <div className="text-[11px] text-on-surface-variant italic">
                      &ldquo;{skill.evidence_span}&rdquo;
                    </div>
                  ) : skill.isOrphan ? (
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
                  skill.derived.dotType
                )}`}
              >
                <EvidentiaryDot type={skill.derived.dotType} />
                <span>{skill.derived.pillText}</span>
                {skill.hasOutcome && (
                  <Quote
                    className="h-2.5 w-2.5 text-blue-700 dark:text-blue-300 shrink-0"
                    aria-label="Outcome attached"
                  />
                )}
                {skill.isOrphan && (
                  <Tag
                    className="h-2.5 w-2.5 text-amber-700 dark:text-amber-300 shrink-0"
                    aria-label="Self-reported only"
                  />
                )}
              </span>
            </Tooltip>
          ))}

          {/* Collapsed Not-Stated Skills Exception */}
          {notStatedCount > 0 && (
            <Tooltip
              content={
                <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                  <div className="font-bold text-on-surface">
                    Unstated Required Skills ({notStatedCount} of {totalSkillsCount})
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
                <span>+{notStatedCount} unstated</span>
              </span>
            </Tooltip>
          )}
        </div>

        {/* Unverified Claims Subsection */}
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
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${getBadgeStyles(
                      skillsDerived.unverifiedClaimsDotType
                    )}`}
                  >
                    {skillsDerived.unverifiedClaimsBadgeText}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {orphanSkillsCount === 0
                    ? "All declared skills are corroborated with active verbs in work history."
                    : "Declared in resume skills list, but not corroborated with action verbs in work history:"}
                </div>
                {orphanSkillsCount > 0 && (
                  <div className="text-[11px] font-mono text-on-surface pt-1 border-t border-outline-variant/40">
                    {orphanSkillsFormatted}
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                skillsDerived.unverifiedClaimsDotType
              )}`}
            >
              <EvidentiaryDot type={skillsDerived.unverifiedClaimsDotType} />
              <span>{skillsDerived.unverifiedClaimsPillText}</span>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Category 3: Education */}
      {education.hasEducation && (
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
                    {education.reasoning}
                  </div>
                </div>
              }
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                  education.derived.dotType
                )}`}
              >
                <EvidentiaryDot type={education.derived.dotType} />
                <span>{education.derived.pillText}</span>
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
          {/* Logistics Status Pill */}
          <Tooltip
            content={
              <div className="text-xs space-y-1.5 max-w-xs p-0.5">
                <div className="flex items-center justify-between gap-2 font-bold text-on-surface">
                  <span>Logistics Status</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${getBadgeStyles(
                      logisticsDerived.statusDotType
                    )}`}
                  >
                    {logisticsDerived.statusBadgeText}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {missingLogistics.length === 0
                    ? "All logistics details have been provided."
                    : "Unstated candidate logistics for recruiter follow-up:"}
                </div>
                {missingLogistics.length > 0 && (
                  <ul className="list-disc list-inside text-on-surface-variant text-[11px] mt-1 space-y-0.5">
                    {missingLogistics.map((itemStr, idx) => (
                      <li key={idx}>{itemStr}</li>
                    ))}
                  </ul>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                logisticsDerived.statusDotType
              )}`}
            >
              <EvidentiaryDot type={logisticsDerived.statusDotType} />
              <span>{logisticsDerived.statusPillText}</span>
            </span>
          </Tooltip>

          {/* Compensation Pill */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs p-0.5">
                <div className="font-bold text-on-surface">Compensation Assessment</div>
                <div className="text-[11px] text-on-surface-variant">{compensation.reasoning}</div>
                {compensation.evidence_span && (
                  <div className="text-[10px] text-on-surface-variant/80 border-t border-outline-variant/40 pt-1">
                    Stated: &ldquo;{compensation.evidence_span}&rdquo;
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                compensation.derived.dotType
              )}`}
            >
              <EvidentiaryDot type={compensation.derived.dotType} />
              <span>{compensation.derived.pillText}</span>
            </span>
          </Tooltip>

          {/* Notice Period Pill */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs p-0.5">
                <div className="font-bold text-on-surface">Notice Period</div>
                <div className="text-[11px] text-on-surface-variant">
                  {noticePeriod.reasoning}
                </div>
                {noticePeriod.evidence_span && (
                  <div className="text-[10px] text-on-surface-variant/80 border-t border-outline-variant/40 pt-1">
                    Stated: &ldquo;{noticePeriod.evidence_span}&rdquo;
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                noticePeriod.derived.dotType
              )}`}
            >
              <EvidentiaryDot type={noticePeriod.derived.dotType} />
              <span>{noticePeriod.derived.pillText}</span>
            </span>
          </Tooltip>

          {/* Work Mode Pill */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs p-0.5">
                <div className="font-bold text-on-surface">Work Mode</div>
                <div className="text-[11px] text-on-surface-variant">{workMode.reasoning}</div>
                {workMode.evidence_span && (
                  <div className="text-[10px] text-on-surface-variant/80 border-t border-outline-variant/40 pt-1">
                    {workMode.evidence_span}
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                workMode.derived.dotType
              )}`}
            >
              <EvidentiaryDot type={workMode.derived.dotType} />
              <span>{workMode.derived.pillText}</span>
            </span>
          </Tooltip>

          {/* Location Pill */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs p-0.5">
                <div className="font-bold text-on-surface">Location</div>
                <div className="text-[11px] text-on-surface-variant">{location.reasoning}</div>
                {location.evidence_span && (
                  <div className="text-[10px] text-on-surface-variant/80 border-t border-outline-variant/40 pt-1">
                    Stated: &ldquo;{location.evidence_span}&rdquo;
                  </div>
                )}
              </div>
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-help ${getPillStyles(
                location.derived.dotType
              )}`}
            >
              <EvidentiaryDot type={location.derived.dotType} />
              <span>{location.derived.pillText}</span>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
