# Aspect: Work History

## Status
Draft — structure decided, prompt not yet tested against real resumes

## JSON Schema
```json
{
  "entries": [
    {
      "employer": "string",
      "title": "string",
      "start_date": "YYYY-MM | YYYY",
      "end_date": "YYYY-MM | YYYY | \"present\"",
      "employment_type": "full_time | internship | contract | freelance",
      "raw_description": "string (original bullet text, verbatim)",
      "skills_demonstrated": "[see candidate/skills_demonstrated.md — populated by that aspect's own pass, not duplicated here]"
    }
  ]
}
```

## Extraction Prompt
```
Extract each distinct work-history entry from the resume text below.
For each entry, capture employer, title, start/end dates, and
employment_type. If employment_type is not explicitly stated, infer it
only from unambiguous cues (e.g. "Intern" in title = internship);
otherwise default to full_time and mark evidence_status as inferred.
Preserve the original bullet text verbatim in raw_description — do not
paraphrase or summarize it here. Do not extract skills in this pass —
that's a separate, dedicated extraction (see skills_demonstrated.md).

Resume text:
{resume_text}
```

## Design Decisions
- `employment_type` exists specifically so an internship doesn't
  silently count as full professional experience in downstream
  years-of-experience computation.
- `raw_description` is kept verbatim and separately from any derived
  skill data — this is the source-of-truth text that skills_demonstrated
  extraction runs against, and what evidence_span quotes are checked
  against for hallucination.
- Domain-specific years (e.g. "years of Python") are NOT stored here as
  a precomputed number — they're derived downstream from these dated
  entries + skills_demonstrated, so the computation stays auditable.

## Open Questions
- Multi-column / table-layout resumes (the layout problem raised
  earlier) — no explicit handling strategy decided yet. Likely needs a
  pre-processing normalization pass before this prompt runs, not solved
  by prompting alone.
