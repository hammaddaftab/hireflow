import { z } from "zod";

/**
 * Raw Skills Declared extraction schema.
 * Extracts the flat list of skills explicitly listed in a Skills section.
 */
export const SkillsDeclaredExtractionSchema = z.object({
  skills_declared: z
    .array(z.string())
    .default([])
    .describe("Flat list of skills from an explicit Skills, Technical Skills, or Tools section"),
});

export type SkillsDeclaredExtraction = z.infer<typeof SkillsDeclaredExtractionSchema>;

/**
 * Derived relations computed downstream between declared and demonstrated skills.
 */
export const SkillRelationSchema = z.enum([
  "corroborated",          // Declared skill also appears in skills_demonstrated
  "orphan",                // Declared but never appears in work history/projects
  "stale",                 // Demonstrated only in old roles, absent in recent stack
  "density_anomaly_flag",  // Ratio of declared skills to work history is abnormally high
]);

export const DerivedSkillComparisonSchema = z.object({
  skill: z.string(),
  relation: SkillRelationSchema,
});

export type SkillRelation = z.infer<typeof SkillRelationSchema>;
export type DerivedSkillComparison = z.infer<typeof DerivedSkillComparisonSchema>;

/**
 * Builds the extraction prompt for Skills Declared.
 */
export function buildSkillsDeclaredPrompt(resumeText: string): string {
  return `Extract the flat list of skills from any explicit "Skills:", "Technical Skills:", or similar labeled section in the resume below. Do not pull skills from work-history bullets here — that's skills_demonstrated, a separate pass. This list is weaker evidence by design; do not upgrade its status based on how it reads.

Resume text:
${resumeText}`;
}

export const skillsDeclaredAspect = {
  name: "skills_declared",
  schema: SkillsDeclaredExtractionSchema,
  prompt: buildSkillsDeclaredPrompt,
} as const;
