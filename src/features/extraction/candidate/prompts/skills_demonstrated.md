# Aspect: Skills Demonstrated

## Status
Stable (conceptually) — most developed aspect in the system. Implementation
not yet built.

## Core Definition
A skill enters `skills_demonstrated` if and only if it appears inside a
dated work-history or project entry AND is the object of a verb whose
grammatical subject is the candidate. Proximity to a job entry is NOT
sufficient evidence on its own — this must be enforced syntactically.

## JSON Schema
```json
{
  "skill": "string",
  "source_entry_ref": "pointer to work_history/project entry",
  "syntactic_tier": "action_attributed | peripheral_action | context_listed",
  "outcome_attached": "string | null (literal outcome text if present, else null)",
  "concrete_noun_present": "boolean",
  "cross_entry_consistency": "consistent | inconsistent | single_mention",
  "evidence_span": "string (verbatim quote)",
  "evidence_status": "confirmed | ambiguous (see /src/features/extraction/shared/evidence_status.md)"
}
```

## The three syntactic tiers
1. **action_attributed** — candidate is the actor: "built", "developed",
   "architected", "migrated", "led", "optimized". → evidence_status:
   confirmed
2. **peripheral_action** — verb present, weak/passive: "worked with",
   "familiar with", "assisted with", "exposure to". → evidence_status:
   ambiguous (subtype: peripheral)
3. **context_listed** — skill in a "Tech stack:" / "Tools:" line with no
   verb tying it to the candidate at all. Structurally the same
   evidence strength as skills_declared despite being date-attached. →
   evidence_status: ambiguous (subtype: unlinked)

## Decision-grade properties (on top of tier — required, not optional)
- **outcome_attached**: does the clause contain a measurable/concrete
  result ("reduced deployment time 60%")? Strongest recruiter-trusted
  signal, hardest to cheaply fake.
- **concrete_noun_present**: does the clause name a specific artifact/
  system/scope beyond the skill word itself ("payment microservice" vs
  "backend")? Mechanical structural check, not a semantic judgment call.
- **cross_entry_consistency**: if the skill appears in >1 entry, do the
  descriptions cohere in scope, or contradict? Narrow, cheap version of
  contradiction detection — text comparison over already-extracted data,
  no extra LLM call needed beyond the extraction pass itself.

## Extraction Prompt
```
For each work-history and project entry below, identify every skill
mentioned and classify it into exactly one syntactic tier:
- action_attributed: the candidate is the grammatical subject of a verb
  that denotes doing/building/owning the skill use.
- peripheral_action: a verb is present but denotes passive exposure
  ("worked with", "assisted with", "familiar with").
- context_listed: the skill appears in a stack/tools list with no verb
  connecting it to the candidate at all.

For each skill, also extract:
- outcome_attached: quote the exact clause stating a measurable result,
  or null if none exists. Do not infer or estimate a result that is not
  literally stated.
- concrete_noun_present: true if the sentence names a specific system,
  artifact, or scope beyond the skill word itself.

Do not assign a combined score. Return the three properties separately
for each skill mention. Quote the evidence_span verbatim; do not paraphrase.

Work history / project entries:
{entries}
```

## Explicitly rejected design
- A single composite "authenticity score" combining these properties —
  same failure mode as the killed `S(c) = Σw_i·f_i(c)` and fake
  `confidence: 0.61` patterns. Properties stay separate; the recruiter
  reads the pattern, the system does not pre-judge it.

## Open Questions
- cross_entry_consistency comparison logic (rule-based text diff vs a
  small dedicated LLM call) not yet chosen.
- Whether context_listed skills should be excluded from
  skills_demonstrated entirely and moved to a third bucket, vs kept here
  tagged ambiguous — currently kept here, revisit if it causes UI
  confusion in the evidence grid.
