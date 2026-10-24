import { z } from "zod";
import {
  type EmergentAxis,
  EmergentAxisSchema,
  SupportingClaimResolvedSchema,
  type SupportingClaimResolved,
} from "./emergentAxes";

// Stage 2 Group Halving Prompt Schemas
export const GroupRankedCandidatePromptSchema = z.object({
  candidate_id: z
    .string()
    .describe("Exact candidate identifier from the digest, e.g. 'cand_01' or 'cand_tariq'"),
  rank: z
    .number()
    .int()
    .describe("1-based rank position within this group (1 = strongest contender in the group)"),
  supporting_refs: z
    .array(z.string())
    .describe("List of exact ref_ids from this candidate's digest justifying their rank, e.g. ['c1', 's1', 'work_1', 'header']"),
  outside_axes_standout: z
    .boolean()
    .describe("Set to true if candidate demonstrates rare spiky excellence or niche achievements outside the discovered emergent axes that warrants preserving them"),
  rationale: z
    .string()
    .describe("1 to 2 sentences explaining why this candidate earned this rank in the group, citing concrete evidence"),
});

export const GroupHalvingPromptSchema = z.object({
  group_summary: z
    .string()
    .describe("1 to 2 sentence overview of the talent distribution and competitive spread within this group"),
  rankings: z
    .array(GroupRankedCandidatePromptSchema)
    .describe("Complete ranked ordering of all candidates in this group from strongest (rank 1) to weakest"),
});

export type GroupRankedCandidatePrompt = z.infer<typeof GroupRankedCandidatePromptSchema>;
export type GroupHalvingPrompt = z.infer<typeof GroupHalvingPromptSchema>;

// Stage 3A Finalist Permutation Ranking Schemas
export const FinalistRankedCandidatePromptSchema = z.object({
  candidate_id: z
    .string()
    .describe("Exact candidate identifier, e.g. 'cand_01'"),
  rank: z
    .number()
    .int()
    .describe("1-based rank position among all finalists (1 = strongest overall)"),
  comparative_notes: z
    .string()
    .describe("1 to 2 sentences explaining why this finalist ranks higher than those below them, referencing verified claims"),
  supporting_refs: z
    .array(z.string())
    .describe("List of exact ref_ids backing this finalist's standing, e.g. ['c1', 'work_1']"),
});

export const FinalistPermutationPromptSchema = z.object({
  ordering_summary: z
    .string()
    .describe("1 to 2 sentence overview of the finalists' competitive separation and standout strengths"),
  rankings: z
    .array(FinalistRankedCandidatePromptSchema)
    .describe("Complete ordering of all finalists from 1 (strongest) to N (weakest)"),
});

export type FinalistRankedCandidatePrompt = z.infer<typeof FinalistRankedCandidatePromptSchema>;
export type FinalistPermutationPrompt = z.infer<typeof FinalistPermutationPromptSchema>;

// Stage 3B Bidirectional Pairwise Schemas
export const PairwiseSupportingClaimPromptSchema = z.object({
  candidate_id: z
    .string()
    .describe("Candidate identifier of the cited evidence, e.g. 'cand_01'"),
  ref_id: z
    .string()
    .describe("Ref ID within that candidate's profile, e.g. 'c1', 's1', 'work_1', 'header'"),
});

export const PairwiseComparisonPromptSchema = z.object({
  winner_id: z
    .string()
    .describe("Exact candidate_id of the stronger candidate (must match Candidate A or Candidate B)"),
  confidence: z
    .enum(["clear", "narrow"])
    .describe("'clear' if decisive gap in scale/impact/trajectory; 'narrow' if close call decided by subtle nuance"),
  decisive_reasons: z
    .string()
    .describe("1 to 2 sentences stating the exact decisive factor that gives the winner the edge for this job"),
  supporting_claims: z
    .array(PairwiseSupportingClaimPromptSchema)
    .describe("Concrete ref_ids from the candidates backing this head-to-head decision"),
});

export type PairwiseSupportingClaimPrompt = z.infer<typeof PairwiseSupportingClaimPromptSchema>;
export type PairwiseComparisonPrompt = z.infer<typeof PairwiseComparisonPromptSchema>;

// Stored and Resolved Output Schemas
export const TopCandidateRankStatusSchema = z.enum(["confident", "contested"]);
export type TopCandidateRankStatus = z.infer<typeof TopCandidateRankStatusSchema>;

