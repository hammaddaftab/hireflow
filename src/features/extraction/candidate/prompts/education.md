# Aspect: Education

## Status
Draft — deliberately minimal

## JSON Schema
```json
{
  "entries": [
    {
      "institution": "string",
      "degree_level": {
        "raw": "string (raw degree title as stated, e.g. 'Bachelor of Science in CS')",
        "normalized": "bachelors | masters | doctorate | diploma | high_school | null"
      },
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
degree_level (raw degree string in `raw`, and normalized tier 'bachelors',
'masters', 'doctorate', 'diploma', 'high_school', or null in `normalized`),
field of study, dates, and grade if stated. Do not infer prestige, tier,
or accreditation status — extraction only.

Resume text:
{resume_text}
```

## Design Decisions
- `degree_level` follows the shared `{ raw, normalized }` pattern, mapping
  candidate degrees to the same canonical tier enum used by job requirements
  (`bachelors`, `masters`, `doctorate`, `diploma`, `high_school`) to enable
  deterministic threshold comparisons (`candidate_degree >= required_degree`).
- HEC/NCEAC tier normalization is explicitly OUT of this schema. It's
  an optional enrichment layer for later, not core extraction — do not
  add tier/accreditation fields here without a separate decision to
  build that layer.

## Open Questions
- None currently — this aspect is intentionally simple and not a
  priority for further refinement before the hackathon build.
