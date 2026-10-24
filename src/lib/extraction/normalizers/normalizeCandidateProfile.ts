import "server-only";

// Candidate profile normalization across identity locations, education fields, and demonstrated/declared skills

import type { ParsedCandidateProfile } from "@/entities/candidate";
import { normalizeSkill, resolveCanonicalSkill } from "./skillNormalizer";
import { normalizeFieldOfStudy } from "./fieldOfStudyNormalizer";
import { normalizeLocation } from "./locationNormalizer";

export function normalizeCandidateProfile(c: ParsedCandidateProfile): ParsedCandidateProfile {
  const rawLocation = c.identity?.location?.raw ?? null;
  const existingCity = c.identity?.location?.normalized?.city ?? null;
  const resolvedLocation = normalizeLocation(rawLocation, existingCity);
  const normalizedLocation =
    resolvedLocation.city || resolvedLocation.province
      ? resolvedLocation
      : c.identity?.location?.normalized ?? null;

  return {
    ...c,
    identity: {
      ...c.identity,
      location: {
        raw: rawLocation,
        normalized: normalizedLocation,
      },
    },
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
    role_claims: {
      ...c.role_claims,
      claims: (c.role_claims?.claims || []).map((claim) => ({
        ...claim,
        skills: (claim.skills || []).map((item) => ({
          ...item,
          canonical_skill: item.canonical_skill ?? resolveCanonicalSkill(item.skill),
        })),
      })),
    },
    notable_signals: c.notable_signals ?? { signals: [] },
  };
}