export const TopCandidateEntrySchema = z.object({
  rank: z
    .number()
    .int()
    .describe("Assigned rank position (e.g. 1, 2, 3, or tied 3)"),
  candidate_id: z
    .string()
    .describe("Unique candidate identifier"),
  status: TopCandidateRankStatusSchema.describe("'confident' if clearly ahead; 'contested' if comparison split or tied"),
  pairwise_wins: z
    .number()
    .int()
    .describe("Count of clean pairwise wins (won in both forward and reversed directions)"),
  pairwise_ties: z
    .number()
    .int()
    .describe("Count of pairwise ties (verdict flipped when presentation order flipped)"),
  pairwise_losses: z
    .number()
    .int()
    .describe("Count of pairwise losses"),
  latin_square_avg_rank: z
    .number()
    .describe("Average rank position across Latin-square balanced permutations"),
  headline_rationale: z
    .string()
    .describe("1 to 2 sentence core justification for this candidate's ranking"),
  contested_with: z
    .string()
    .nullable()
    .describe("If contested, the candidate_id they split comparisons with and explanation"),
  supporting_claims: z
    .array(SupportingClaimResolvedSchema)
    .describe("Hydrated verbatim quotes and digest lines backing this standing"),
});

export type TopCandidateEntry = z.infer<typeof TopCandidateEntrySchema>;

// Telemetry and Tracking Schemas
export const HalvingGroupCandidateTelemetrySchema = z.object({
  candidate_id: z.string(),
  forward_rank: z.number(),
  reverse_rank: z.number(),
  avg_rank: z.number(),
  survived: z.boolean(),
  outside_axes_standout: z.boolean(),
  supporting_refs: z.array(z.string()),
  rationale: z.string(),
});

export const HalvingGroupTelemetrySchema = z.object({
  group_index: z.number(),
  candidates: z.array(z.string()),
  evaluations: z.array(HalvingGroupCandidateTelemetrySchema),
  survivors: z.array(z.string()),
});

export const HalvingRoundTelemetrySchema = z.object({
  round_number: z.number(),
  input_candidate_count: z.number(),
  survivor_count: z.number(),
  groups: z.array(HalvingGroupTelemetrySchema),
});

export const LatinSquareOrderingTelemetrySchema = z.object({
  permutation_index: z.number(),
  candidate_order: z.array(z.string()),
  rankings: z.array(
    z.object({
      candidate_id: z.string(),
      rank: z.number(),
      comparative_notes: z.string(),
      supporting_refs: z.array(z.string()),
    })
  ),
});

export const PairwiseMatchupTelemetrySchema = z.object({
  candidate_a: z.string(),
  candidate_b: z.string(),
  forward_winner: z.string(),
  forward_confidence: z.enum(["clear", "narrow"]),
  reverse_winner: z.string(),
  reverse_confidence: z.enum(["clear", "narrow"]),
  resolved_outcome: z.enum(["a_wins", "b_wins", "tie"]),
  decisive_reasons: z.string(),
  supporting_claims: z.array(
    z.object({
      candidate_id: z.string(),
      ref_id: z.string(),
    })
  ),
});

export const TopCandidatesRankingResultSchema = z.object({
  top3_status: TopCandidateRankStatusSchema.describe("'confident' if Top 3 is unambiguous; 'contested' if 3rd/4th split"),
  summary: z
    .string()
    .describe("1 to 2 sentence executive synthesis of the Top 3 outcome"),
  emergent_pool_summary: z
    .string()
    .optional()
    .describe("Synthesis of talent distribution and standout clusters across viable pool"),
  top_candidates: z
    .array(TopCandidateEntrySchema)
    .describe("Top candidates (3 if confident, 4 if #3 contested)"),
  emergent_axes: z
    .array(EmergentAxisSchema)
    .describe("Emergent axes used as shared yardstick"),
  telemetry: z.object({
    stage0_viable_count: z.number(),
    stage0_knocked_out: z
      .array(
        z.object({
          candidate_id: z.string(),
          candidate_name: z.string(),
          contradictions: z.array(
            z.object({
              id: z.string(),
              label: z.string(),
              reasoning: z.string(),
            })
          ),
        })
      )
      .optional(),
    stage2_rounds: z.array(HalvingRoundTelemetrySchema),
    stage3_finalist_ids: z.array(z.string()),
    stage3_latin_square_orderings: z.array(LatinSquareOrderingTelemetrySchema),
    stage3_top5_candidate_ids: z.array(z.string()),
    stage3_pairwise_matchups: z.array(PairwiseMatchupTelemetrySchema),
  }),
});

