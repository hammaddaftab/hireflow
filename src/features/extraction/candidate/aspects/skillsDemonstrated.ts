import { z } from "zod";
import { EvidenceSpanSchema } from "../../shared/evidenceStatus";

export const SyntacticTierSchema = z.enum([
  "action_attributed",
  "peripheral_action",
  "context_listed",
]).describe(
  "Syntactic tier: action_attributed (actor doing/building), peripheral_action (passive exposure), context_listed (tools/stack line with no verb)"
);

export const SkillDemonstratedItemSchema = z.object({
  skill: z
    .string()
    .describe("Name of the demonstrated skill or technology"),
  source_entry_ref: z
    .string()
    .describe("Identifier or reference pointer to the employer or project entry where this skill was demonstrated"),
  syntactic_tier: SyntacticTierSchema,
  outcome_attached: z
    .string()
    .nullable()
    .describe("Literal measurable outcome text if present (e.g. 'reduced latency 40%'), otherwise null"),
  concrete_noun_present: z
    .boolean()
    .describe("True if a specific artifact, system, or scope is named (e.g. 'payment service' vs 'backend')"),
  cross_entry_consistency: z
    .enum(["consistent", "inconsistent", "single_mention"])
    .describe("Consistency of description scope across multiple mentions in work history"),
  evidence_span: EvidenceSpanSchema,
  evidence_status: z
    .enum(["confirmed", "ambiguous"])
    .describe("Confirmed for action_attributed; ambiguous for peripheral_action and context_listed"),
});

export const SkillsDemonstratedExtractionSchema = z.object({
  skills: z
    .array(SkillDemonstratedItemSchema)
    .default([])
    .describe("List of verified skills demonstrated in work history and projects"),
});

export type SyntacticTier = z.infer<typeof SyntacticTierSchema>;
export type SkillDemonstratedItem = z.infer<typeof SkillDemonstratedItemSchema>;
export type SkillsDemonstratedExtraction = z.infer<typeof SkillsDemonstratedExtractionSchema>;

/**
 * Builds the extraction prompt for Skills Demonstrated.
 */
export function buildSkillsDemonstratedPrompt(resumeText: string): string {
  return `For each work-history and project entry below, identify every skill mentioned and classify it into exactly one syntactic tier:
- action_attributed: the candidate is the grammatical subject of a verb that denotes doing/building/owning the skill use.
- peripheral_action: a verb is present but denotes passive exposure ("worked with", "assisted with", "familiar with").
- context_listed: the skill appears in a stack/tools list with no verb connecting it to the candidate at all.

For each skill, extract:
- outcome_attached: the literal measurable outcome text if present, else null.
- concrete_noun_present: true if a specific artifact/system is named, else false.
- cross_entry_consistency: consistent, inconsistent, or single_mention.
- evidence_span: the verbatim quote from the text.
- evidence_status: confirmed for action_attributed, ambiguous for peripheral_action or context_listed.

Resume text:
${resumeText}`;
}

export const skillsDemonstratedAspect = {
  name: "skills_demonstrated",
  schema: SkillsDemonstratedExtractionSchema,
  prompt: buildSkillsDemonstratedPrompt,
} as const;
