# Aspect: Role Claims

## Status
Stable — Core component of Mechanism E propositional de-noising.

## Version
1.0.0

## Core Definition
A role claim captures a single concrete factual proposition within a work-history entry. Rather than summarizing an entire role into a prose paragraph or selecting arbitrary highlights, `role_claims` performs pool-blind propositional de-noising:
- Retains EVERY concrete claim (proper nouns, systems, architectures, domain workflows, metrics, tools, organizational context, team leadership, migrations, and regulatory work).
- Strips ONLY generic duty clichés and grammatical scaffolding.
- Attaches explicit syntactic tiers to the claim and to each extracted skill to immunize against resume inflation.
- Preserves verbatim sentence evidence spans for $O(1)$ quote hydration without query-time LLM regeneration.

## JSON Schema
```json
{
  "claims": [
    {
      "claim_id": "string (e.g. 'c1', 'c2' — sequential and unique across profile)",
      "source_entry_ref": "string (matches work_history entry_id, e.g. 'work_1')",
      "claim_tier": "action_attributed | peripheral_action | context_listed",
      "skills": [
        {
          "skill": "string (raw extracted skill name, e.g. 'Go', 'Kubernetes')",
          "syntactic_tier": "action_attributed | peripheral_action | context_listed",
          "canonical_skill": "string | null (resolved downstream via skill normalizer)"
        }
      ],
      "raw_nouns": ["string (domain nouns, architectures, systems, e.g. 'gRPC', 'Kafka', 'order-routing microservices')"],
      "compact_action": "string (elastic factual predicate, 5-12 words)",
      "outcome_attached": "string | null (literal metric or outcome if present, else null)",
      "evidence_span": "string (complete verbatim sentence or bullet from resume text)"
    }
  ]
}
```

## Syntactic Tiers
1. **action_attributed**: The candidate is the grammatical subject of an active verb denoting ownership, building, or leading ("architected", "built", "designed", "led", "migrated").
2. **peripheral_action**: A verb is present but denotes passive exposure or assisting ("assisted with", "worked with", "familiar with", "shadowed").
3. **context_listed**: The skill or noun appears in a stack/tools list without a connecting verb.

## Extraction Rules
- **No Summarization / Selection**: Do not judge which facts are important. Extract all non-generic claims.
- **No Claim Merging**: Distinct technical achievements must remain distinct tuples.
- **Filler Stripping**: Strip generic clichés like "attended daily standups", "wrote clean maintainable code", or "participated in agile ceremonies".
- **Verbatim Evidence**: `evidence_span` must exactly match the source sentence/bullet.
- **Downstream Canonical Resolution**: `canonical_skill` is set to `null` during extraction and resolved deterministically by pipeline code against the canonical skills catalog.

## Related Aspects
- `/src/entities/extraction/candidate/aspects/workHistory.ts` — Provides `entry_id` references.
- `/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts` — Evaluator-facing skill demonstrations.
- `/src/entities/extraction/candidate/aspects/notableSignals.ts` — High-signal non-work achievements.
