import { z } from "zod";
import { SyntacticTierSchema } from "./skillsDemonstrated";

// LLM Prompt Schema for Role Claims (used during generateObject extraction)
export const ExtractedClaimSkillPromptSchema = z.object({
  skill: z
    .string()
    .describe(
      "Concrete technical tool, language, framework, database, cloud service, or protocol (e.g. 'Go', 'gRPC', 'Kafka', 'PostgreSQL', 'AWS SageMaker'). Never include broad disciplines ('AI', 'ML', 'Data Science') or generic business phrases."
    ),
  syntactic_tier: SyntacticTierSchema,
});

export const ExtractedRoleClaimPromptSchema = z.object({
  source_entry_ref: z
    .string()
    .describe("Must match a work_history entry_id, e.g. 'work_1'"),
  claim_tier: SyntacticTierSchema,
  skills: z
    .array(ExtractedClaimSkillPromptSchema)
    .describe(
      "0 to 5 concrete technical tools/frameworks/services used in this claim, with no overlap with raw_nouns"
    ),
  raw_nouns: z
    .array(z.string())
    .describe(
      "0 to 3 specific non-skill proper nouns, domain standards/rails (e.g. 'Raast', '1Link'), named programs, or concrete org/team scope (e.g. '4-person startup', '6-engineer squad') NOT already in skills or compact_action. Use [] when skills and compact_action already cover all nouns."
    ),
  compact_action: z
    .string()
    .describe(
      "Telegraphic 3 to 7 word predicate (<verb> + <specific system/artifact/scope built or owned>, e.g. 'architected order-routing microservices', 'built multi-tenant inventory ledger'). Do not repeat tool names from skills or metrics from outcome_attached."
    ),
  outcome_attached: z
    .string()
    .nullable()
    .describe(
      "Telegraphic metric shorthand (2 to 8 words max, using symbols like +, -, /, k, M, mo, yr, e.g. '18k rps, -44% p99', '-$2M client cost', '+80% sales, +200% orders') if literally stated, else null"
    ),
  evidence_lines: z
    .array(z.string())
    .describe("1 to 4 line IDs from <resume_text> (e.g. ['L12'] or ['L14', 'L15']) that back this claim"),
});

export const RoleClaimsPromptSchema = z.object({
  claims: z.array(ExtractedRoleClaimPromptSchema),
});

// Stored Schema for Role Claims (used by ParsedCandidateProfile and database persistence)
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
  evidence_lines: z
    .array(z.string())
    .optional()
    .describe("Line IDs from numbered resume text that back this claim"),
});

export const RoleClaimsExtractionSchema = z.object({
  claims: z
    .array(ExtractedRoleClaimSchema)
    .describe("List of concrete factual role claims extracted across work history"),
});

export type ExtractedClaimSkillPrompt = z.infer<typeof ExtractedClaimSkillPromptSchema>;
export type ExtractedRoleClaimPrompt = z.infer<typeof ExtractedRoleClaimPromptSchema>;
export type RoleClaimsPrompt = z.infer<typeof RoleClaimsPromptSchema>;

export type ExtractedClaimSkill = z.infer<typeof ExtractedClaimSkillSchema>;
export type ExtractedRoleClaim = z.infer<typeof ExtractedRoleClaimSchema>;
export type RoleClaimsExtraction = z.infer<typeof RoleClaimsExtractionSchema>;

