# Aspect: Candidate Identity

## Status
Draft — schema only, not yet stress-tested

## JSON Schema
```json
{
  "name": "string",
  "email": "string | null",
  "phone": "string | null (normalized E.164)",
  "cnic": "string | null (13-digit, dedup key)",
  "location_stated": "string | null",
  "links": ["string (raw URLs — GitHub, portfolio, LinkedIn — not fetched)"]
}
```

## Extraction Prompt
```
Extract the candidate's identity fields from the resume text below.
Return only what is explicitly present — do not infer a name from an
email address, do not guess a phone country code if not shown.
Normalize phone numbers to E.164 if a country context is clear from
the document; otherwise return the raw string and flag it.
Do not fetch or validate any URLs found — return them raw.

Resume text:
{resume_text}
```

## Design Decisions
- No evidence_status needed on these fields — identity is present or
  absent, not evidentiary in the same sense as a skill claim.
- CNIC captured here because it's the primary dedup key (see
  extraction_metadata.md) — exact match overrides fuzzy name/email/phone
  matching entirely.

## Open Questions
- E.164 normalization edge cases for numbers without explicit country
  code — default assumption (e.g. assume +92 if no code) not yet decided.
