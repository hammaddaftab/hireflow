import { z } from "zod";

/**
 * Raw Skills Declared extraction schema.
 * Extracts the flat list of technical skills explicitly listed in a Skills section.
 */
export const SkillsDeclaredExtractionSchema = z.object({
  skills_declared: z
    .array(z.string())
    .default([])
    .describe("Flat list of technical skills, languages, frameworks, and tools from explicit Skills section"),
});

export type SkillsDeclaredExtraction = z.infer<typeof SkillsDeclaredExtractionSchema>;

/**
 * Per-skill derived relations computed downstream against skills_demonstrated.
 */
export const SkillRelationSchema = z.enum([
  "corroborated", // Declared skill also appears in skills_demonstrated
  "orphan",       // Declared but never appears in work history/projects
]);

export const DerivedSkillComparisonSchema = z.object({
  skill: z.string(),
  relation: SkillRelationSchema,
});

/**
 * Full downstream comparison result including the document-level signal.
 */
export const SkillsComparisonResultSchema = z.object({
  skills: z
    .array(DerivedSkillComparisonSchema)
    .describe("Per-skill comparisons between declared and demonstrated skills"),
  density_anomaly: z
    .boolean()
    .default(false)
    .describe("Document-level signal: true if ratio of declared skills to work history sits abnormally outside baseline"),
});

export type SkillRelation = z.infer<typeof SkillRelationSchema>;
export type DerivedSkillComparison = z.infer<typeof DerivedSkillComparisonSchema>;
export type SkillsComparisonResult = z.infer<typeof SkillsComparisonResultSchema>;

/**
 * Builds the extraction prompt for Skills Declared.
 */
export function buildSkillsDeclaredPrompt(resumeText: string): string {
  return `Extract the flat list of technical skills, programming languages, frameworks, libraries, databases, and infrastructure tools from any explicit "Skills:", "Technical Skills:", or similar labeled section in the resume below.
Do not pull skills from work-history bullets here — that's skills_demonstrated, a separate pass.
Exclude generic soft skills, interpersonal traits, or subjective claims (e.g. 'communication', 'team player', 'problem solving', 'leadership').
This list is weaker evidence by design; do not upgrade its status based on how it reads.

Resume text:
${resumeText}`;
}

export const skillsDeclaredAspect = {
  name: "skills_declared",
  version: "1.0.0",
  schema: SkillsDeclaredExtractionSchema,
  prompt: buildSkillsDeclaredPrompt,
} as const;

