# Aspect: Query Evaluation (matching time)

## Status
Completed

## Version
1.0.0

## Two call types

### 1. Deterministic requirement check — no LLM, plain code
Runs for objective fields (years ≥ threshold, skill present, location
match) directly against cached candidate JSON. Zero cost, zero latency.

### 2. Semantic/free-text evaluation — batched LLM call
Runs for judgment-required requirements AND arbitrary free-text
grouping prompts ("group by who seems entrepreneurial"). Input is each
candidate's COMPACT structured profile (extraction output), never the
raw resume text.

## JSON Schema — output per candidate per query
```json
{
  "candidate_id": "string",
  "status": "confirmed | ambiguous | contradicted | not_stated | unparseable (see /src/features/extraction/shared/evidence_status.md)",
  "reasoning": "string (grounded in evidence_span from the candidate's extracted profile)",
  "evidence_span": "string | null (quoted, must trace back to a real extracted field; null if not_stated)"
}
```

## Prompt (batched, N candidates per call)
```
You are evaluating a batch of candidates against the following
query/requirement. For EVERY candidate in the batch — qualifying and
non-qualifying alike — return a status and a one-sentence reasoning
grounded ONLY in the structured profile data provided. Do not invent
facts not present in the profile. If the profile doesn't contain enough
information to judge, return status "not_stated" or "ambiguous" rather
than guessing. If status is "not_stated", return null for evidence_span.

Query/requirement:
{query_text}

Candidate profiles (compact, already extracted — NOT raw resumes):
{candidate_profiles_batch}
```

## Design Decisions
- Batch size: chunk to fit context, roughly 50-100 candidates per call
  depending on profile size — not one call per candidate (700 calls for
  700 CVs), not one call for all 700 at once (context limits + latency).
- Compact profiles only, never raw resume text — 3-5x payload reduction
  vs re-sending original documents, and it's what makes repeated
  free-text queries against the same candidate pool affordable.
- Cost implication flagged: free-text grouping is a repeatable
  QUERY-TIME cost, separate from one-time extraction cost. Pricing
  model needs its own line item for this — not yet resolved, see
  pricing note below.

## Open Questions
- Batch size output token limits: evaluating 50-100 candidates per call
  risks hitting model completion token limits or encountering latency
  timeouts due to generating tens of candidate reasoning and evidence
  blocks in a single JSON completion.
- Pricing for repeated free-text queries against the same pool not yet
  decided (options considered: small per-query fee, or bundled quota
  e.g. "first 10 queries free per job, then $X"). Needs resolution
  before pitch finalization — do not present $1/1000 CVs as covering
  this without qualifying it.
- Fallback narrow-query-against-raw-text path (see
  candidate/extraction_metadata.md) not yet wired into this flow.
