# Interaction Record — Index 65

**Originating Role**: `assistant`
**Referenced User Query Index**: `64`

---

## User Query
````
fetch me the core properties of a job, which should be defined and accordingly matched with recived cvs
````
---

## Claude Response (Raw Markdown)

Core properties split into two schemas that mirror each other — job requirements on one side, extracted candidate data on the other — because matching only works when both sides use the same field structure.

**The one architectural decision that matters more than the field list: every requirement needs a `blocking` flag.**
Not all requirements carry equal weight — "5 years Python" failing means reject; "AWS certification" failing might just mean "flag it." Collapsing everything into one undifferentiated list is what produces the fake weighted-sum scores (`S(c) = Σw_i·f_i(c)`) I just tore apart — a single number can't represent "this gap is disqualifying" vs "this gap is a footnote." Keep it binary per requirement: hard/blocking or soft/preferred. No weights, no coefficients.

**Job-side schema (defined per job posting):**

| Category | Fields | Blocking by default? |
|---|---|---|
| Identity | title, seniority level, department | — (not matched, just context) |
| Skills | list of {skill name, min proficiency or years if stated} | Split into two lists: required, preferred |
| Experience | total years min; domain-specific years min (e.g. "years using Python," not total career years — this matters, see below) | Required list = blocking |
| Education | degree level min, field of study | Usually preferred, not blocking, unless legally regulated role |
| Logistics | location/city, remote/hybrid/onsite, compensation band, max acceptable notice period | Blocking — these are usually dealbreakers, not nice-to-haves |
| Language | only if role-specific (e.g. customer-facing) | Blocking only when explicitly stated |

**Candidate-side schema (extracted per CV), same categories, extra fields per item:**

| Field | Value | Evidence | Status |
|---|---|---|---|
| e.g. "Python experience" | "4.2 years" | quoted resume span, verified to exist in source text | Strong / Weak / Not stated |

**Two design rules that came directly out of things established earlier in this conversation, not generic advice:**

1. **Domain-specific experience, not total career years.** We established this exact failure mode already — "6 years total" ≠ "6 years of Python" if 2 of those years were spent as a Java developer. The schema must record *which years map to which skill*, not one aggregate number.

2. **Logistics fields must default to "Not stated," never inferred.** Salary expectation, notice period, relocation willingness — these are the fields the sourced research showed recruiters actually screen for live over WhatsApp, precisely because resumes rarely state them. If your extractor guesses at these instead of flagging them empty, you've rebuilt the exact hallucination problem we've spent this whole conversation stripping out of other people's documents.

**Cut from the core schema, despite showing up in that last generated doc — not because they're wrong ideas, but because they're not core matching properties:**

- HEC/NCEAC university tier normalization — this is a *scoring enrichment* layered on top of the education field, not a property of the job or CV itself. Optional localization pass, not part of the base schema. Build only if time remains after the grid above works.
- CNIC/multi-field deduplication — real and correctly specified in that document, but it's an *intake-layer* concern (is this the same person applying twice), entirely separate from job-CV matching. Don't conflate the two systems.

**Minimum viable version for your build window:** title, required skills list, preferred skills list, min years (domain-specific), location, compensation band, notice period. Seven fields, each with blocking/non-blocking, each matched against extracted CV data with evidence-or-"not stated." That's enough to build the requirement-coverage grid from three messages ago and is achievable in the time you have — everything past this list is enrichment, not foundation.