export type HalvingGroupCandidateTelemetry = z.infer<typeof HalvingGroupCandidateTelemetrySchema>;
export type HalvingGroupTelemetry = z.infer<typeof HalvingGroupTelemetrySchema>;
export type HalvingRoundTelemetry = z.infer<typeof HalvingRoundTelemetrySchema>;
export type LatinSquareOrderingTelemetry = z.infer<typeof LatinSquareOrderingTelemetrySchema>;
export type PairwiseMatchupTelemetry = z.infer<typeof PairwiseMatchupTelemetrySchema>;
export type TopCandidatesRankingResult = z.infer<typeof TopCandidatesRankingResultSchema>;

// Formats emergent axes into a readable yardstick block for prompts
function formatAxesYardstick(emergentAxes: EmergentAxis[]): string {
  if (!emergentAxes || emergentAxes.length === 0) {
    return "No pre-computed emergent axes provided. Evaluate candidates based on job requirements and demonstrated impact.";
  }

  return emergentAxes
    .map((axis, idx) => {
      return `Axis ${idx + 1} [${axis.axis_id}]: ${axis.label} (${axis.category})
- Rationale: ${axis.rationale}
- Strong Criteria: ${axis.strong_criteria}
- Moderate Criteria: ${axis.moderate_criteria}`;
    })
    .join("\n\n");
}

// Builds the Stage 2 prompt for ranking candidates in a halving group
export function buildGroupHalvingPrompt(
  jobSpecText: string,
  emergentAxes: EmergentAxis[],
  groupDigestsText: string,
  groupMeta?: { roundNumber?: number; groupIndex?: number; totalInGroup?: number }
): string {
  const roundLabel = groupMeta?.roundNumber ? `Round ${groupMeta.roundNumber}` : "Halving Round";
  const groupLabel = groupMeta?.groupIndex != null ? `Group ${groupMeta.groupIndex + 1}` : "Group";
  const countLabel = groupMeta?.totalInGroup ? `${groupMeta.totalInGroup} candidates` : "the candidates in this group";

  return `You are executing Stage 2 Reshuffled Halving (${roundLabel}, ${groupLabel}) for a candidate ranking tournament (Mechanism E).
Your task is to analyze the Job Specification, the pool's Emergent Differentiating Axes (used strictly as a shared yardstick), and the pointer-backed aspect digests of ${countLabel}, then rank all candidates in this group from strongest to weakest.

EVALUATION RULES:

1. USE DISCOVERED AXES AS A SHARED YARDSTICK:
   - Use the emergent axes below as a calibrated standard of comparative excellence across candidates.
   - Do NOT calculate arbitrary arithmetic score sums. Evaluate holistic fit and depth against these axes and the role requirements.

2. PRESERVE OUTSIDE-THE-AXES STANDOUTS:
   - If a candidate demonstrates rare spiky excellence or high-impact accomplishments that do not fit into the discovered axes (e.g. major open-source traction, significant patents, rare domain migration, critical infrastructure ownership), set "outside_axes_standout": true.
   - Provide an explicit explanation in "rationale" so candidates with non-standard excellence are not eliminated by grouping.

3. STRICT SYNTACTIC TIER INTEGRITY:
   - Each claim in the digests is tagged with syntactic ownership:
     * [cX:action] / [sX:action]: Candidate had active direct ownership (architected, built, designed, led).
     * [cX:peripheral] / [sX:peripheral]: Candidate had passive or assisted exposure (assisted with, maintained pipeline, coursework).
     * [cX:listed]: Unbacked tool listing.
   - Never treat [peripheral] or [listed] claims as equivalent to [action] ownership. Reward genuine technical leadership and concrete metrics.

4. FULL GROUP RANKING:
   - Provide a complete ordering of ALL candidates in this group: rank 1 is the strongest, rank N is the weakest.
   - Cite concrete pointer IDs in "supporting_refs" (e.g. 'c1', 's1', 'work_1', 'header') for each candidate.

<job_specification>
${jobSpecText}
</job_specification>

<emergent_axes_yardstick>
${formatAxesYardstick(emergentAxes)}
</emergent_axes_yardstick>

<candidate_group_digests>
${groupDigestsText}
</candidate_group_digests>`;
}

