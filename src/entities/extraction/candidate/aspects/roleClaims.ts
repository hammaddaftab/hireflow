import { z } from "zod";
import { SyntacticTierSchema } from "./skillsDemonstrated";

export const ExtractedClaimSkillSchema = z.object({
  skill: z
    .string()
    .describe("Raw extracted skill or technology name, e.g. 'Go', 'Kubernetes'"),
  syntactic_tier: SyntacticTierSchema.describe(
    "Syntactic ownership tier for this specific skill within the claim"
  ),
  canonical_skill: z
    .string()
    .nullable()
    .describe("Resolved canonical skill catalog key (null if uncataloged; resolved in post-processing)"),
});

export const ExtractedRoleClaimSchema = z.object({
  claim_id: z
    .string()
    .describe("Unique deterministic claim ID within profile, e.g. 'c1', 'c2'"),
  source_entry_ref: z
    .string()
    .describe("Identifier matching work_history entry_id (e.g. 'work_1')"),
  claim_tier: SyntacticTierSchema.describe(
    "Overall predicate ownership tier: action_attributed, peripheral_action, or context_listed"
  ),
  skills: z
    .array(ExtractedClaimSkillSchema)
    .describe("Per-skill tier attributions within this claim"),
  raw_nouns: z
    .array(z.string())
    .describe("Domain nouns, architectures, systems, e.g. ['gRPC', 'Kafka', 'order-routing microservices']"),
  compact_action: z
    .string()
    .describe("Elastic factual predicate (5-12 words) preserving core mechanisms and secondary clauses"),
  outcome_attached: z
    .string()
    .nullable()
    .describe("Quantified impact, metrics, or performance outcomes if literally stated, else null"),
  evidence_span: z
    .string()
    .describe("Complete verbatim source sentence or bullet from the resume text"),
});

export const RoleClaimsExtractionSchema = z.object({
  claims: z
    .array(ExtractedRoleClaimSchema)
    .describe("List of concrete factual role claims extracted across work history"),
});

export type ExtractedClaimSkill = z.infer<typeof ExtractedClaimSkillSchema>;
export type ExtractedRoleClaim = z.infer<typeof ExtractedRoleClaimSchema>;
export type RoleClaimsExtraction = z.infer<typeof RoleClaimsExtractionSchema>;

// Builds extraction prompt for Role Claims following propositional de-noising principles
export function buildRoleClaimsPrompt(resumeText?: string): string {
  const instructions = `Extract every concrete factual claim from every work-history entry into a structured claim tuple.
Follow the de-noising principle: your task is to strip filler, NOT to summarize or select highlights.
- Extract EVERY concrete claim: proper nouns, systems, architectures, domain workflows, metrics, tools, scope, team size, leadership, organizational context (such as company stage/size like "first engineer at a 4-person startup"), on-call rotations, post-mortems, database or cloud migrations, and regulatory work.
- Include non-skill scope and leadership claims (e.g. "led team of 6 engineers", "owned checkout SLA").
- Do NOT judge importance or select "top highlights" — keep every non-generic claim.
- Do NOT merge distinct claims together.
- Strip ONLY generic duty clichés ("attended daily standups", "wrote clean maintainable code", "collaborated with cross-functional team", "participated in agile ceremonies") and grammatical scaffolding ("was responsible for...", "helped with...").
- Preserve uncatalogued domain terms and nouns verbatim in raw_nouns.
- Never upgrade passive phrasing to active:
  * action_attributed: candidate is the grammatical subject of an active verb (architected, built, designed, led, migrated).
  * peripheral_action: verb denotes passive exposure or secondary role ("assisted with", "worked with", "familiar with").
  * context_listed: tools/stack list with no verb connecting it to the candidate.
- Each skill in the skills array must carry its own syntactic_tier (never let a passive skill inherit active status). Set canonical_skill to null.
- compact_action: 5-12 words capturing the factual predicate and core mechanism.
- outcome_attached: quantified impact, scale numbers, or metrics if literally stated (e.g. "18k rps, -44% p99", "PKR 120M/mo"), else null.
- evidence_span: complete verbatim sentence or bullet from the resume text.
- source_entry_ref: must match the corresponding work_history entry_id (e.g. "work_1").
- claim_id: assign sequential IDs ("c1", "c2", ...).`;

  return resumeText ? `${instructions}\n\nResume text:\n${resumeText}` : instructions;
}

export const roleClaimsAspect = {
  name: "role_claims",
  version: "1.0.0",
  schema: RoleClaimsExtractionSchema,
  prompt: buildRoleClaimsPrompt,
} as const;
