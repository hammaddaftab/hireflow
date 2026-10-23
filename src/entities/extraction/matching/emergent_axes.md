# Aspect: Emergent Axes Discovery (Matching Time)

## Status
Stable — Core component of Mechanism E pool-relative discovery (discovery-only pass; decoupled from one-by-one candidate ranking).

## Version
1.0.0

## Core Definition
Emergent Axis Discovery analyzes a Job Specification alongside the pointer-backed structured aspect digests of all viable contenders in an applicant pool to surface **3 to 5 pool-relative differentiating axes**.

Instead of asking a single prompt to both discover criteria and shortlist the Top 20 candidates simultaneously, this step strictly isolates **pool-wide axis discovery** from **per-candidate evaluation**:
1. **Pool-Wide Discovery (This Step)**: Reads all viable contender digests in context once to identify what separates top-tier contenders from baseline-qualified contenders in *this specific pool for this specific job*, and calibrates explicit `strong_criteria` and `moderate_criteria` rubrics anchored to actual pool evidence.
2. **Downstream One-by-One Ranking (Separate Step)**: Evaluates each candidate individually against the fixed, pool-calibrated rubrics emitted here, eliminating positional "lost in the middle" bias during candidate scoring.

## Prompt Schema (LLM Generation)
```json
{
  "pool_summary": "string (1 to 2 sentence synthesis of the talent distribution across the viable pool)",
  "axes": [
    {
      "label": "string (3 to 6 word UI-ready pill title, e.g. 'High-Throughput Go Concurrency (>10k rps)')",
      "category": "scale_and_impact | domain_and_architecture | career_trajectory_and_leadership | pedigree_and_environment | spiky_excellence",
      "rationale": "string (1 to 2 sentences explaining why this axis matters for the job and differentiates this pool)",
      "strong_criteria": "string (self-contained, pool-calibrated benchmark for scoring 'strong' in one-by-one evaluation; requires [action] ownership or verified trajectory)",
      "moderate_criteria": "string (self-contained benchmark for scoring 'moderate' in one-by-one evaluation)",
      "estimated_pool_prevalence": "string (e.g. '3/7 candidates')",
      "supporting_claims": [
        {
          "candidate_id": "string (matches [candidate_id] from digest header)",
          "ref_id": "string (matches 'c1', 's1', 'work_1', or 'header')"
        }
      ]
    }
  ]
}
```

## Stored & Resolved Schema (Post-Processing)
```json
{
  "pool_summary": "string",
  "axes": [
    {
      "axis_id": "string (e.g. 'axis_1', 'axis_2' — sequential and deterministic)",
      "label": "string",
      "category": "scale_and_impact | domain_and_architecture | career_trajectory_and_leadership | pedigree_and_environment | spiky_excellence",
      "rationale": "string",
      "strong_criteria": "string",
      "moderate_criteria": "string",
      "estimated_pool_prevalence": "string",
      "supporting_claims": [
        {
          "candidate_id": "string",
          "ref_id": "string",
          "digest_line": "string | null (exact line resolved from the candidate digest)",
          "evidence_span": "string | null (O(1) verbatim resume sentence resolved from JSONB profile)"
        }
      ]
    }
  ]
}
```

## Discovery Rules
- **No Candidate Shortlisting or Ranking**: Never emits a candidate ranking or Top 20 shortlist; outputs only the emergent axes and calibrated rubrics.
- **Beyond Baseline Knockouts**: Never repeats binary required skills or minimum experience thresholds already checked in Stage 0.
- **Empirical Pool Grounding**: Every axis must exist in the provided pool and cite valid `[candidate_id, ref_id]` pointers verified in post-processing.
- **Syntactic Tier Integrity**: `strong_criteria` requires active ownership (`[action]`) or verified trajectory/header facts, preventing passive (`[peripheral]`) keyword inflation.
- **Self-Contained Calibration**: `strong_criteria` and `moderate_criteria` state concrete numbers, mechanisms, and scope so an isolated per-candidate evaluator can score candidates one by one without needing the full pool in context.

## Related Files
- [`/src/entities/extraction/matching/emergentAxes.ts`](/src/entities/extraction/matching/emergentAxes.ts) — Zod schemas and prompt builder.
- [`/src/lib/extraction/digest/serializeCandidateDigest.ts`](/src/lib/extraction/digest/serializeCandidateDigest.ts) — Deterministic TypeScript serializer producing the input digests.
- [`/src/lib/extraction/ranking/discoverEmergentAxes.ts`](/src/lib/extraction/ranking/discoverEmergentAxes.ts) — Stage 0 knockout gatekeeper, digest indexer, citation verifier, and LLM discovery service.
- [`/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md`](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md) — Mechanism E technical specification.
