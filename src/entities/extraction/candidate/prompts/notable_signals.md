# Aspect: Notable Signals

## Status
Stable — Core component of Mechanism E outlier spike detection.

## Version
1.1.0

## Core Definition
A notable signal captures high-signal achievements, credentials, and outlier spikes that occur outside standard corporate employment. Rather than dropping non-work depth or shoehorning accomplishments into rigid closed categories, `notable_signals` uses an open-world `context_label` backed by propositional de-noising:
- Captures Open-Source repos/maintainership, competitive programming (ICPC, Kaggle), independent systems, security research/CVEs, consolidated certifications, patents, honors/awards, publications, and thesis depth.
- Enforces strict disjointness from work-history entries and standard education restatements.
- Consolidates all certifications/courses into at most one single signal.
- Enforces telegraphic compaction and line number fidelity (`[L...]` line IDs).
- Enforces syntactic ownership (`action_attributed` vs `peripheral_action`) so minor contributions are not inflated into ownership.

## Prompt Schema (LLM Generation)
```json
{
  "signals": [
    {
      "context_label": "string ('Open-Source' | 'Competition' | 'Project' | 'Certification' | 'Patent' | 'Security / CVE' | 'Honor' | 'Publication' | 'Education Depth')",
      "syntactic_tier": "action_attributed | peripheral_action",
      "raw_nouns": ["string (0 to 3 core technical tools/models/repos; [] for certs)"],
      "compact_action": "string (telegraphic 3 to 8 words naming the project/award/credential)",
      "outcome_attached": "string | null (telegraphic metric/rank/traction shorthand, 2 to 6 words)",
      "evidence_lines": ["string (line IDs from resume text, e.g. ['L45'])"]
    }
  ]
}
```

## Stored Schema (Database & ParsedCandidateProfile)
```json
{
  "signals": [
    {
      "signal_id": "string (e.g. 's1', 's2' — sequential and unique across profile)",
      "context_label": "string",
      "syntactic_tier": "action_attributed | peripheral_action",
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
1. **action_attributed**: The candidate is the primary author, founder, maintainer, builder, or award winner ("created", "maintained", "won 1st place", "authored").
2. **peripheral_action**: The candidate participated in, contributed to, or assisted with the effort ("contributed PRs", "participated in", "member of").

## Extraction Rules
- **Disjointness from Work History**: Everything within a work_history entry belongs in `role_claims`.
- **Disjointness from Education**: Merely restating a degree or school is forbidden. Only distinct honors/thesis titles are admitted under "Education Depth".
- **Certification Consolidation**: Consolidate all courses and certifications into at most one single signal.
- **Telegraphic Compaction**: 3-7 words for compact action; 2-6 words for outcome shorthand.
- **Line Marker Fidelity**: Cites line IDs from numbered resume text.

## Related Aspects
- `/src/entities/extraction/candidate/aspects/roleClaims.ts` — Within-job propositional claims.
- `/src/entities/extraction/candidate/aspects/education.ts` — Standard degree credentials.
- `/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts` — Skill attributions across roles.
