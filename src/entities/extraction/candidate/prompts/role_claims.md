# Aspect: Role Claims

## Status
Stable — Core component of Mechanism E propositional de-noising.

## Version
1.1.0

## Core Definition
A role claim captures a single concrete factual proposition within a work-history entry. Rather than summarizing an entire role into a prose paragraph or selecting arbitrary highlights, `role_claims` performs pool-blind propositional de-noising with admission gates and intra-role consolidation:
- Retains verifiable technical propositions: proper nouns, systems, architectures, domain workflows, metrics, tools, organizational context, team leadership, migrations, and regulatory work.
- Proposition Admission Gate: drops unanchored rhetoric, generic duty filler, and vague buzzwords lacking concrete artifacts, mechanisms, or metrics.
- Intra-Role Consolidation: consolidates multiple bullets describing the same underlying system or responsibility within a role into a single claim tuple.
- Line Number Fidelity: cites exact `[L...]` line IDs from the numbered source text.
- Attaches explicit syntactic tiers to the claim and to each extracted skill to immunize against resume inflation.
- Post-processing hydrates verbatim `evidence_span` from source line IDs and resolves canonical skills catalog keys.

## Prompt Schema (LLM Generation)
```json
{
  "claims": [
    {
      "source_entry_ref": "string (matches work_history entry_id, e.g. 'work_1')",
      "claim_tier": "action_attributed | peripheral_action | context_listed",
      "skills": [
        {
          "skill": "string (concrete tool/language/framework, e.g. 'Go', 'Kafka')",
          "syntactic_tier": "action_attributed | peripheral_action | context_listed"
        }
      ],
      "raw_nouns": ["string (domain standards, named programs, org scope not in skills or compact_action)"],
      "compact_action": "string (telegraphic 3 to 7 word predicate: <verb> + <specific system/scope>)",
      "outcome_attached": "string | null (telegraphic metric shorthand, 2 to 8 words, e.g. '18k rps, -44% p99')",
      "evidence_lines": ["string (line IDs from resume text, e.g. ['L12', 'L13'])"]
    }
  ]
}
```

## Stored Schema (Database & ParsedCandidateProfile)
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
      "raw_nouns": ["string"],
      "compact_action": "string",
      "outcome_attached": "string | null",
      "evidence_span": "string (hydrated verbatim sentence or bullet from resume text)",
      "evidence_lines": ["string (optional source line IDs)"]
    }
  ]
}
```

## Syntactic Tiers
1. **action_attributed**: The candidate is the grammatical subject of an active verb denoting ownership, building, or leading ("architected", "built", "designed", "led", "migrated").
2. **peripheral_action**: A verb is present but denotes passive exposure or assisting ("assisted with", "worked with", "familiar with", "shadowed", "tested").
3. **context_listed**: The skill appears in a stack/tools list without a connecting verb.

## Extraction Rules
- **Proposition Admission Gate**: Drops bullets lacking concrete artifacts, mechanisms, or metrics.
- **Intra-Role Consolidation**: 1 to 5 claims per role; merges bullets describing the same underlying system.
- **Strict Orthogonality**: Zero word repetition between `skills`, `raw_nouns`, and `compact_action`.
- **Telegraphic Compaction**: 3-7 words for `compact_action`; 2-8 words shorthand for `outcome_attached`.
- **Downstream Canonical Resolution**: `canonical_skill` is resolved deterministically by pipeline code against the canonical skills catalog.

## Related Aspects
- `/src/entities/extraction/candidate/aspects/workHistory.ts` — Provides `entry_id` references.
- `/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts` — Evaluator-facing skill demonstrations.
- `/src/entities/extraction/candidate/aspects/notableSignals.ts` — High-signal non-work achievements.
