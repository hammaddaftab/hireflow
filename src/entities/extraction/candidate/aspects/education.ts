import { z } from "zod";
import { DegreeLevelEnum } from "../../job/requirements";

export const InstitutionNormalizedSchema = z.object({
  raw: z
    .string()
    .describe("Raw university or school name as stated on the resume (e.g. 'FAST-NUCES', 'NUST')"),
  normalized: z
    .string()
    .nullable()
    .describe("Canonical institution name resolved via open-set master database/RAG, or null"),
});

export const DegreeLevelNormalizedSchema = z.object({
  raw: z
    .string()
    .describe("Raw degree title as stated in the document (e.g. 'Bachelor of Science in Computer Science')"),
  normalized: DegreeLevelEnum
    .nullable()
    .describe("Standardized degree tier enum matching job requirement scale (bachelors, masters, doctorate, diploma, high_school), or null if non-degree/bootcamp"),
});

export const FieldOfStudyNormalizedSchema = z.object({
  raw: z
    .string()
    .describe("Raw major or field of study as stated on the resume (e.g. 'BSCS', 'Software Engineering')"),
  normalized: z
    .string()
    .nullable()
    .describe("Canonical field of study matching master DB options (e.g. 'Computer Science'), or null"),
});

export const EducationEntrySchema = z.object({
  institution: InstitutionNormalizedSchema.describe(
    "University or school name structured as { raw, normalized }"
  ),
  degree_level: DegreeLevelNormalizedSchema.describe(
    "Degree level structured as { raw, normalized } with canonical tier enum matching job requirements"
  ),
  field: FieldOfStudyNormalizedSchema.describe(
    "Field of study or major structured as { raw, normalized }"
  ),
  start_date: z
    .string()
    .nullable()
    .describe("Start year or date (e.g. '2020' or '2020-09'), else null"),
  end_date: z
    .string()
    .nullable()
    .describe("End/graduation year formatted as YYYY or YYYY-MM, or null if currently enrolled (never string 'present')"),
  is_current: z
    .boolean()
    .default(false)
    .describe("True if currently enrolled / ongoing education, false if completed / past"),
  grade: z
    .string()
    .nullable()
    .describe("GPA, percentage, division, or honors if explicitly stated, else null"),
});

export const EducationExtractionSchema = z.object({
  entries: z
    .array(EducationEntrySchema)
    .default([])
    .describe("List of education entries in reverse chronological order"),
});

export type InstitutionNormalized = z.infer<typeof InstitutionNormalizedSchema>;
export type DegreeLevelNormalized = z.infer<typeof DegreeLevelNormalizedSchema>;
export type FieldOfStudyNormalized = z.infer<typeof FieldOfStudyNormalizedSchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type EducationExtraction = z.infer<typeof EducationExtractionSchema>;

/**
 * Builds the extraction prompt for Education.
 */
export function buildEducationPrompt(resumeText: string): string {
  return `Extract each education entry from the resume text below in reverse chronological order:
- institution: verbatim name in 'raw', canonical name in 'normalized' if standard, else null.
- degree_level: verbatim title in 'raw', normalized tier in 'normalized' strictly mapped to:
  * 'bachelors': 4-year BS, BE, BSc (Hons), BBA, etc.
  * 'masters': MS, MPhil, MSc, MBA.
  * 'doctorate': PhD, DPhil.
  * 'diploma': 2-year Associate Degree (ADP), DAE, polytechnic diploma.
  * 'high_school': FSc, ICS, FA, A-Levels, Matric, O-Levels.
  * null: short bootcamps, certificates, non-degree training.
- field: verbatim major in 'raw' (e.g. 'BSCS'), canonical discipline in 'normalized' (e.g. 'Computer Science') if clear, else null.
- start_date: start year or date (e.g. '2020' or '2020-09'), else null.
- end_date: end/graduation year (e.g. '2024' or '2024-06'), or null if currently enrolled (never return the string "present").
- is_current: true if currently enrolled / studying, false if completed / past.
- grade: GPA, percentage, or division if explicitly stated, else null.

Resume text:
${resumeText}`;
}

export const educationAspect = {
  name: "education",
  version: "1.0.0",
  schema: EducationExtractionSchema,
  prompt: buildEducationPrompt,
} as const;

