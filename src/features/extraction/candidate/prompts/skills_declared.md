# Aspect: Skills Declared (+ derived relations)

## Status
Completed

## Version
1.0.0

## JSON Schema — raw extraction
```json
{
  "skills_declared": ["string (flat list of technical skills from an explicit Skills section)"]
}
```

## Extraction Prompt
```
Extract the flat list of technical skills, programming languages, frameworks,
libraries, databases, and infrastructure tools from any explicit "Skills:",
"Technical Skills:", or similar labeled section in the resume below.
Do not pull skills from work-history bullets here — that's skills_demonstrated,
a separate pass.
Exclude generic soft skills, interpersonal traits, or subjective claims (e.g.
'communication', 'team player', 'problem solving', 'leadership').
This list is weaker evidence by design; do not upgrade its status based on how it reads.

Resume text:
{resume_text}
```

## Core Concept
skills_declared has no standalone decision value. Its only utility is
as a comparison operand against skills_demonstrated — the signal is in
the DELTA between the two lists, not in either list alone.

## Derived Relations (Per-Skill Computation)
Computed deterministically downstream against extracted data from this file + skills_demonstrated.md.
```json
{
  "skill": "string",
  "relation": "corroborated | orphan"
}
```

1. **corroborated** — declared skill also appears in `skills_demonstrated`
   at any tier. Recruiter reads this as confirmed in work context.
2. **orphan** — declared, but never appears in work history or projects at
   all. Not evidence of lying — evidence of an unconfirmed claim that
   routes to a follow-up screening question.

## Document-Level Signal: Density Anomaly
Computed once per candidate profile, not per skill:
```json
{
  "density_anomaly": "boolean"
}
```
- **density_anomaly** — ratio of declared-skill-count to work-history-entry-count
  (or seniority level) sits well outside the typical baseline for the role.
  Surfaces resumes with dense keyword stuffing but thin narrative support.

## Design Decisions
- Technical Skill Focus: Soft skills and interpersonal attributes (e.g. "team player",
  "effective communicator") are explicitly excluded from extraction to prevent ungrounded
  claims from generating false orphan flags against technical work history.
- Relational Legibility: Surfaces `corroborated` vs `orphan` claims distinctly without
  collapsing into a single synthetic authenticity score.

## Open Questions
- Matching Delta & Aliasing: How downstream deterministic code reliably handles
  vocabulary, casing, and punctuation discrepancies (e.g., "NodeJS" vs "Node.js",
  "Postgres" vs "PostgreSQL") between declared lists and demonstrated bullet extractions.
- Density anomaly baseline threshold ("well outside typical range") across different
  experience tiers.
