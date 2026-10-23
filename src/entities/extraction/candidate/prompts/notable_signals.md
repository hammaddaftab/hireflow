# Aspect: Notable Signals

## Status
Stable — Core component of Mechanism E outlier spike detection.

## Version
1.0.0

## Core Definition
A notable signal captures high-signal achievements, credentials, and outlier spikes that occur outside standard corporate employment. Rather than dropping non-work depth or shoehorning accomplishments into rigid closed categories, `notable_signals` uses an open-world `context_label` backed by propositional de-noising:
- Captures Open-Source repos/maintainership, competitive programming (ICPC, Kaggle), independent systems, security research/CVEs, certifications, patents, honors/awards, publications, and thesis depth.
- Strips generic filler while preserving proper nouns, repo identifiers, and metrics verbatim in `raw_nouns`.
- Enforces syntactic ownership (`action_attributed` vs `peripheral_action`) so minor contributions are not inflated into ownership.
- Backs each spike with a verbatim `evidence_span` from the resume text.

## JSON Schema
```json
{
  "signals": [
    {
      "signal_id": "string (e.g. 's1', 's2' — sequential and unique across profile)",
      "context_label": "string (open-world category, e.g. 'Open-Source', 'Competition', 'Project', 'Certification', 'Patent', 'Security / CVE', 'Honor', 'Publication', 'Education Depth')",
      "syntactic_tier": "action_attributed | peripheral_action",
      "raw_nouns": ["string (domain nouns, systems, tools, projects, e.g. 'go-rate-limit', 'distributed-systems')"],
      "compact_action": "string (elastic factual predicate, 5-12 words)",
      "outcome_attached": "string | null (literal metric or outcome if present, else null)",
      "evidence_span": "string (complete verbatim sentence or bullet from resume text)"
    }
  ]
}
```

## Syntactic Tiers
1. **action_attributed**: The candidate is the primary author, founder, maintainer, builder, or award winner ("created", "maintained", "won 1st place", "authored").
2. **peripheral_action**: The candidate participated in, contributed to, or assisted with the effort ("contributed PRs", "participated in", "member of").

## Extraction Rules
- **Non-Work Scope**: Covers all achievements outside corporate employment entries. Work-history duties belong in `role_claims`.
- **No Highlight Truncation**: Extract all genuine spikes; do not arbitrarily pick only the top one.
- **Verbatim Evidence**: `evidence_span` must exactly match the source sentence/bullet.
- **Traction and Metrics**: Retain measurable signals (e.g. "1.4k GitHub stars", "Top 5 nationally", "50k monthly downloads") in `outcome_attached`.

## Related Aspects
- `/src/entities/extraction/candidate/aspects/roleClaims.ts` — Within-job propositional claims.
- `/src/entities/extraction/candidate/aspects/education.ts` — Standard degree credentials.
- `/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts` — Skill attributions across roles.
