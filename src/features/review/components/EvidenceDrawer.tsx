"use client";

import React, { useMemo } from "react";
import { X, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CandidateReviewItem, BlockingRequirementItem } from "../types";
import { EvidentiaryDot, EvidentiaryDotType } from "./BlockingStrip";
import { getCompensationAssessment } from "../reviewQueueService";

function getEvidentiaryDotType(status: string): EvidentiaryDotType {
  switch (status) {
    case "confirmed":
      return "confirmed";
    case "contradicted":
      return "contradicted";
    case "ambiguous":
    case "inferred":
      return "gap";
    case "not_stated":
    case "unparseable":
    default:
      return "not_stated";
  }
}

export interface EvidenceDrawerProps {
  item: CandidateReviewItem;
  onClose: () => void;
}

interface SkillEvidenceGroup {
  id: string;
  skills: BlockingRequirementItem[];
  evidenceSpan: string | null;
}

export function EvidenceDrawer({ item, onClose }: EvidenceDrawerProps) {
  const { candidate, blockingItems, verifiedYearsExperience } = item;

  const minYears = 5;
  const isExpConfirmed = verifiedYearsExperience >= minYears;

  const skillItems = blockingItems.filter(
    (i) => i.category === "skill" || i.category === "dealbreaker"
  );

  const compAssessment = getCompensationAssessment(
    candidate.logistics.salary_expectation,
    item.compensationBand
  );

  // Group skills that share the exact same demonstrated evidence quote
  const skillGroups = useMemo(() => {
    const groups: SkillEvidenceGroup[] = [];
    const spanToGroupMap = new Map<string, SkillEvidenceGroup>();

    for (const skill of skillItems) {
      const rawSpan = skill.evidence_span?.trim();
      if (rawSpan) {
        if (spanToGroupMap.has(rawSpan)) {
          spanToGroupMap.get(rawSpan)!.skills.push(skill);
        } else {
          const newGroup: SkillEvidenceGroup = {
            id: `group_${skill.id}`,
            skills: [skill],
            evidenceSpan: rawSpan,
          };
          spanToGroupMap.set(rawSpan, newGroup);
          groups.push(newGroup);
        }
      } else {
        // Skills without evidence quote (orphans, not stated, etc.)
        groups.push({
          id: `single_${skill.id}`,
          skills: [skill],
          evidenceSpan: null,
        });
      }
    }

    return groups;
  }, [skillItems]);

  return (
    <div className="mt-4 p-4 rounded-2xl bg-surface-container-low space-y-4 border-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/40">
        <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
          Layer 2 • Categorical Ground Truth
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close evidence panel"
          className="rounded-full h-7 px-2.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          <span>Close</span>
        </Button>
      </div>

      {/* Section 1: Experience */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          experience
        </p>
        <div className="bg-surface rounded-xl p-3 shadow-2xs space-y-2 border-0">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium text-on-surface">Total verified years</span>
            <span className="inline-flex items-center gap-2">
              <EvidentiaryDot type={isExpConfirmed ? "confirmed" : "gap"} />
              <span className={isExpConfirmed ? "text-on-surface font-semibold" : "text-amber-700 dark:text-amber-300 font-semibold"}>
                {verifiedYearsExperience} stated · needs {minYears}+
              </span>
            </span>
          </div>

          {candidate.work_history.entries.length > 0 && (
            <div className="text-xs text-on-surface-variant pt-1 border-t border-outline-variant/30 space-y-1">
              <div className="font-medium text-on-surface">Work history breakdown:</div>
              {candidate.work_history.entries.map((role) => (
                <div key={role.entry_id} className="flex justify-between items-center text-[12px]">
                  <span>
                    {role.title} at {role.employer}
                  </span>
                  <span className="font-mono text-[11px]">
                    {role.start_date} – {role.is_current ? "Present" : role.end_date || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Skills (Required) */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          skills (required)
        </p>
        <div className="bg-surface rounded-xl p-3 shadow-2xs divide-y divide-outline-variant/30 border-0">
          {skillGroups.map((group) => {
            if (group.skills.length > 1) {
              // Grouped shared evidence block for skills sharing the same source line
              return (
                <div key={group.id} className="py-2.5 first:pt-0.5 last:pb-0.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {group.skills.map((skill) => {
                        const isConfirmed = skill.status === "confirmed";
                        const isAmbiguous = skill.status === "ambiguous";
                        const isNotStated = skill.status === "not_stated" || skill.status === "unparseable";

                        return (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-xs font-semibold text-on-surface"
                          >
                            <EvidentiaryDot type={getEvidentiaryDotType(skill.status)} />
                            <span>{skill.label}</span>
                            <span className="text-[11px] font-normal text-on-surface-variant">
                              {isConfirmed && "(confirmed)"}
                              {isAmbiguous && "(claimed, not shown)"}
                              {isNotStated && "(not stated)"}
                              {skill.status === "contradicted" && "(contradicted)"}
                            </span>
                          </span>
                        );
                      })}
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-on-surface-variant/80 uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant/40">
                      Shared source line
                    </span>
                  </div>

                  {group.evidenceSpan && (
                    <div className="text-xs text-on-surface-variant pl-3 border-l-2 border-primary/60 italic bg-surface-container-low/50 py-1.5 rounded-r">
                      &ldquo;{group.evidenceSpan}&rdquo;
                    </div>
                  )}
                </div>
              );
            }

            const skill = group.skills[0];
            const isConfirmed = skill.status === "confirmed";
            const isAmbiguous = skill.status === "ambiguous";
            const isNotStated = skill.status === "not_stated" || skill.status === "unparseable";

            return (
              <div key={group.id} className="py-2.5 first:pt-0.5 last:pb-0.5 space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-on-surface">{skill.label}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    {isConfirmed && (
                      <>
                        <EvidentiaryDot type="confirmed" />
                        <span className="font-semibold text-on-surface">confirmed</span>
                      </>
                    )}
                    {isAmbiguous && (
                      <>
                        <EvidentiaryDot type="gap" />
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          claimed, not shown
                        </span>
                      </>
                    )}
                    {isNotStated && (
                      <>
                        <EvidentiaryDot type="not_stated" />
                        <span className="text-on-surface-variant">not stated</span>
                      </>
                    )}
                    {skill.status === "contradicted" && (
                      <>
                        <EvidentiaryDot type="contradicted" />
                        <span className="font-semibold text-rose-700 dark:text-rose-400">contradicted</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Evidence quotation if present */}
                {group.evidenceSpan && (
                  <div className="text-xs text-on-surface-variant pl-3 border-l-2 border-primary/60 italic bg-surface-container-low/50 py-1 rounded-r">
                    &ldquo;{group.evidenceSpan}&rdquo;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Compensation */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          compensation
        </p>
        <div className="bg-surface rounded-xl p-3 shadow-2xs space-y-2 border-0">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium text-on-surface">Salary expectation</span>
            <span className="inline-flex items-center gap-2">
              <EvidentiaryDot type={compAssessment.dotType} />
              <span className={compAssessment.dotType === "confirmed" ? "text-on-surface font-semibold" : "text-amber-700 dark:text-amber-300 font-semibold"}>
                {compAssessment.text}
              </span>
            </span>
          </div>

          {candidate.logistics.salary_expectation.raw && (
            <div className="text-xs text-on-surface-variant pt-1 border-t border-outline-variant/30 space-y-1">
              <div className="text-on-surface-variant text-[11px] italic">
                Raw document text: &ldquo;{candidate.logistics.salary_expectation.raw}&rdquo;
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
