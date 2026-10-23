import { z } from "zod";

export const NotableSignalSyntacticTierSchema = z.enum([
  "action_attributed",
  "peripheral_action",
]).describe(
  "Syntactic ownership tier: action_attributed (creator/maintainer/lead/winner) or peripheral_action (contributor/participant)"
);

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
});

export const NotableSignalsExtractionSchema = z.object({
  signals: z
    .array(ExtractedNotableSignalSchema)
    .describe("High-signal achievements and outlier spikes outside standard corporate employment"),
});

export type NotableSignalSyntacticTier = z.infer<typeof NotableSignalSyntacticTierSchema>;
export type ExtractedNotableSignal = z.infer<typeof ExtractedNotableSignalSchema>;
export type NotableSignalsExtraction = z.infer<typeof NotableSignalsExtractionSchema>;

// Builds extraction prompt for Notable Signals outside work history
export function buildNotableSignalsPrompt(resumeText?: string): string {
  const instructions = `Extract all high-signal achievements, outlier spikes, and technical credentials outside standard corporate employment.
Covers:
- Open-Source (libraries maintained, key contributions, repos).
- Competitions & Hackathons (ICPC, Kaggle grandmaster, CTFs, national contests).
- Personal / Independent Technical Projects.
- Certifications (AWS Solutions Architect, CKA, etc.).
- Patents and Intellectual Property.
- Security disclosures, CVEs, bug bounties.
- Honors, awards, fellowships, national merit scholarships.
- Publications, conference papers, research presentations.
- Notable Education Depth (thesis defense topic, department rank, university gold medal).

Follow the de-noising principle:
- Extract EVERY concrete achievement or outlier signal. Do NOT summarize or pick only one highlight.
- Do NOT extract standard work-history job duties here — those belong in role_claims.
- Strip generic filler and marketing adjectives.
- Preserve repository names, tools, architectures, and proper nouns verbatim in raw_nouns.
- Assign syntactic_tier:
  * action_attributed: candidate created, authored, built, founded, maintained, won first place.
  * peripheral_action: candidate contributed to, participated in, or assisted with.
- compact_action: 5-12 words capturing the specific spike or contribution.
- outcome_attached: measurable traction, stars, citations, downloads, competition rank if stated, else null.
- evidence_span: complete verbatim source sentence or bullet.
- signal_id: assign sequential IDs ("s1", "s2", ...).
- context_label: concise descriptive category (e.g. "Open-Source", "Competition", "Project", "Security / CVE", "Honor", "Publication", "Education Depth").`;

  return resumeText ? `${instructions}\n\nResume text:\n${resumeText}` : instructions;
}

export const notableSignalsAspect = {
  name: "notable_signals",
  version: "1.0.0",
  schema: NotableSignalsExtractionSchema,
  prompt: buildNotableSignalsPrompt,
} as const;
