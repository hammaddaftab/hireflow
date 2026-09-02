import { z } from "zod";

export const SkillRequirementItemSchema = z.object({
  skill: z
    .string()
    .describe("Name of the required or preferred skill"),
  min_years: z
    .number()
    .nullable()
    .describe("Minimum years of experience required specifically for this skill if stated, else null"),
  blocking: z
    .boolean()
    .describe("True for mandatory knockout skills, false for nice-to-have preferences"),
});

export const EducationRequirementSchema = z.object({
  degree_level: z
    .string()
    .nullable()
    .describe("Minimum degree level (e.g. Bachelor's, Master's) or null if not stated"),
  field: z
    .string()
    .nullable()
    .describe("Required or preferred field of study (e.g. Computer Science) or null"),
  blocking: z
    .boolean()
    .default(false)
    .describe("Whether minimum education is a hard knockout requirement"),
});

export const JobRequirementsExtractionSchema = z.object({
  title: z
    .string()
    .describe("Canonical job title parsed from the JD"),
  seniority_level: z
    .string()
    .nullable()
    .describe("Seniority level (e.g. Junior, Mid, Senior, Lead, Staff, Principal) or null"),
  skills_required: z
    .array(SkillRequirementItemSchema)
    .default([])
    .describe("List of mandatory/must-have skills (blocking = true)"),
  skills_preferred: z
    .array(SkillRequirementItemSchema)
    .default([])
    .describe("List of preferred/nice-to-have skills (blocking = false)"),
  min_years_total_experience: z
    .number()
    .nullable()
    .describe("Total minimum years of professional experience required, or null"),
  education_min: EducationRequirementSchema,
  location: z
    .string()
    .describe("Job location, city, or country requirement"),
  work_mode: z
    .enum(["remote", "hybrid", "onsite"])
    .describe("Work mode requirement"),
  compensation_band: z
    .string()
    .nullable()
    .describe("Stated salary range or budget if mentioned in the JD, else null"),
  max_notice_period: z
    .string()
    .nullable()
    .describe("Maximum acceptable notice period if mentioned, else null"),
  logistics_blocking: z
    .boolean()
    .default(true)
    .describe("Whether location and work mode are strict dealbreakers"),
});

export type SkillRequirementItem = z.infer<typeof SkillRequirementItemSchema>;
export type EducationRequirement = z.infer<typeof EducationRequirementSchema>;
export type JobRequirementsExtraction = z.infer<typeof JobRequirementsExtractionSchema>;

/**
 * Builds the extraction prompt for Job Description parsing.
 */
export function buildJobRequirementsPrompt(jdText: string): string {
  return `Parse the job description below into the structured schema.
Split skills into skills_required (must-have, blocking: true) and skills_preferred (nice-to-have, blocking: false) based on the language used in the JD itself (e.g. "must have", "required" vs "nice to have", "bonus", "preferred"). Default ambiguous skills to preferred, not required.
Extract min_years per skill only where the JD states it explicitly for that specific skill, not a general "X years experience" line applied across all skills.

Job description text:
${jdText}`;
}

export const requirementsAspect = {
  name: "requirements",
  schema: JobRequirementsExtractionSchema,
  prompt: buildJobRequirementsPrompt,
} as const;
