# Aspect: Candidate Identity

## Status
Completed

## JSON Schema
```json
{
  "name": "string",
  "email": "string | null",
  "phone": "string | null (normalized E.164)",
  "cnic": "string | null (13-digit, dedup key)",
  "location": {
    "raw": "string | null",
    "normalized": {
      "city": "string | null (canonical city, e.g. 'Lahore')",
      "province": "string | null (canonical province, e.g. 'Punjab')"
    }
  },
  "links": [
    {
      "address": "string (raw URL from document)",
      "platform": {
        "raw": "string | null (stated label/provider, e.g. 'GitHub', 'Portfolio')",
        "normalized": "github | linkedin | gitlab | portfolio | twitter | other | null"
      }
    }
  ]
}
```

## Extraction Prompt
```
Extract the candidate's identity fields from the resume text below.
Return only what is explicitly present — do not infer a name from an
email address, do not guess a phone country code if not shown.
Normalize phone numbers to E.164 if a country context is clear from
the document; otherwise return the raw string and flag it.
For location: extract the raw stated location in `raw`, and structured
canonical city and province in `normalized` if clear, else null.
For links: for each link entry, return:
- `address`: the raw URL or web address as stated in the document.
- `platform`: an object with `raw` (stated provider/label, e.g. 'GitHub', 'Portfolio', or null)
  and `normalized` (canonical enum: 'github', 'linkedin', 'gitlab', 'portfolio', 'twitter', 'other', or null).

Resume text:
{resume_text}
```

## Design Decisions
- Normalized fields (`location`, `links`) follow the shared `{ raw, normalized }`
  pattern defined in [`/src/features/extraction/README.md`](/src/features/extraction/README.md).
- Location normalization note: The `{ raw, normalized }` pattern is slightly adapted
  here with a single top-level `raw` string rather than nested raw fields for
  city/province, avoiding unnecessary depth for verbatim text while normalizing into
  structured components for matching.
- No evidence_status needed on these fields — identity is present or
  absent, not evidentiary in the same sense as a skill claim.
- CNIC captured here because it's the primary dedup key (see
  extraction_metadata.md) — exact match overrides fuzzy name/email/phone
  matching entirely.

## Open Questions
- E.164 normalization edge cases for numbers without explicit country
  code — default assumption (e.g. assume +92 if no code) not yet decided.
