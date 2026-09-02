# Aspect: Logistics

## Status
Draft — schema simple, the RULE is the important part

## JSON Schema
```json
{
  "stated_salary_expectation": "string | \"not_stated\"",
  "stated_notice_period": "string | \"not_stated\"",
  "stated_relocation_willingness": "string | \"not_stated\"",
  "stated_availability": "string | \"not_stated\"",
  "languages": ["string"]
}
```

## Extraction Prompt
```
Extract salary expectation, notice period, relocation willingness, and
availability ONLY if explicitly and literally stated in the resume text
below. If a field is not explicitly stated, return exactly "not_stated"
— do not infer, estimate, or guess a value from context, seniority, or
any other signal. These fields are what a recruiter would otherwise
have to ask about directly; a wrong guess here is worse than an honest
gap.

Resume text:
{resume_text}
```

## Design Decisions
- This is the field group most often absent from resumes, and the one
  where recruiters most often screen live over WhatsApp/phone in the
  Pakistani market (sourced: informal-channel research earlier in
  project). "not_stated" here should visibly become the recruiter's
  fast checklist of what to actually ask the candidate.
- Hard rule, no exceptions: never infer these fields, even when
  inference seems obviously safe (e.g. inferring relocation
  unwillingness from a stated current city). If it's not written, it's
  not_stated.

## Open Questions
- None. This is the one aspect where the design should NOT get more
  complex — resist adding inference logic here even if it seems useful
  later.
