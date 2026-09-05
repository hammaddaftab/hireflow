import type { EvaluatedRequirement } from "../../types";

export interface SkillEvidenceGroup {
  id: string;
  skills: EvaluatedRequirement[];
  evidenceSpan: string | null;
}

/**
 * Groups candidate skills that cite the exact same verbatim resume quote into clusters,
 * leaving quote-less / orphan skills as individual entries.
 */
export function groupSkillsByEvidenceQuote(
  skillItems: EvaluatedRequirement[]
): SkillEvidenceGroup[] {
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
}

