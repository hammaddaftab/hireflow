# Interaction Record — Index 75

**Originating Role**: `assistant`
**Referenced User Query Index**: `74`

---

## User Query
````
since i want to run queries against the cvs received, thats the whole point, whats the efficient way? i do'nt mean industry standard but not loose enough tha ti we send all the resumes again and again just a prepration for this impending question in the hackathon
````
---

## Claude Response (Raw Markdown)

Core principle: **separate expensive extraction (once per resume) from cheap querying (repeated per job).** Right now you're implicitly coupling them — every new requirement re-reads the resume. Decouple, and you get index-once-query-many, which is the actual efficient pattern here, not an industry buzzword, just correct systems design.

**Layer 1 — Generic extraction, once per resume, cached:**
Parse each resume into a structured, job-agnostic profile: skill inventory, work history with date ranges, education, certifications — each fact with its evidence span, verified against source text (the substring-check from earlier). This is the expensive LLM call. Do it once per resume, ever, regardless of how many jobs it later gets matched against. Cache the structured JSON, keyed by a **content hash of the file**, not filename or upload timestamp — same reasoning as your mtime-tick bug in the document editor: two different uploads of the same resume shouldn't trigger a re-parse, and a modified file with the same name must not hit a stale cache.

**Layer 2 — Query time, per job posting, cheap:**
When a new JD comes in with its requirements, don't call the LLM per requirement per candidate. Split the requirements into two kinds:

- **Deterministic/objective** (years ≥ threshold, skill present in list, location match) — evaluate these directly against the cached structured JSON with plain code. Zero LLM calls, zero cost, instant.
- **Semantic/judgment-required** (does "worked with Kubernetes during migration" count as strong or weak evidence for a Kubernetes requirement) — batch **all** the semantic requirements for one candidate into a **single LLM call**, not one call per requirement. Input: the candidate's already-extracted relevant evidence spans (not the full resume) + the list of ambiguous requirements. Output: structured status per requirement in one response.

**Why this ordering matters, concretely:** for N candidates and M requirements, the naive approach is N×M LLM calls, each re-sending resume context. This approach is N extraction calls (once, cached forever) + N batched query calls (one per candidate per job, not per requirement). A candidate matched against 10 different job postings over time costs one extraction + 10 cheap batched calls — never re-parsed.

**One real gap this doesn't solve, worth stating rather than hiding:** if a job requirement asks about something your generic extraction schema never anticipated (some niche tool nobody thought to extract), the structured profile won't have it. Fallback, and only as a fallback, not the default path: a narrow, targeted query against the raw resume text for that one missing field — cheap because it's one field, not a full re-extraction. This should be rare if your generic schema is reasonably broad; if it's happening often, the extraction schema is too narrow, not the query layer.
