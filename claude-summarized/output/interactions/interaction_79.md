# Interaction Record — Index 79

**Originating Role**: `assistant`
**Referenced User Query Index**: `78`

---

## User Query
````
i don't have enough recruiters atm to tell me what initial parsing schema is the best one, encompasses everything, concisely with the most information. So tell me what should be in that schema, think only on that.
````
---

## Claude Response (Raw Markdown)

Extraction schema — job-agnostic, extracted once, cached. Grouped by what each section is *for*, not just alphabetically.

**1. Identity (extraction only, no evidence-status needed — either present or not)**
- `name`, `email`, `phone` (normalized E.164), `cnic` (if present — dedup key), `location_stated`, `links` (GitHub/portfolio/LinkedIn URLs, raw — don't fetch them, that's a separate feature)

**2. Work history — the highest-value section, structured, not a text blob**
Each entry:
- `employer`, `title`, `start_date`, `end_date` (or "present")
- `employment_type` (full-time / internship / contract / freelance) — matters, an internship shouldn't silently count as full professional experience
- `skills_demonstrated`: list of skills tied *to this specific role*, each with its own evidence span
- `raw_description`: the original bullet text for this entry

This is what makes domain-specific-years computation possible later — years-of-Python is derived by summing date ranges across entries where Python appears in `skills_demonstrated`, not stored as a precomputed number (don't let the extractor compute and cache "4.2 years," compute it downstream from dated entries — otherwise you can't audit how the number was reached).

**3. Skills — two separate lists, not one, because their evidence quality differs**
- `skills_declared`: flat list from an explicit "Skills:" section — weaker evidence, self-reported, no context
- `skills_demonstrated`: auto-derived as the union of all `skills_demonstrated` across work history — stronger evidence, tied to actual role context

This split *is* the Confirmed-vs-Ambiguous distinction from two messages ago, applied concretely: a skill only in `skills_declared` starts life as Ambiguous; one in `skills_demonstrated` starts as Confirmed. Don't let the LLM produce one merged list — you lose this distinction if you do.

**4. Projects — separate from work history, not merged in**
Same shape as work history entries (name, description, skills used, evidence span) but explicitly tagged as non-professional. Resumes routinely pad with personal/academic projects to imply professional depth on a technology; if these get merged into the same pool as real jobs, "years of experience" computations silently inflate. Keep the tag, let downstream matching decide whether to count them.

**5. Education**
`institution`, `degree`, `field`, `graduation_year`/dates, `grade` (if stated). Nothing else — tier/accreditation scoring stays out per the earlier "optional enrichment" call.

**6. Logistics — always defaults to `not_stated`, never inferred**
`stated_salary_expectation`, `stated_notice_period`, `stated_relocation_willingness`, `stated_availability`, `languages`. This is the field group that's most often absent, and absence must render as "Not stated," not be silently skipped or guessed at.

**7. Extraction metadata — not part of the candidate, but required for the system to function correctly**
- `file_hash` (dedup + cache key — not filename/timestamp, per the mtime-tick lesson)
- `schema_version` (so a future schema change can trigger re-extraction only where needed, not a blanket re-run)
- `parse_quality`: full / partial / failed — this is what feeds the Unparseable state
- `raw_text_ref`: pointer to the original extracted text, kept for the rare fallback narrow-query case from two messages ago

**Cross-cutting rule, applies to every field in sections 2–6:** every extracted fact carries its evidence span, verified via substring match against source text before storage. A field with no matching span in the document doesn't get stored as a guess — it's `not_stated`. This is the schema-level enforcement of the anti-hallucination principle running through this entire conversation; it belongs in the schema itself, not left to prompt instructions alone.

That's the full schema. Everything past this (education tier scoring, plugin data, event history) is layered on top, not part of extraction.
