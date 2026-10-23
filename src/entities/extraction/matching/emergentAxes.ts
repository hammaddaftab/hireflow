import { z } from "zod";

export const EmergentAxisCategorySchema = z
  .enum([
    "scale_and_impact",
    "domain_and_architecture",
    "career_trajectory_and_leadership",
    "pedigree_and_environment",
    "spiky_excellence",
  ])
  .describe(
    "Primary comparative signal dimension: scale_and_impact (throughput, latency, data volume, revenue impact), domain_and_architecture (adjacent product workflows, protocols, migrations, reliability), career_trajectory_and_leadership (internal promotions, stint stability, team/org ownership), pedigree_and_environment (selective employers, high-bar engineering environments, academic distinction), or spiky_excellence (open-source traction, competitions, publications, patents, certifications)"
  );

export type EmergentAxisCategory = z.infer<typeof EmergentAxisCategorySchema>;

// LLM Prompt Schema for a single supporting claim/digest pointer
export const SupportingClaimRefPromptSchema = z.object({
  candidate_id: z
    .string()
    .describe(
      "Exact candidate identifier from the digest header bracket [candidate_id], e.g. 'cand_tariq' or 'mock_resume_a'"
    ),
  ref_id: z
    .string()
    .describe(
      "Exact pointer ID within that candidate's digest backing this axis: a claim ID ('c1', 'c2'), notable signal ID ('s1', 's2'), work entry ID ('work_1' for role/promotion/employer facts), or 'header' (for tenure/university/CGPA facts)"
    ),
});

// LLM Prompt Schema for a single discovered Emergent Axis (used during generateObject)
export const EmergentAxisPromptSchema = z.object({
  label: z
    .string()
    .describe(
      "Concise UI-ready pill title (3 to 6 words) naming the pool-relative differentiator, e.g. 'High-Throughput Go Concurrency (>10k rps)', 'Financial Settlement & Ledger Integrity', 'Rapid Promotion & Squad Leadership'"
    ),
  category: EmergentAxisCategorySchema,
  rationale: z
    .string()
    .describe(
      "1 to 2 sentences explaining why this axis matters for this specific job and how it separates the upper echelon of this specific candidate pool beyond baseline knockout requirements"
    ),
  strong_criteria: z
    .string()
    .describe(
      "Concrete, self-contained, pool-calibrated benchmark for a candidate to score 'strong' during isolated one-by-one evaluation. Must require active ownership ([action]) or verified trajectory/header evidence anchored to the top performers observed in this pool."
    ),
  moderate_criteria: z
    .string()
    .describe(
      "Concrete, self-contained benchmark for a candidate to score 'moderate' during isolated one-by-one evaluation (e.g. active ownership [action] at smaller scale/scope, adjacent mechanism without quantified scale, or peripheral [peripheral] exposure to top-tier systems)."
    ),
  estimated_pool_prevalence: z
    .string()
    .describe(
      "Approximate count of candidates in the provided contender pool exhibiting strong or moderate evidence on this axis (e.g. '3/7 candidates'), confirming the axis is genuinely selective"
    ),
  supporting_claims: z
    .array(SupportingClaimRefPromptSchema)
    .describe(
      "1 to 5 concrete [candidate_id, ref_id] citations from the provided digests that motivated discovering this axis and anchor its strong/moderate criteria"
    ),
});

export const EmergentAxesPromptSchema = z.object({
  pool_summary: z
    .string()
    .describe(
      "1 to 2 sentence synthesis of the overall talent distribution and standout clusters observed across the viable contender pool for this job"
    ),
  axes: z
    .array(EmergentAxisPromptSchema)
    .describe(
      "3 to 5 orthogonal, pool-relative emergent differentiating axes discovered across the contender pool (do NOT rank or shortlist candidates)"
    ),
});

export type SupportingClaimRefPrompt = z.infer<typeof SupportingClaimRefPromptSchema>;
export type EmergentAxisPrompt = z.infer<typeof EmergentAxisPromptSchema>;
export type EmergentAxesPrompt = z.infer<typeof EmergentAxesPromptSchema>;

// Stored & Hydrated Schema after deterministic TypeScript post-processing
export const SupportingClaimResolvedSchema = z.object({
  candidate_id: z.string(),
  ref_id: z.string(),
  digest_line: z
    .string()
    .nullable()
    .describe("Matched line from the candidate's serialized digest"),
  evidence_span: z
    .string()
    .nullable()
    .describe("Hydrated verbatim resume quote from JSONB if ref_id is a claim or signal"),
});

export const EmergentAxisSchema = z.object({
  axis_id: z
    .string()
    .describe("Deterministic sequential axis ID assigned in post-processing, e.g. 'axis_1', 'axis_2'"),
  label: z.string(),
  category: EmergentAxisCategorySchema,
  rationale: z.string(),
  strong_criteria: z.string(),
  moderate_criteria: z.string(),
  estimated_pool_prevalence: z.string(),
  supporting_claims: z.array(SupportingClaimResolvedSchema),
});

export const EmergentAxesExtractionSchema = z.object({
  pool_summary: z.string(),
  axes: z.array(EmergentAxisSchema),
});

