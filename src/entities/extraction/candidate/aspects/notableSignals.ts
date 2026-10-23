import { z } from "zod";

export const NotableSignalSyntacticTierSchema = z.enum([
  "action_attributed",
  "peripheral_action",
]).describe(
  "Syntactic ownership tier: action_attributed (creator/maintainer/lead/winner) or peripheral_action (contributor/participant)"
);

// LLM Prompt Schema for Notable Signals (used during generateObject extraction)
export const ExtractedNotableSignalPromptSchema = z.object({
  context_label: z
    .string()
    .describe(
      "Concise category: 'Open-Source', 'Competition', 'Project', 'Certification', 'Patent', 'Security / CVE', 'Honor', 'Publication', or 'Education Depth'"
    ),
  syntactic_tier: NotableSignalSyntacticTierSchema,
  raw_nouns: z
    .array(z.string())
    .describe(
      "0 to 3 core technical tools/models/repos for this spike (e.g. ['go-rate-limit'], ['BART', 'DistilBERT', 'FastAPI']). Use [] for certifications or when compact_action already names the subject. Never include file formats ('PDF', 'DOCX') or generic words ('doctors', 'patients', 'deep learning models')."
    ),
  compact_action: z
    .string()
    .describe(
      "Telegraphic 3 to 8 word description naming the project/award/credential and what was built/won (e.g. 'built DocuWiz AI document analyzer', 'maintainer of go-rate-limit distributed limiter', 'AWS Solutions Architect Pro; DeepLearning.ai MLOps; Duke LLMOps')"
    ),
  outcome_attached: z
    .string()
    .nullable()
    .describe(
      "Telegraphic metric/rank/traction shorthand (2 to 6 words, e.g. '1.4k GitHub stars', '-60% doc proc time', '93% forecasting acc', 'ICPC Regional Finalist') if literally stated, else null"
    ),
  evidence_lines: z
    .array(z.string())
    .describe("1 to 4 line IDs from <resume_text> (e.g. ['L45'])"),
});

export const NotableSignalsPromptSchema = z.object({
  signals: z.array(ExtractedNotableSignalPromptSchema),
});

// Stored Schema for Notable Signals (used by ParsedCandidateProfile and database persistence)
export const ExtractedNotableSignalSchema = z.object({
  signal_id: z
    .string()
    .describe("Unique deterministic signal ID within profile, e.g. 's1', 's2'"),
  context_label: z
    .string()
    .describe(
      "Open-world category label, e.g. 'Open-Source', 'Competition', 'Project', 'Certification', 'Patent', 'Security / CVE', 'Honor', 'Publication', 'Education Depth'"
    ),
  syntactic_tier: NotableSignalSyntacticTierSchema,
  raw_nouns: z
    .array(z.string())
    .describe("Domain nouns, systems, tools, projects, e.g. ['go-rate-limit', 'distributed-systems']"),
  compact_action: z
    .string()
    .describe("Elastic factual predicate (5-12 words) describing the achievement or spike"),
  outcome_attached: z
    .string()
    .nullable()
    .describe("Quantified impact, stars, downloads, rank, medals if literally stated, else null"),
  evidence_span: z
    .string()
    .describe("Complete verbatim source sentence or bullet from the resume text"),
  evidence_lines: z
    .array(z.string())
    .optional()
    .describe("Line IDs from numbered resume text that back this signal"),
});

export const NotableSignalsExtractionSchema = z.object({
  signals: z
    .array(ExtractedNotableSignalSchema)
    .describe("High-signal achievements and outlier spikes outside standard corporate employment"),
});

export type NotableSignalSyntacticTier = z.infer<typeof NotableSignalSyntacticTierSchema>;

export type ExtractedNotableSignalPrompt = z.infer<typeof ExtractedNotableSignalPromptSchema>;
export type NotableSignalsPrompt = z.infer<typeof NotableSignalsPromptSchema>;

export type ExtractedNotableSignal = z.infer<typeof ExtractedNotableSignalSchema>;
export type NotableSignalsExtraction = z.infer<typeof NotableSignalsExtractionSchema>;

// Builds extraction prompt for Notable Signals outside work history
export function buildNotableSignalsPrompt(resumeText?: string): string {
  const instructions = `Extract concrete technical spikes, projects, and credentials that sit OUTSIDE standard work_history entries.

1. STRICT DISJOINTNESS FROM WORK HISTORY AND STANDARD EDUCATION:
   - NEVER emit a notable signal for anything that belongs to a work_history entry (including volunteer roles, mentorship roles, or internships listed in work_history). Those belong exclusively in role_claims.
   - NEVER emit a notable signal that merely restates a degree level, major, or university from the education section (e.g. "Bachelor in Computer Science at X" is FORBIDDEN here). Only emit "Education Depth" if there is a distinct academic honor/spike such as "University Gold Medalist", "1st Rank in Department", a named fellowship/scholarship, or a specific research thesis title.

2. CONSOLIDATION & TELEGRAPHIC COMPACTION RULES:
   - Certifications: Consolidate ALL certifications/courses into AT MOST ONE single signal with context_label "Certification", raw_nouns: [], and compact_action listing the short credential names separated by semicolons (e.g. "AWS Solutions Architect Pro; DeepLearning.ai MLOps; Duke LLMOps").
   - Standalone Personal / Academic Projects: Emit 1 signal per distinct named project outside work history:
     * raw_nouns (0-3 items max): ONLY the 1 to 3 primary distinctive models/frameworks (e.g. ["Gemini 1.5 Pro", "LangChain"] or ["BART", "DistilBERT", "FastAPI"]). Never include file formats ("PDF", "DOCX"), generic phrases ("deep learning models", "intent recognition", "data drift detection", "customer satisfaction"), or target users ("doctors", "patients"). Do not repeat the project name in raw_nouns.
     * compact_action (3-7 words): "<verb> + <project name> + <2-4 word function>", e.g. "built DocuWiz AI document analyzer", "built Harvestify plant disease classifier", "built AutoML-Studio low-code ML platform", "designed GPT-4o customer support chatbot".
     * outcome_attached (2-6 words or null): Telegraphic metric shorthand (e.g. "-40% query resolution time", "-60% doc proc time", "-70% detection time, +30% yield pred", "93% forecasting acc"), or null if no literal metric is stated.
   - Open-Source / Competitions / Publications / Patents / CVEs / Honors:
     * raw_nouns (0-3 items): repo name, competition, or venue not already in compact_action.
     * compact_action (3-7 words): specific achievement or contribution.
     * outcome_attached (2-6 words or null): stars, citations, competition rank, prize, or CVE ID.
   - evidence_lines: cite the exact [L...] line IDs from <resume_text>.`;

  return resumeText ? `${instructions}\n\nResume text:\n${resumeText}` : instructions;
}

export const notableSignalsAspect = {
  name: "notable_signals",
  version: "1.1.0",
  schema: NotableSignalsPromptSchema,
  prompt: buildNotableSignalsPrompt,
} as const;
