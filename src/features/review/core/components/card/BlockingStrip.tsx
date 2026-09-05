"use client";

import React from "react";
import { Quote, Tag, AlertCircle } from "lucide-react";
import type {
  EvaluatedExperienceRequirement,
  EvaluatedEducationRequirement,
  EvidentiaryDotType,
} from "../../evaluators/evaluationStatuses";
import type { SkillEvaluatorOutput } from "../../evaluators/skillEvaluator";
import type { LogisticsEvaluatorOutput } from "../../evaluators/logisticsEvaluator";
import { Tooltip } from "@/components/ui/Tooltip";
import { EvidentiaryDot } from "./EvidentiaryDot";
import { getPillStyles, getBadgeStyles } from "../../utils/evidentiaryStyles";

export { EvidentiaryDot };
export type { EvidentiaryDotType };

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
