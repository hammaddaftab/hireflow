# Aspect: Education

## Status
Draft — deliberately minimal

## JSON Schema
```json
{
  "entries": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "start_date": "YYYY | null",
      "end_date": "YYYY | \"present\" | null",
      "grade": "string | null"
    }
  ]
}
```

## Extraction Prompt
```
Extract each education entry from the resume text below: institution,
degree, field of study, dates, and grade if stated. Do not infer
prestige, tier, or accreditation status — extraction only.

Resume text:
{resume_text}
```

## Design Decisions
- HEC/NCEAC tier normalization is explicitly OUT of this schema. It's
  an optional enrichment layer for later, not core extraction — do not
  add tier/accreditation fields here without a separate decision to
  build that layer.

## Open Questions
- None currently — this aspect is intentionally simple and not a
  priority for further refinement before the hackathon build.
