# Aspect: Education

## Status
Completed

## Version
1.0.0

## JSON Schema
```json
{
  "entries": [
    {
      "institution": {
        "raw": "string (verbatim school/university name from document, e.g. 'FAST-NUCES')",
        "normalized": "string | null (canonical institution name resolved against master database, e.g. 'FAST National University')"
      },
      "degree_level": {
        "raw": "string (verbatim degree title, e.g. 'Bachelor of Science in Software Engineering')",
        "normalized": "bachelors | masters | doctorate | diploma | high_school | null"
      },
      "field": {
        "raw": "string (verbatim major/field as stated, e.g. 'BSCS')",
        "normalized": "string | null (canonical field of study matching master taxonomy, e.g. 'Computer Science')"
      },
      "start_date": "YYYY | YYYY-MM | null",
      "end_date": "YYYY | YYYY-MM | null",
      "is_current": "boolean",
      "grade": "string | null"
    }
  ]
}
```

## Extraction Prompt
```
Extract each education entry from the resume text below in reverse chronological order:
- institution: verbatim name in `raw`, canonical name in `normalized` if standard, else null.
- degree_level: verbatim title in `raw`, normalized tier in `normalized` strictly mapped to:
  * 'bachelors': 4-year BS, BE, BSc (Hons), BBA, etc.
  * 'masters': MS, MPhil, MSc, MBA.
  * 'doctorate': PhD, DPhil.
  * 'diploma': 2-year Associate Degree (ADP), DAE, polytechnic diploma.
  * 'high_school': FSc, ICS, FA, A-Levels, Matric, O-Levels.
  * null: short bootcamps, certificates, non-degree training.
- field: verbatim major in `raw` (e.g. 'BSCS'), canonical discipline in `normalized` (e.g. 'Computer Science') if clear, else null.
- start_date: start year or date (e.g. '2020' or '2020-09'), else null.
- end_date: end/graduation year (e.g. '2024' or '2024-06'), or null if currently enrolled (never return the string "present").
- is_current: true if currently enrolled / studying, false if completed / past.
- grade: GPA, percentage, or division if explicitly stated, else null.
Do not infer prestige, tier, or accreditation status — extraction only.

Resume text:
{resume_text}
```

## Design Decisions
- `institution`: Uses `{ raw, normalized }` to preserve verbatim text for recruiter verification while enabling open-set canonical resolution against the master database without prompt bloat.
- `degree_level`: Uses `{ raw, normalized }` to map free-form degree titles to the canonical tier enum (`bachelors`, `masters`, `doctorate`, `diploma`, `high_school`) for deterministic threshold checks.

## Open Questions
- None currently — schema is finalized.
