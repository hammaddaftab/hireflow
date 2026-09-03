# Aspect: Job Requirements

## Status
Completed

## JSON Schema
```json
{
  "title": "string",
  "seniority_level": "string | null",
  "skills_required": [
    { "skill": "string", "blocking": true }
  ],
  "skills_preferred": [
    { "skill": "string", "blocking": false }
  ],
  "min_experience": {
    "years": "number | null",
    "blocking": false
  },
  "education_min": {
    "degree_level": "bachelors | masters | doctorate | diploma | high_school | null",
    "field": "string | null", // canonical study field (e.g. 'Computer Science'); maps directly to DB select options, raw omitted
    "blocking": false
  },
  "location": {
    "city": "string | null", // canonical city (e.g. 'Lahore'); matches canonical DB select, raw omitted
    "province": "string | null", // canonical province (e.g. 'Punjab'); matches canonical DB select, raw omitted
    "blocking": true
  },
  "work_mode": {
    "mode": "remote | hybrid | onsite",
    "blocking": true
  },
  "compensation_band": {
    "min": "number | null",
    "max": "number | null",
    "currency": "string | null",
    "blocking": false
  },
  "max_notice_period": {
    "value": "number | null",
    "unit": "days | weeks | months | null",
    "blocking": false
  }
}
```

## Extraction Prompt (parsing a pasted JD into this schema)
```
Parse the job description below into the structured schema. Split
skills into skills_required (must-have, blocking: true) and skills_preferred
(nice-to-have, non-blocking: false) based on the language used in the JD
itself (e.g. "must have", "required" vs "nice to have", "bonus",
"preferred") — do not guess which tier a skill belongs to if the JD
language is ambiguous; default ambiguous skills to preferred, not
required.
Do not extract years per skill — extract minimum years of experience
only at the top level in min_experience if stated.
For education_min: map degree_level strictly to 'bachelors', 'masters',
'doctorate', 'diploma', 'high_school', or null. Extract canonical field of study.
For location: extract canonical city and province/region as structured fields.
For compensation_band: extract numeric min, max, and currency if stated.
For max_notice_period: extract numeric value and unit (days, weeks, months) if stated.
Assign blocking (true/false) per requirement based on whether the JD treats
it as a strict knockout requirement or a preference.

Job description text:
{jd_text}
```

## Design Decisions
- `blocking` is configured per requirement independently across all fields
  (skills, education, location, work mode, compensation, notice period, min experience).
  There is no aggregate logistics_blocking flag — recruiters can mark location as
  blocking while keeping notice period or budget soft.
- Structured logistics & comp: Location is structured as { city, province }, and
  compensation/notice period are structured with numeric values and units to enable
  deterministic, zero-LLM checks at query time (matching query_evaluation.md).
- min_experience captures top-level minimum years of experience with its own blocking flag.
  Individual skills do not carry min_years — keeping skill requirements focused on
  skill identification and hard/soft blocking.
- Why no { raw, normalized } pattern in Job Requirements:
  The dual `{ raw, normalized }` structure is specifically designed for candidate-side
  extraction, where third-party claims require recruiter verification against original CV
  text (e.g. confirming whether an applicant truly attended FAST). Conversely, job
  requirements are defined or confirmed by the recruiter using canonical database dropdowns;
  when parsing a JD, fields map directly to canonical entities. Storing raw strings here
  is unnecessary overhead since job requirements never require candidate-style audit confirmation.

## Open Questions
- None currently — this is the minimum viable version agreed as the build target.
  Do not add fields here without a reason tied to an actual matching need.
