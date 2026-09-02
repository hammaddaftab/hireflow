# HireFlow Extraction & Evaluation Prompts

---

## [Shared: Evidence Status Taxonomy](/src/features/extraction/aspects/shared.ts)

### Status
Stable

### Design Decisions
- The fixed set of states any extracted or matched field can be in: `confirmed`, `inferred`, `contradicted`, `not_stated`, `ambiguous`, `unparseable`.
- No field is ever stored as a bare value without one of these six states attached.
- No composite or weighted score is ever derived from these states (formulas like `S(c) = Σw_i·f_i(c)` and fake `confidence: 0.61` floats are strictly rejected). States are read individually by recruiters, not summed.
- Every evidence-bearing field carries an `evidence_span` verified via substring match against the source text before storage. If there is no matching span, the field is `not_stated`, never a guess.

### Open Questions
- None.

---

## [Candidate Identity](/src/features/extraction/aspects/identity.ts)

### Status
Draft — schema only, not yet stress-tested

### Design Decisions
- No `evidence_status` is attached to identity fields — identity attributes (name, phone, email) are present or absent, not evidentiary in the same sense as a skill claim.
- Pakistani CNIC is captured as the primary deduplication key — an exact CNIC match overrides fuzzy name, email, or phone matching entirely.
- Links and URLs are captured raw without fetching or pre-validating.

### Open Questions
- E.164 normalization edge cases for phone numbers without an explicit country code (e.g., default assumption of +92 for domestic numbers).

---

## [Work History](/src/features/extraction/aspects/workHistory.ts)

### Status
Draft — structure decided, prompt not yet tested against real resumes

### Design Decisions
- `employment_type` exists specifically to prevent internships from silently counting as full professional experience in downstream years-of-experience calculations.
- `raw_description` is kept verbatim and separate from derived skill data — this serves as the source of truth against which `skills_demonstrated` extraction runs and against which `evidence_span` quotes are verified for hallucination prevention.
- Domain-specific years of experience (e.g., "years of Python") are not stored as precomputed numbers; they are derived downstream from dated entries and demonstrated skills so calculations remain auditable.

### Open Questions
- Multi-column and table-layout resume handling — requires a layout normalization pre-processing pass rather than relying on LLM prompting alone.

---

## [Skills Demonstrated](/src/features/extraction/aspects/skillsDemonstrated.ts)

### Status
Stable (conceptually) — most developed aspect in the system. Implementation not yet built.

### Design Decisions
- A skill enters `skills_demonstrated` if and only if it appears inside a dated work-history or project entry AND is the object of a verb whose grammatical subject is the candidate.
- Enforces three syntactic tiers:
  1. `action_attributed`: Candidate is the actor ("built", "optimized") → `evidence_status: confirmed`.
  2. `peripheral_action`: Verb is passive or weak ("assisted with", "worked with") → `evidence_status: ambiguous`.
  3. `context_listed`: Skill listed in a tools/stack line without an action verb → `evidence_status: ambiguous`.
- Requires decision-grade properties on every extracted skill:
  - `outcome_attached`: Quote the exact clause with a measurable result, or null.
  - `concrete_noun_present`: True if a specific artifact/system is named beyond the skill keyword itself.
  - `cross_entry_consistency`: Coherence check across multiple dated entries (`consistent`, `inconsistent`, `single_mention`).
- Strictly rejects composite "authenticity scores". Properties remain separate for recruiter inspection.

### Open Questions
- Comparison logic for `cross_entry_consistency` (rule-based text comparison vs a lightweight dedicated LLM call).
- Whether `context_listed` skills should be excluded entirely from `skills_demonstrated` into a third bucket versus remaining tagged as ambiguous.

---

## [Skills Declared (+ derived relations)](/src/features/extraction/aspects/skillsDeclared.ts)

### Status
Draft — extraction is trivial, derived relations are the real content here

