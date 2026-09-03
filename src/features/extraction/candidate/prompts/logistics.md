# Aspect: Logistics

## Status
Draft — schema simple, the RULE is the important part

## Version
1.0.0

## JSON Schema
```json
{
  "salary_expectation": {
    "raw": "string | null",
    "normalized": {
      "min": "number | null",
      "max": "number | null",
      "currency": "string | null"
    }
  },
  "notice_period": {
    "raw": "string | null",
    "normalized": {
      "value": "number | null",
      "unit": "days | weeks | months | null"
    }
  },
  "stated_relocation_willingness": "string | \"not_stated\"",
  "stated_availability": "string | \"not_stated\"",
  "languages": ["string"]
}
```

## Extraction Prompt
```
Extract salary expectation, notice period, relocation willingness, and
availability ONLY if explicitly and literally stated in the resume text
below. If a field is not explicitly stated, return null for salary and notice
period, and exactly "not_stated" for other logistics fields — do not infer,
estimate, or guess a value from context, seniority, or any other signal.
These fields are what a recruiter would otherwise have to ask about directly;
a wrong guess here is worse than an honest gap.
For salary_expectation: extract verbatim text in `raw`, and normalized
numeric { min, max, currency } in `normalized` if stated.
For notice_period: extract verbatim text in `raw`, and normalized
numeric { value, unit: "days" | "weeks" | "months" } in `normalized` if stated.
Also extract spoken/written languages.

Resume text:
{resume_text}
```

## Design Decisions
- `salary_expectation` and `notice_period` use the shared `{ raw, normalized }`
  pattern, matching the numeric keys and unit scales of job requirements
  (`compensation_band` and `max_notice_period`) to enable zero-LLM arithmetic
  comparisons in query evaluation.


## Open Questions
- None. This is the one aspect where the design should NOT get more
  complex — resist adding inference logic here even if it seems useful
  later.
