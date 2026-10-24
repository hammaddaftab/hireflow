# Aspect: Top Candidates Ranking (Mechanism E Stages 2 & 3)

## Status
Stable — Core component of Mechanism E tournament ranking (Stage 2 Reshuffled Halving + Stage 3 Balanced Finale and Pairwise Verification).

## Version
1.0.0

## Core Definition
Top Candidates Ranking executes the query-time comparative tournament of Mechanism E, taking the viable contender pool from Stage 0 deterministic filtering and the shared yardstick from Stage 1 Emergent Axes Discovery to surface a **Confident or Contested Top 3** with verbatim quote citations hydrated in $O(1)$.

The pipeline is split into two phases:
1. **Stage 2: Reshuffled Halving Rounds**: Reduces the viable pool (e.g. 60 -> 30 -> 15 -> 8) through balanced groups of up to 8 candidates.
2. **Stage 3: Full-CV Finale & Pairwise Resolution**: Ranks the final ~8 candidates using full raw CV text alongside structured tier-tagged claims across Latin-square permutations, verifying the Top 5 through bidirectional pairwise comparisons.

---

## Tournament Mechanics

### 1. Stage 2: Reshuffled Halving Rounds
- **The Grouping Rule**: A candidate is only eliminated if at least 3 candidates in their own group outrank them. Because at most 2 candidates in the entire applicant pool can be better than a true Top 3 contender, keeping the **top 4 per group of 8** mathematically guarantees that an unlucky grouping can never drop a true Top 3 contender.
- **Order Cancellation**: In every round, each group is evaluated twice in parallel: once in forward order (`[0..k-1]`) and once in reversed order (`[k-1..0]`). Each candidate's group standing is determined by their average rank across both orders, neutralizing first/last slot position bias.
- **Outside-the-Axes Standout Flag**: Prompt instructs the LLM to set `outside_axes_standout: true` with a clear explanation if a candidate exhibits non-standard spiky excellence (e.g. niche domain migrations, open-source traction, security CVEs) not captured by the discovered emergent axes.
- **Reproducible Seeded Shuffling**: Candidates are shuffled between halving rounds using a deterministic PRNG seed so tournaments are fully reproducible.

### 2. Stage 3A: Finalist Balanced Permutations (Latin-Square)
- **Full Raw CV + Tier Tags**: For the final ~8 contenders, full CV text is evaluated alongside structured tier-tagged claims (`[action]` vs `[peripheral]`). This eliminates digest compression loss on final selection while protecting against inflated resume prose.
- **Balanced Cyclic Shifts**: 4 permutations are constructed such that each finalist is positioned across the early, middle, and late thirds of the prompt context equally often.
- **Top 5 Advancement**: Finalists are ordered by average rank across all 4 permutations (`latin_square_avg_rank`), and the top 5 advance to pairwise verification.

### 3. Stage 3B: Bidirectional Pairwise Verification
- **All Top 5 Pairs**: For every unordered pair `{A, B}` among the Top 5 (10 pairs total), two calls are run in parallel: `(A, B)` and `(B, A)`.
- **Positional Order-Flip Detection**:
  - If both `(A, B)` and `(B, A)` declare A the winner, A is awarded a clean win (1 win for A, 1 loss for B).
  - If both `(A, B)` and `(B, A)` declare B the winner, B is awarded a clean win (1 win for B, 1 loss for A).
  - If the verdict flips when the prompt presentation flips (e.g. the first candidate is favored in both orders), a **positional tie** is recorded (1 tie for A, 1 tie for B).

### 4. Stage 3C: Confident vs. Contested Top 3 Resolution
- **Pairwise Scoring**: Candidates are ranked by pairwise points (`wins * 2 + ties`), broken by direct head-to-head outcome, then `latin_square_avg_rank`.
- **Confident Top 3**: If candidate #3 cleanly defeated #4 in their direct pairwise matchup with strictly higher points, the Top 3 is marked `confident`.
- **Contested Top 3**: If candidate #3 and #4 had a positional tie (order flip) or equal points, the outcome is marked `contested`. Both candidate #3 and #4 are presented in `top_candidates` with an explicit `contested_with` explanation.
- **$O(1)$ Verbatim Quote Hydration**: Cited pointers (`[candidate_id, ref_id]`) are resolved directly against indexed digests and stored PostgreSQL JSONB claims to attach `digest_line` and `evidence_span` without additional LLM calls.

---

## Schemas

### Stage 2: Group Halving Prompt Schema
```json
{
  "group_summary": "string (overview of talent distribution in this group)",
  "rankings": [
    {
      "candidate_id": "string",
      "rank": "number (1 = strongest in group)",
      "supporting_refs": ["c1", "s1", "work_1", "header"],
      "outside_axes_standout": "boolean",
      "rationale": "string (1-2 sentences with concrete evidence)"
    }
  ]
}
```

### Stage 3A: Finalist Permutation Prompt Schema
```json
{
  "ordering_summary": "string (overview of competitive separation)",
  "rankings": [
    {
      "candidate_id": "string",
      "rank": "number (1 = strongest overall finalist)",
      "comparative_notes": "string (1-2 sentences explaining separation)",
      "supporting_refs": ["c1", "work_1"]
    }
  ]
}
```

### Stage 3B: Bidirectional Pairwise Prompt Schema
```json
{
  "winner_id": "string (must match Candidate A or Candidate B)",
  "confidence": "clear | narrow",
  "decisive_reasons": "string (1-2 sentences on key decisive factors)",
  "supporting_claims": [
    {
      "candidate_id": "string",
      "ref_id": "string"
    }
  ]
}
```

### Stored and Resolved Output Schema
```json
{
  "top3_status": "confident | contested",
  "summary": "string (executive synthesis of outcome)",
  "top_candidates": [
    {
      "rank": "number (1, 2, 3, or tied 3)",
      "candidate_id": "string",
      "status": "confident | contested",
      "pairwise_wins": "number",
      "pairwise_ties": "number",
      "pairwise_losses": "number",
      "latin_square_avg_rank": "number",
      "headline_rationale": "string",
      "contested_with": "string | null",
      "supporting_claims": [
        {
          "candidate_id": "string",
          "ref_id": "string",
          "digest_line": "string | null",
          "evidence_span": "string | null"
        }
      ]
    }
  ],
  "emergent_axes": [],
  "telemetry": {}
}
```

---

## Related Files
- [`/src/entities/extraction/matching/topCandidatesRanking.ts`](/src/entities/extraction/matching/topCandidatesRanking.ts) — Zod schemas and prompt builders.
- [`/src/lib/extraction/ranking/rankTopCandidates.ts`](/src/lib/extraction/ranking/rankTopCandidates.ts) — Orchestration service for Stage 2 halving and Stage 3 finale.
- [`/src/entities/extraction/matching/emergentAxes.ts`](/src/entities/extraction/matching/emergentAxes.ts) — Stage 1 emergent axes schemas and prompt builder.
- [`/src/lib/extraction/ranking/discoverEmergentAxes.ts`](/src/lib/extraction/ranking/discoverEmergentAxes.ts) — Stage 0 gatekeeper and Stage 1 discovery service.
- [`/src/lib/extraction/digest/serializeCandidateDigest.ts`](/src/lib/extraction/digest/serializeCandidateDigest.ts) — Pointer-backed digest serializer.
- [`/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md`](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md) — Technical specification for Mechanism E.
