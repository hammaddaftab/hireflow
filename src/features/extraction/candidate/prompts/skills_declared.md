# Aspect: Skills Declared (+ derived relations)

## Status
Draft — extraction is trivial, derived relations are the real content here

## JSON Schema — raw extraction
```json
{
  "skills_declared": ["string (flat list from an explicit Skills: section)"]
}
```

## Extraction Prompt
```
Extract the flat list of skills from any explicit "Skills:", "Technical
Skills:", or similar labeled section in the resume below. Do not pull
skills from work-history bullets here — that's skills_demonstrated,
a separate pass. This list is weaker evidence by design; do not upgrade
its status based on how it reads.

Resume text:
{resume_text}
```

## Core Concept
skills_declared has no standalone decision value. Its only utility is
as a comparison operand against skills_demonstrated — the signal is in
the DELTA between the two lists, not in either list alone.

## Derived relations (pure computation, no LLM call — runs over already-
extracted data from this file + skills_demonstrated.md)
```json
{
  "skill": "string",
  "relation": "corroborated | orphan | stale | density_anomaly_flag"
}
```

1. **corroborated** — declared skill also appears in skills_demonstrated
   at any tier. Recruiter reads this as "real."
2. **orphan** — declared, never appears in work history or projects at
   all. Not evidence of lying — evidence of unconfirmed claim. Routes
   to a follow-up-question suggestion, not a silent accept/reject.
3. **stale** — declared, demonstrated somewhere, but only in old
   entries; recent roles show a different stack. Recruiters weight
   current use over old, one-off use.
4. **density_anomaly** — ratio of declared-skill-count to work-history-
   entry-count (or seniority level) sits well outside typical range for
   the role. Document-shape signal, computed once per resume, not per
   skill. (Sourced signal: AI-assisted resumes trend toward dense skill
   lists with thin narrative support — verified via 2025 Software Finder
   survey, n=874, during this project's research.)

## Design Decisions
- These four relations are the actual output surfaced to the recruiter
  for this aspect — not the raw skills_declared list on its own.
- No combined score across the four relations — same rule as
  skills_demonstrated: separate, legible, not summed.

## Open Questions
- density_anomaly threshold ("well outside typical range") not yet
  defined — needs a rough baseline distribution, not a hardcoded number
  guessed without data.
