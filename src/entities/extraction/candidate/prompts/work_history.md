# Aspect: Work History

## Status
Completed

## Version
1.0.0

## JSON Schema
```json
{
  "entries": [
    {
      "entry_id": "string (unique within candidate — this is what skills_demonstrated.source_entry_ref points to)",
      "employer": "string",
      "title": "string",
      "start_date": "YYYY-MM | YYYY",
      "end_date": "YYYY-MM | YYYY | null",
      "is_current": "boolean",
      "employment_type": {
        "value": "full_time | internship | contract | freelance",
        "status": "confirmed | inferred"
      },
      "raw_description": "string (verbatim — this IS the evidence_span for the entry)"
    }
  ]
}
```

## Extraction Prompt
```
Extract each distinct work-history entry from the resume text below in reverse chronological order.
For each entry:
- entry_id: assign a unique identifier within this profile (e.g. 'work_1', 'work_2').
- employer: company or organization name.
- title: job title or role designation.
- start_date: start date formatted as YYYY-MM or YYYY.
- end_date: end date formatted as YYYY-MM or YYYY, or null if currently working here (never return the string "present").
- is_current: true if currently working in this role / ongoing, false otherwise.
- employment_type: an object with:
  * value: 'full_time', 'internship', 'contract', or 'freelance'.
  * status: 'confirmed' if explicitly stated in text (e.g. "Full-time", "Intern"), or 'inferred' if deduced from title (e.g. "Intern") or defaulted to 'full_time'.
- raw_description: original bullet and narrative text kept verbatim — do not summarize, paraphrase, or extract skills here.

Resume text:
{resume_text}
```

## Design Decisions
- `entry_id`: Provides the immutable target referenced by `skills_demonstrated.source_entry_ref` for cross-aspect linking.
- `employment_type`: Uses `{ value, status }` (`confirmed | inferred`) to distinguish explicitly stated employment types from defaulted full-time roles, preventing unstated entries from corrupting experience calculations.
- `raw_description`: Kept verbatim as the authoritative narrative text that downstream skill extraction quotes from.
- Domain-specific experience (e.g. years in a specific technology) is not precomputed here; it is computed downstream from dates and demonstrated skills.

## Open Questions
- None currently — schema is finalized.