export type SupportingClaimResolved = z.infer<typeof SupportingClaimResolvedSchema>;
export type EmergentAxis = z.infer<typeof EmergentAxisSchema>;
export type EmergentAxesExtraction = z.infer<typeof EmergentAxesExtractionSchema>;

// Builds the Stage 1 prompt that discovers pool-relative emergent axes without ranking/shortlisting candidates
export function buildEmergentAxesPrompt(
  jobSpecText: string,
  candidateDigestsBatchText: string,
  contenderCount?: number
): string {
  const countLabel =
    typeof contenderCount === "number" ? `${contenderCount} viable contenders` : "the viable contenders";

  return `You are executing the Emergent Axis Discovery step (Mechanism E) for a candidate screening pipeline.
Your ONLY task in this step is to analyze the Job Specification alongside the pointer-backed aspect digests of ${countLabel} in the applicant pool and discover 3 to 5 pool-relative Emergent Differentiating Axes.

CRITICAL SCOPE BOUNDARY — DO NOT RANK OR SHORTLIST CANDIDATES:
- Do NOT generate a Top 20 shortlist or rank individual candidates.
- Individual candidates will be evaluated one by one against the axes you discover here in a separate downstream pass.
- Focus exclusively on discovering the axes and calibrating their scoring rubrics so downstream one-by-one evaluation is grounded in this pool's actual distribution.

RULES FOR EMERGENT AXIS DISCOVERY:

1. GO BEYOND BASELINE KNOCKOUT REQUIREMENTS:
   - Minimum job requirements (e.g. required programming languages, minimum years of experience, required degree) are already enforced by a deterministic gatekeeper before this step.
   - NEVER emit an axis that merely checks binary presence of a required skill or minimum tenure (e.g. "Has Go and PostgreSQL experience" or "Meets 4+ years experience" are FORBIDDEN).
   - Instead, discover the unstated comparative signals that separate the top tier of THIS pool from baseline-qualified contenders for THIS job:
     * Scale & Quantified Engineering Impact: e.g. high-throughput concurrency (>10k rps), low-latency SLAs, large-scale database partitioning (25M+ rows), measurable revenue/cost outcomes.
     * Domain & Architectural Adjacency: e.g. financial settlement ledgers, idempotency & distributed locking, event-driven streaming, zero-downtime migrations, regulatory automation, multi-agent RAG orchestration.
     * Career Trajectory & Ownership Scope: e.g. rapid internal promotions ("promoted from..."), high average stint stability, technical/squad leadership, owning production SLAs or post-mortems.
     * Environment & Academic Pedigree: e.g. selective high-bar engineering employers, high-selectivity university + standout CGPA/honors.
     * Spiky Non-Work Excellence: e.g. open-source maintainership with traction, competitive programming (ICPC/Kaggle), publications, patents, or rich domain project spikes.

2. STRICT EMPIRICAL GROUNDING IN THE PROVIDED POOL:
   - Every discovered axis MUST emerge from real patterns present in <candidate_digests>.
   - Never invent a theoretical wishlist criterion if zero candidates in the pool exhibit it, and avoid trivial criteria satisfied identically by every candidate.
   - Back every axis with 1 to 5 concrete supporting_claims citing exact [candidate_id] and pointer IDs (e.g. claim IDs like 'c1', 'c2', signal IDs like 's1', role headers like 'work_1', or 'header').

3. RESPECT SYNTACTIC OWNERSHIP TIERS ([action] vs [peripheral] vs [listed]):
   - Each digest claim carries a syntactic ownership tag:
     * [cX:action] / [sX:action]: Candidate had active ownership (architected, built, led, designed, maintained).
     * [cX:peripheral] / [sX:peripheral]: Candidate had passive or assisted exposure (assisted with, worked with, participated in, or coursework/certifications).
     * [cX:listed]: Unbacked tool listing.
   - Never treat [peripheral] or [listed] claims as top-tier proof. Your strong_criteria MUST require active [action] ownership (or verified header/work_history trajectory facts).

4. CALIBRATE RUBRICS FOR ISOLATED ONE-BY-ONE EVALUATION:
   - Because the next pipeline step scores candidates one by one in isolation (without seeing the rest of the pool), strong_criteria and moderate_criteria MUST be self-contained and explicitly calibrated to the concrete metrics, systems, and scope observed in this pool:
     * strong_criteria: Defines what qualifies a candidate for 'strong' on this axis (anchored to the upper echelon observed in <candidate_digests>).
     * moderate_criteria: Defines what qualifies a candidate for 'moderate' on this axis (e.g. active ownership at smaller scale, adjacent system without explicit scale metrics, or peripheral involvement in high-scale systems).

5. ORTHOGONALITY:
   - Emit 3 to 5 distinct axes (or 2 to 4 if the pool has fewer than 4 candidates).
   - Ensure zero conceptual overlap between axes; each axis must measure an independent dimension of candidate excellence.

<job_specification>
${jobSpecText}
</job_specification>

<candidate_digests>
${candidateDigestsBatchText}
</candidate_digests>`;
}

export const emergentAxesAspect = {
  name: "emergent_axes",
  version: "1.0.0",
  schema: EmergentAxesPromptSchema,
  prompt: buildEmergentAxesPrompt,
} as const;
