# Aspect: Job Requirements

## Status
Draft

## JSON Schema
```json
{
  "title": "string",
  "seniority_level": "string | null",
  "skills_required": [
    { "skill": "string", "min_years": "number | null", "blocking": true }
  ],
  "skills_preferred": [
    { "skill": "string", "min_years": "number | null", "blocking": false }
  ],
  "min_years_total_experience": "number | null",
  "education_min": { "degree_level": "string | null", "field": "string | null", "blocking": false },
  "location": "string",
  "work_mode": "remote | hybrid | onsite",
  "compensation_band": "string | null",
  "max_notice_period": "string | null",
  "logistics_blocking": true
}
```

## Extraction Prompt (parsing a pasted JD into this schema)
```
Parse the job description below into the structured schema. Split
skills into skills_required (must-have, blocking) and skills_preferred
(nice-to-have, non-blocking) based on the language used in the JD
itself (e.g. "must have", "required" vs "nice to have", "bonus",
"preferred") — do not guess which tier a skill belongs to if the JD
language is ambiguous; default ambiguous skills to preferred, not
required.
Extract min_years per skill only where the JD states it explicitly for
that specific skill, not a general "X years experience" line applied
across all skills.

Job description text:
{jd_text}
```

## Design Decisions
- `blocking` is the ONE axis that legitimately varies per requirement
  (see candidate hard/soft group UI decision). No other per-requirement
  configuration exists — the evidence-status taxonomy that matches
  against these requirements is fixed and universal (see
  _shared/evidence_status.md), not configurable per requirement.
- Logistics fields (location, comp, notice) default to blocking=true —
  these are usually dealbreakers in this market, not nice-to-haves.
- min_years is domain-specific per skill, not a single aggregate number
  — mirrors the candidate-side lesson (total years ≠ years-in-skill).

## Open Questions
- None currently — this is the minimum viable version (7 core fields)
  agreed as the build target. Do not add fields here without a reason
  tied to an actual matching need.
