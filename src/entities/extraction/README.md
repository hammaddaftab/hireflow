# HireFlow Prompt & Schema Index

This is a pointer list for prompt specifications and companion Zod schemas. Every prompt and schema pair is self-contained.

## Shared
- [`/src/entities/extraction/shared/evidence_status.md`](/src/entities/extraction/shared/evidence_status.md) (Schema: [`/src/entities/extraction/shared/evidenceStatus.ts`](/src/entities/extraction/shared/evidenceStatus.ts)) - 6-state taxonomy used across all aspects
- Normalized field convention: `fieldName: { raw: <>, normalized: <> }` — `raw` captures literal document text, `normalized` holds the canonical enum or resolved entity (`null` if unresolvable)

## Candidate-side (Extraction, once per resume, cached)
Aspect schemas in [`/src/entities/extraction/candidate/aspects/`](/src/entities/extraction/candidate/aspects/), prompts in [`/src/entities/extraction/candidate/prompts/`](/src/entities/extraction/candidate/prompts/):
- `identity.md` / `identity.ts`
- `work_history.md` / `workHistory.ts`
- `skills_demonstrated.md` / `skillsDemonstrated.ts`
- `skills_declared.md` / `skillsDeclared.ts`
- `education.md` / `education.ts`
- `logistics.md` / `logistics.ts`
- `extraction_metadata.md` / `extractionMetadata.ts`

## Job-side
Prompt & Schema in [`/src/entities/extraction/job/`](/src/entities/extraction/job/):
- `requirements.md` / `requirements.ts` - JD-parsing prompt and schema

## Matching (Query time)
Prompt & Schema in [`/src/entities/extraction/matching/`](/src/entities/extraction/matching/):
- `query_evaluation.md` / `queryEvaluation.ts` - Batched per-candidate evaluation prompt and schema

## Status Legend
- `Draft` - Decided in conversation, not yet implemented
- `Needs work` - Implemented but known gaps
- `Stable` - Implemented, working as intended
- `Completed` - Finalized, prompt and companion schema fully aligned and verified

## Change Log
- 2026-09-03: Restructured into `shared/`, `candidate/`, `job/`, and `matching/` sub-feature groups.
- 2026-09-02: Initial structure.
