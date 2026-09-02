import { z } from "zod";

/**
 * Logistics extraction schema.
 * Hard rule: Never infer or guess these fields. If not literally written, return "not_stated".
 */
export const LogisticsExtractionSchema = z.object({
  stated_salary_expectation: z
    .string()
    .describe("Explicitly stated salary expectation or currency amount, else exactly 'not_stated'"),
  stated_notice_period: z
    .string()
    .describe("Explicitly stated notice period (e.g. '1 month', 'immediate'), else exactly 'not_stated'"),
  stated_relocation_willingness: z
    .string()
    .describe("Explicitly stated willingness to relocate or travel, else exactly 'not_stated'"),
  stated_availability: z
    .string()
    .describe("Explicitly stated start date or availability, else exactly 'not_stated'"),
  languages: z
    .array(z.string())
    .default([])
    .describe("Languages mentioned in the document (e.g. English, Urdu)"),
});

export type LogisticsExtraction = z.infer<typeof LogisticsExtractionSchema>;

/**
 * Builds the extraction prompt for Logistics.
 */
export function buildLogisticsPrompt(resumeText: string): string {
  return `Extract salary expectation, notice period, relocation willingness, and availability ONLY if explicitly and literally stated in the resume text below. If a field is not explicitly stated, return exactly "not_stated" — do not infer, estimate, or guess a value from context, seniority, or any other signal. Also extract spoken/written languages.

Resume text:
${resumeText}`;
}

export const logisticsAspect = {
  name: "logistics",
  schema: LogisticsExtractionSchema,
  prompt: buildLogisticsPrompt,
} as const;