// Builds extraction prompt for Role Claims following propositional de-noising principles
export function buildRoleClaimsPrompt(resumeText?: string): string {
  const instructions = `De-noise each work_history entry into compact, non-redundant propositional claim tuples.

1. PROPOSITION ADMISSION GATE (DROP UNANCHORED RHETORIC):
   Emit a claim ONLY if the source text contains at least one verifiable anchor:
   (a) a specific named system, product, architecture, migration, or domain workflow built/owned (e.g. "order-routing microservices", "Raast/1Link settlement worker", "anti-spoofing face auth app", "Oracle-to-Postgres migration"), OR
   (b) a literal quantified metric, scale number, or concrete team/org scope (e.g. "18k rps, -44% p99", "120+ market entities", "led 6 engineers", "sole engineer at 4-person startup"), OR
   (c) a concrete technical mechanism paired with specific named tools.
   STRICTLY DROP any bullet or clause that is generic duty filler or unanchored rhetoric without a specific artifact, mechanism, or metric — e.g. "attended standups", "wrote clean maintainable code", "collaborated with cross-functional teams", "aligned AI strategies with business objectives", "leveraged cutting-edge tools/SDKs to optimize solutions", "validated tools and frameworks with partner teams", "deployed projects remotely in dynamic conditions", "engaged in ongoing research to apply cutting-edge methodologies", "drove innovation by contributing to the community".

2. INTRA-ROLE CONSOLIDATION (DO NOT EMIT 1 CLAIM PER REPETITIVE BULLET):
   Operate at the proposition level within each work_history entry.
   - If multiple bullets in the same role describe the same underlying system, program, volunteer membership, or responsibility from different angles, CONSOLIDATE them into ONE claim tuple (combining their concrete tools, scope, and metrics, and citing all contributing evidence_lines).
   - Emit separate claims within a role ONLY for genuinely distinct systems, products, or orthogonal responsibilities (typically 1 to 5 claims per role).
   - Never drop a unique concrete fact, planted domain detail, or metric — consolidate redundant fluff around it.

3. STRICT ORTHOGONALITY ACROSS FIELDS (ZERO WORD REPETITION):
   Each claim renders as: [tier] <skills + raw_nouns> -> <compact_action> | <outcome_attached>. Never repeat the same word or concept across slots:
   - skills (0-5 items): ONLY specific programming languages, frameworks, libraries, databases, cloud services, or protocols (e.g. "Go", "gRPC", "Kafka", "LangGraph", "AWS SageMaker", "OpenCV").
     * If specific sub-services are named ("AWS SageMaker", "AWS Bedrock"), list the specific sub-services OR the parent cloud, never both.
     * NEVER put broad fields or non-tools in skills ("AI", "ML techniques", "Generative AI", "Data Science", "Big Data", "data analysis", "sales forecasting", "mentorship", "projects").
   - raw_nouns (0-3 items): ONLY specific non-skill proper nouns, domain rails/standards ("Raast", "1Link", "State Bank"), named programs ("Kaggle-X"), or concrete org/team scope ("4-person startup", "team of 3") NOT already in skills or compact_action.
     * Return [] whenever skills and compact_action already capture all specific nouns.
     * NEVER put abstract/generic nouns in raw_nouns ("actionable insights", "cross-functional teams", "AI strategies", "growth strategies", "sales workflows", "operational costs", "industry-critical issues", "manual labor", "error rates", "students", "doctors", "patients", "projects", "models", "workflows", "PDF", "DOCX").
   - compact_action (STRICT 3-7 words): Telegraphic "<verb> + <specific artifact/system/scope>", e.g. "architected order-routing microservices", "built multi-tenant inventory ledger", "modeled sales across 120+ market entities", "mentored 4 data scientists (20h/wk)". Do NOT repeat tool lists from skills or numbers from outcome_attached.
   - outcome_attached (STRICT 2-8 words or null): Compress literal stated metrics into telegraphic shorthand using +, -, /, k, M, mo, yr, h (e.g. "18k rps, -44% p99", "-$2M client cost", "+80% sales, +200% orders, 3mo early", "-70% identity fraud", "250+ hrs/yr saved"). Return null if no literal metric/rank is stated (ignore vague claims like "improved efficiency and accuracy").
   - Syntactic tier integrity: never upgrade passive exposure ("assisted with", "contributed to", "worked with", "tested") to action_attributed; mark it peripheral_action.
   - evidence_lines: cite the exact [L...] line IDs from <resume_text> (1 to 4 line IDs).`;

  return resumeText ? `${instructions}\n\nResume text:\n${resumeText}` : instructions;
}

export const roleClaimsAspect = {
  name: "role_claims",
  version: "1.1.0",
  schema: RoleClaimsPromptSchema,
  prompt: buildRoleClaimsPrompt,
} as const;
