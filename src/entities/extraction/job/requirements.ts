import { z } from "zod";

export const SkillRequirementItemSchema = z.object({
  skill: z
    .string()
    .describe("Name of the required or preferred skill"),
  blocking: z
    .boolean()
    .describe("True for mandatory knockout skills, false for nice-to-have preferences"),
});

export const MinExperienceRequirementSchema = z.object({
  years: z
    .number()
    .nullable()
    .describe("Minimum years of general professional experience required, or null"),
  blocking: z
    .boolean()
    .default(false)
    .describe("Whether minimum experience is a hard knockout requirement"),
});

export const DegreeLevelEnum = z.enum([
  "bachelors",
  "masters",
  "doctorate",
  "diploma",
  "high_school",
]);

export type DegreeLevel = z.infer<typeof DegreeLevelEnum>;

export const EducationRequirementSchema = z.object({
  degree_level: DegreeLevelEnum
    .nullable()
    .describe("Canonical degree tier enum (bachelors, masters, doctorate, diploma, high_school), or null if not stated"),
  field: z
    .string()
    .nullable()
    .describe("Canonical field of study matching master DB options (e.g. 'Computer Science'); raw string omitted as job requirements do not require candidate-style audit confirmation"),
  blocking: z
    .boolean()
    .default(false)
    .describe("Whether minimum education is a hard knockout requirement"),
});

export const LocationRequirementSchema = z.object({
  city: z
    .string()
    .nullable()
    .describe("Canonical city name requirement matching canonical DB select (e.g. 'Lahore'), or null"),
  province: z
    .string()
    .nullable()
    .describe("Canonical province or region requirement matching canonical DB select (e.g. 'Punjab'), or null"),
  blocking: z
    .boolean()
    .default(true)
    .describe("Whether location is a strict dealbreaker"),
});

export const WorkModeRequirementSchema = z.object({
  mode: z
    .enum(["remote", "hybrid", "onsite"])
    .describe("Work mode requirement"),
  blocking: z
    .boolean()
    .default(true)
    .describe("Whether work mode is a strict dealbreaker"),
});

export const CompensationBandRequirementSchema = z.object({
  min: z
    .number()
    .nullable()
    .describe("Minimum compensation number if stated, else null"),
  max: z
    .number()
    .nullable()
    .describe("Maximum compensation number if stated, else null"),
  currency: z
    .string()
    .nullable()
    .describe("Currency code or symbol (e.g. 'PKR', 'USD'), else null"),
  blocking: z
    .boolean()
    .default(false)
    .describe("Whether budget ceiling is a strict dealbreaker"),
});

export const MaxNoticePeriodRequirementSchema = z.object({
  value: z
    .number()
    .nullable()
    .describe("Maximum notice period numeric amount if stated, else null"),
  unit: z
    .enum(["days", "weeks", "months"])
    .nullable()
    .describe("Time unit for notice period (days, weeks, months)"),
  blocking: z
    .boolean()
    .default(false)
    .describe("Whether notice period is a strict dealbreaker"),
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
  min_experience: MinExperienceRequirementSchema,
  education_min: EducationRequirementSchema,
  location: LocationRequirementSchema,
  work_mode: WorkModeRequirementSchema,
  compensation_band: CompensationBandRequirementSchema,
  max_notice_period: MaxNoticePeriodRequirementSchema,
});

export type SkillRequirementItem = z.infer<typeof SkillRequirementItemSchema>;
export type MinExperienceRequirement = z.infer<typeof MinExperienceRequirementSchema>;
export type EducationRequirement = z.infer<typeof EducationRequirementSchema>;
export type LocationRequirement = z.infer<typeof LocationRequirementSchema>;
export type WorkModeRequirement = z.infer<typeof WorkModeRequirementSchema>;
export type CompensationBandRequirement = z.infer<typeof CompensationBandRequirementSchema>;
export type MaxNoticePeriodRequirement = z.infer<typeof MaxNoticePeriodRequirementSchema>;
export type JobRequirementsExtraction = z.infer<typeof JobRequirementsExtractionSchema>;

/**
 * Builds the extraction prompt for Job Description parsing.
 */
export function buildJobRequirementsPrompt(jdText: string): string {
  return `Parse the job description below into the structured schema.
Split skills into skills_required (must-have, blocking: true) and skills_preferred (nice-to-have, blocking: false) based on the language used in the JD itself (e.g. "must have", "required" vs "nice to have", "bonus", "preferred"). Default ambiguous skills to preferred, not required.
Do not extract years per skill — extract minimum years of experience only at the top level in min_experience if stated.
For education_min: map degree_level strictly to 'bachelors', 'masters', 'doctorate', 'diploma', 'high_school', or null. Extract canonical field of study.
For location: extract canonical city and province/region as structured fields.
For compensation_band: extract numeric min, max, and currency if stated.
For max_notice_period: extract numeric value and unit (days, weeks, months) if stated.
Assign blocking (true/false) per requirement based on whether the JD treats it as a strict knockout requirement or a preference.

Job description text:
${jdText}`;
}

export const requirementsAspect = {
  name: "requirements",
  schema: JobRequirementsExtractionSchema,
  prompt: buildJobRequirementsPrompt,
} as const;

