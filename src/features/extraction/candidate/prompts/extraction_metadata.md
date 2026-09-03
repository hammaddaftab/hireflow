# Aspect: Extraction Metadata

## Status
Draft — not extracted by LLM, computed by pipeline code

## JSON Schema
```json
{
  "file_hash": "string (content hash — NOT filename or upload timestamp)",
  "schema_version": "string (so a schema change triggers re-extraction only where affected)",
  "parse_quality": "full | partial | failed",
  "raw_text_ref": "pointer to original extracted text, kept for narrow fallback queries"
}
```

## Not a prompt — this is a computation spec
No LLM call for this file. Rules:
- `file_hash`: cache key for the extraction layer. Two uploads of the
  same resume must not trigger re-extraction. A modified file with the
  same filename must not hit a stale cache. (Same lesson as the
  document-editor mtime-tick bug — content hash or monotonic counter,
  never timestamp comparison.)
- `parse_quality`: feeds the `unparseable` state in
  [`/src/features/extraction/shared/evidence_status.md`](/src/features/extraction/shared/evidence_status.md). `failed` = OCR/corrupt-file case, must
  render distinctly in the UI so a recruiter doesn't misread "no data"
  as "bad candidate."
- `raw_text_ref`: kept specifically for the rare fallback case where a
  job requirement asks about something the generic schema never
  anticipated — a narrow, single-field query against raw text, not a
  full re-extraction. Should be rare; frequent use means the schema is
  too narrow, not that this fallback needs expanding.

## Open Questions
- Hashing algorithm not chosen (any collision-resistant hash is
  sufficient here — this isn't a security context, just cache
  correctness).
