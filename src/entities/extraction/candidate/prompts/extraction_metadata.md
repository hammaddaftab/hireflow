# Aspect: Extraction Metadata

## Status
Completed

## Version
1.0.0

## JSON Schema
```json
{
  "file_hash": "string (SHA-256 hex digest of source file bytes)",
  "aspect_versions": {
    "identity": "string (e.g. '1.0.0')",
    "education": "string (e.g. '1.0.0')",
    "work_history": "string (e.g. '1.0.0')",
    "skills_demonstrated": "string (e.g. '1.0.0')",
    "skills_declared": "string (e.g. '1.0.0')",
    "logistics": "string (e.g. '1.0.0')"
  },
  "extracted_at": "YYYY-MM-DDTHH:mm:ssZ (ISO 8601 timestamp)",
  "parse_quality": "full | partial | failed",
  "raw_text_ref": "string (storage URI pointing to raw unparsed text)",
  "warnings": ["string (diagnostic parser/OCR warnings, empty if clean)"]
}
```

## Not a prompt — this is a computation spec
No LLM call for this file. Rules:
- `file_hash`: SHA-256 byte digest for cache keying. Re-uploads of the exact same document skip extraction entirely, while modified files with identical filenames trigger a fresh parse.
- `aspect_versions`: Records the snapshot of active aspect versions that generated this candidate profile, enabling instant debugging of parsed data versions.
- `extracted_at`: ISO 8601 timestamp for auditing extraction date, cache freshness, and recruiter UI context.
- `parse_quality`: Feeds the `unparseable` state in [`/src/entities/extraction/shared/evidence_status.md`](/src/entities/extraction/shared/evidence_status.md). Distinctly separates technical failures (OCR/corrupted scans) from genuine candidate gaps.
- `raw_text_ref`: Storage URI pointing to original unparsed text, preserved for narrow fallback queries without requiring full document re-extraction.
- Deduplication Architecture: `file_hash` caches document bytes at the file level; `cnic` (from [`identity.md`](/src/entities/extraction/candidate/prompts/identity.md)) deduplicates the candidate entity across different resume versions.

## Open Questions
- None currently — schema is finalized.
