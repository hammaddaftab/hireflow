import { z } from "zod";

export const EducationEntrySchema = z.object({
  institution: z
    .string()
    .describe("Name of the school, university, or educational institution"),
  degree: z
    .string()
    .describe("Degree level or program name (e.g. BS, MS, Diploma)"),
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
  return `Extract each education entry from the resume text below: institution, degree, field of study, dates, and grade if stated. Do not infer prestige, tier, or accreditation status — extraction only.

Resume text:
${resumeText}`;
}

export const educationAspect = {
  name: "education",
  schema: EducationExtractionSchema,
  prompt: buildEducationPrompt,
} as const;