// Builds the Stage 3A prompt for ranking finalists across balanced permutations
export function buildFinalistPermutationPrompt(
  jobSpecText: string,
  emergentAxes: EmergentAxis[],
  finalistsBatchText: string,
  orderingMeta?: { permutationIndex?: number; totalPermutations?: number }
): string {
  const permLabel =
    orderingMeta?.permutationIndex != null
      ? `Permutation ${orderingMeta.permutationIndex + 1} of ${orderingMeta.totalPermutations || 4}`
      : "Balanced Permutation";

  return `You are executing Stage 3A Finalist Ranking (${permLabel}) in the Mechanism E candidate ranking pipeline.
You are evaluating the final tournament contenders. Each finalist is presented with both their full raw CV text and their structured tier-tagged claims digest.

EVALUATION RULES:

1. FULL CV DETAIL WITH SYNTACTIC TIER GUARDS:
   - You have access to each candidate's full raw CV text to eliminate compression loss.
   - Simultaneously, use the candidate's structured claim tags ([action] vs [peripheral]) to guard against inflated prose.
   - Active achievements ([action]) must be weighted over passive exposure ([peripheral]).

2. GROUNDED IN EMERGENT AXES:
   - Evaluate contenders against the pool's Emergent Differentiating Axes and specific job needs.
   - Focus on concrete systems, scale, architectural ownership, and career trajectory.

3. COMPLETE FINALIST ORDERING:
   - Rank ALL finalists in this set from rank 1 (strongest candidate overall) to rank N (weakest finalist).
   - In "comparative_notes", explain the decisive separation between each finalist and those ranked below them.
   - Cite supporting pointer IDs in "supporting_refs" (e.g. 'c1', 's1', 'work_1', 'header').

<job_specification>
${jobSpecText}
</job_specification>

<emergent_axes_yardstick>
${formatAxesYardstick(emergentAxes)}
</emergent_axes_yardstick>

<finalists>
${finalistsBatchText}
</finalists>`;
}

// View model for pairwise finalist comparison
export interface CandidatePairwiseView {
  candidateId: string;
  candidateName?: string;
  digestText: string;
  fullCvText: string;
}

// Formats a candidate view for pairwise prompt presentation
function formatPairwiseCandidateBlock(label: "Candidate A" | "Candidate B", candidate: CandidatePairwiseView): string {
  const nameLine = candidate.candidateName ? `Name: ${candidate.candidateName}` : null;
  return `### ${label} [ID: ${candidate.candidateId}]
${nameLine ? `${nameLine}\n` : ""}
[TIER-TAGGED CLAIMS DIGEST]
${candidate.digestText}

[FULL RESUME TEXT]
${candidate.fullCvText}`;
}

// Builds the Stage 3B prompt for bidirectional pairwise comparison
export function buildPairwiseComparisonPrompt(
  jobSpecText: string,
  emergentAxes: EmergentAxis[],
  candidateA: CandidatePairwiseView,
  candidateB: CandidatePairwiseView
): string {
  return `You are executing Stage 3B Bidirectional Pairwise Verification in the Mechanism E candidate ranking pipeline.
Your task is to perform an isolated head-to-head comparison between Candidate A and Candidate B for this specific job.

EVALUATION RULES:

1. DECIDE THE STRONGER CANDIDATE:
   - Choose exactly ONE winner between Candidate A and Candidate B.
   - "winner_id" MUST match either "${candidateA.candidateId}" or "${candidateB.candidateId}".

2. EVIDENCE-BASED SEPARATION:
   - Base your decision on proven engineering scope, quantified metrics, architecture ownership, and trajectory.
   - Respect syntactic tiers: verify that claimed skills and impacts represent active ownership ([action]) rather than passive exposure ([peripheral]).
   - Do NOT favor whichever candidate happens to be listed first; evaluate purely on merit.

3. CONFIDENCE AND REASONS:
   - Set "confidence" to "clear" if one candidate decisively outclasses the other.
   - Set "confidence" to "narrow" if it is a close call decided by subtle distinctions.
   - State the decisive factors in 1 to 2 sentences in "decisive_reasons".
   - Cite supporting pointer IDs in "supporting_claims" with candidate_id and ref_id.

<job_specification>
${jobSpecText}
</job_specification>

<emergent_axes_yardstick>
${formatAxesYardstick(emergentAxes)}
</emergent_axes_yardstick>

<candidate_a>
${formatPairwiseCandidateBlock("Candidate A", candidateA)}
</candidate_a>

<candidate_b>
${formatPairwiseCandidateBlock("Candidate B", candidateB)}
</candidate_b>`;
}

// Aspect definitions for the ranking steps
export const groupHalvingAspect = {
  name: "group_halving",
  version: "1.0.0",
  schema: GroupHalvingPromptSchema,
  prompt: buildGroupHalvingPrompt,
} as const;

export const finalistPermutationAspect = {
  name: "finalist_permutation",
  version: "1.0.0",
  schema: FinalistPermutationPromptSchema,
  prompt: buildFinalistPermutationPrompt,
} as const;

export const pairwiseComparisonAspect = {
  name: "pairwise_comparison",
  version: "1.0.0",
  schema: PairwiseComparisonPromptSchema,
  prompt: buildPairwiseComparisonPrompt,
} as const;