### Design Decisions
- `skills_declared` has no standalone decision value. Its utility is strictly as a comparison operand against `skills_demonstrated` — the signal is in the delta between the two lists.
- Computes four derived relations in downstream code (without extra LLM calls):
  1. `corroborated`: Declared skill is also demonstrated in work history.
  2. `orphan`: Declared skill never appears in work history or projects; flags follow-up questions for the recruiter.
  3. `stale`: Declared skill was demonstrated only in older roles and is absent in recent stacks.
  4. `density_anomaly`: Ratio of declared skills to work history entries is abnormally high (signal of AI-generated/bloated resumes).
- Surfaced to recruiters as separate, legible relations rather than a combined score.

### Open Questions
- The `density_anomaly` threshold needs a baseline distribution from real recruitment data rather than a hardcoded estimate.

---

## [Education](/src/features/extraction/aspects/education.ts)

### Status
Draft — deliberately minimal

### Design Decisions
- Extracts institution, degree, field of study, dates, and stated grade only.
- HEC/NCEAC tier normalization and prestige scoring are explicitly excluded from core extraction and reserved for an optional enrichment layer.

### Open Questions
- None currently — intentionally kept minimal.

---

## [Logistics](/src/features/extraction/aspects/logistics.ts)

### Status
Draft — schema simple, the RULE is the important part

### Design Decisions
- Captures stated salary expectation, notice period, relocation willingness, and availability ONLY when explicitly and literally stated in the text; otherwise returns exactly `"not_stated"`.
- Hard rule: Never infer or guess logistics fields, even when an inference seems safe. Unstated fields become the recruiter's checklist for phone/WhatsApp pre-screening.

### Open Questions
- None. Resist adding inference logic to logistics.

---

## [Extraction Metadata](/src/features/extraction/aspects/extractionMetadata.ts)

### Status
Draft — not extracted by LLM, computed by pipeline code

### Design Decisions
- Computed deterministically in pipeline code with zero LLM calls.
- `file_hash`: Content hash of the uploaded document used as the primary cache key to prevent redundant re-extractions.
- `parse_quality`: Categorized as `full`, `partial`, or `failed` (feeding the `unparseable` evidence state so OCR failures are never misread as candidate deficiencies).
- `raw_text_ref`: Pointer to raw text retained for rare single-field fallback queries.

### Open Questions
- Selection of the collision-resistant hashing algorithm.

---

## [Job Requirements](/src/features/extraction/aspects/requirements.ts)

### Status
Draft

### Design Decisions
- Parses pasted Job Descriptions into structured requirements with `blocking` as the primary dealbreaker axis.
- Splits skills into `skills_required` (`blocking: true`) and `skills_preferred` (`blocking: false`). Ambiguous skill language defaults to preferred.
- `min_years` is domain-specific per skill rather than a blanket experience threshold.
- Logistics constraints (location, work mode, compensation, notice period) default to `blocking: true`.

### Open Questions
- None currently — represents the agreed minimum viable set of 7 core fields.

---

## [Query Evaluation (Matching Time)](/src/features/extraction/aspects/queryEvaluation.ts)

### Status
Draft

### Design Decisions
- Divided into two distinct evaluation paths:
  1. Deterministic checks: Objective criteria (years of experience, location match) computed in code with zero LLM calls and zero latency.
  2. Semantic / free-text evaluations: Batched LLM calls evaluating structured profiles against judgment criteria or custom grouping prompts.
- Runs exclusively against compact structured candidate profiles, never raw resume text (reducing prompt token payload by 3-5x).
- Batch size target is 50-100 candidates per LLM call.
- Output per candidate consists of `candidate_id`, `status` (`confirmed`, `ambiguous`, `contradicted`, `not_stated`), `reasoning`, and `evidence_span`.

### Open Questions
- Pricing and quota model for repeated free-text query runs against the candidate pool.
- Wiring for the fallback single-field raw text query path.
