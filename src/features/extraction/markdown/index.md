# HireFlow Prompt/Schema Index

This is a pointer list only. It contains no logic, no schemas, no prompts.
Every file below is self-contained — open one, understand it fully, edit it,
without needing any other file open. If you ever feel the urge to make this
index "smarter" (shared logic, inheritance between aspects), don't — that's
hierarchy creeping back in. Duplication between files is an accepted cost.

## Shared (referenced by name, not imported by code, in every aspect below)
- `_shared/evidence_status.md` — the 6-state taxonomy every extracted field uses

## Candidate-side (extraction, once per resume, cached)
- `candidate/identity.md`
- `candidate/work_history.md`
- `candidate/skills_demonstrated.md`
- `candidate/skills_declared.md`
- `candidate/education.md`
- `candidate/logistics.md`
- `candidate/extraction_metadata.md`

## Job-side
- `job/requirements.md` — schema + JD-parsing prompt

## Matching (query time)
- `matching/query_evaluation.md` — batched per-candidate evaluation prompt

## Status legend used inside every file
- `Draft` — decided in conversation, not yet implemented
- `Stable` — implemented, working as intended
- `Needs work` — implemented but known gaps, see Open Questions

## Change log
- 2026-09-02: initial structure. skills_demonstrated fully specified
  (3 syntactic tiers + outcome-attachment + concrete-noun density +
  cross-entry consistency). All other candidate aspects at Draft/baseline.
