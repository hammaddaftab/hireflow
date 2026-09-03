import { z } from "zod";
import { DegreeLevelEnum } from "../../job/requirements";

export const DegreeLevelNormalizedSchema = z.object({
  raw: z
    .string()
    .describe("Raw degree title as stated in the document (e.g. 'Bachelor of Science in Computer Science')"),
  normalized: DegreeLevelEnum
    .nullable()
    .describe("Standardized degree tier enum matching job requirement scale (bachelors, masters, doctorate, diploma, high_school), or null if unmappable"),
});

export type DegreeLevelNormalized = z.infer<typeof DegreeLevelNormalizedSchema>;

export const EducationEntrySchema = z.object({
  institution: z
    .string()
    .describe("Name of the school, university, or educational institution"),
  degree_level: DegreeLevelNormalizedSchema.describe(
    "Degree level structured as { raw, normalized } with canonical tier enum matching job requirements"
  ),
  field: z
    .string()
    .describe("Major or field of study (e.g. Computer Science, Electrical Engineering)"),
  start_date: z
    .string()
    .nullable()
    .describe("Start year formatted as YYYY or null if not stated"),
  end_date: z
    .string()
    .nullable()
    .describe("End year formatted as YYYY, 'present', or null if not stated"),
  grade: z
    .string()
    .nullable()
    .describe("GPA, division, or honors if explicitly stated, else null"),
});

export const EducationExtractionSchema = z.object({
  entries: z
    .array(EducationEntrySchema)
    .default([])
    .describe("List of education entries in reverse chronological order"),
});

export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type EducationExtraction = z.infer<typeof EducationExtractionSchema>;

/**
 * Builds the extraction prompt for Education.
 */
export function buildEducationPrompt(resumeText: string): string {
  return `Extract each education entry from the resume text below: institution, degree_level (raw degree string in 'raw', and normalized tier 'bachelors', 'masters', 'doctorate', 'diploma', 'high_school', or null in 'normalized'), field of study, dates, and grade if stated. Do not infer prestige, tier, or accreditation status — extraction only.

Resume text:
${resumeText}`;
}

export const educationAspect = {
  name: "education",
  schema: EducationExtractionSchema,
  prompt: buildEducationPrompt,
} as const;
