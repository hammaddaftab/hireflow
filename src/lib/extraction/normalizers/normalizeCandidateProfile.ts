import "server-only";

// Candidate profile normalization across education fields and demonstrated/declared skills

import type { ParsedCandidateProfile } from "@/entities/candidate";
import { normalizeSkill } from "./skillNormalizer";
import { normalizeFieldOfStudy } from "./fieldOfStudyNormalizer";

export function normalizeCandidateProfile(c: ParsedCandidateProfile): ParsedCandidateProfile {
  return {
    ...c,
    education: {
      ...c.education,
      entries: (c.education?.entries || []).map((e) => ({
        ...e,
        field: {
          raw: e.field?.raw || e.field?.normalized || "",
          normalized: normalizeFieldOfStudy(e.field?.raw || e.field?.normalized),
        },
      })),
    },
    skills_demonstrated: {
      ...c.skills_demonstrated,
      skills: (c.skills_demonstrated?.skills || []).map((s) => ({
        ...s,
        skill: normalizeSkill(s.skill),
      })),
    },
    skills_declared: {
      ...c.skills_declared,
      skills_declared: Array.from(
        new Set((c.skills_declared?.skills_declared || []).map(normalizeSkill).filter(Boolean))
      ),
    },
  };
}
