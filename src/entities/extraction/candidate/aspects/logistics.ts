import { z } from "zod";

export const SalaryExpectationNormalizedSchema = z.object({
  min: z
    .number()
    .nullable()
    .describe("Minimum expected compensation number if stated, else null"),
  max: z
    .number()
    .nullable()
    .describe("Maximum expected compensation number if stated (or equal to min if single amount), else null"),
  currency: z
    .string()
    .nullable()
    .describe("Currency code or symbol (e.g. 'PKR', 'USD'), else null"),
});

export const CandidateSalaryExpectationSchema = z.object({
  raw: z
    .string()
    .nullable()
    .describe("Verbatim salary expectation string from document, or null if not stated"),
  normalized: SalaryExpectationNormalizedSchema
    .nullable()
    .describe("Normalized numeric compensation matching job requirement keys, or null if unresolvable/not stated"),
});

export const NoticePeriodNormalizedSchema = z.object({
  value: z
    .number()
    .nullable()
    .describe("Numeric notice duration amount (e.g. 30), or null if not stated"),
  unit: z
    .enum(["days", "weeks", "months"])
    .nullable()
    .describe("Time unit for notice period matching job requirement unit scale"),
});

export const CandidateNoticePeriodSchema = z.object({
  raw: z
    .string()
    .nullable()
    .describe("Verbatim notice period string from document (e.g. '1 month', 'immediate'), or null if not stated"),
  normalized: NoticePeriodNormalizedSchema
    .nullable()
    .describe("Normalized numeric notice duration matching job requirement keys, or null if unresolvable/not stated"),
});

/**
 * Logistics extraction schema.
 * Hard rule: Never infer or guess these fields. If not literally written, return null/"not_stated".
 */
export const LogisticsExtractionSchema = z.object({
  salary_expectation: CandidateSalaryExpectationSchema.describe(
    "Salary expectation structured as { raw, normalized: { min, max, currency } }"
  ),
  notice_period: CandidateNoticePeriodSchema.describe(
    "Notice period structured as { raw, normalized: { value, unit } }"
  ),
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

export type SalaryExpectationNormalized = z.infer<typeof SalaryExpectationNormalizedSchema>;
export type CandidateSalaryExpectation = z.infer<typeof CandidateSalaryExpectationSchema>;
export type NoticePeriodNormalized = z.infer<typeof NoticePeriodNormalizedSchema>;
export type CandidateNoticePeriod = z.infer<typeof CandidateNoticePeriodSchema>;
export type LogisticsExtraction = z.infer<typeof LogisticsExtractionSchema>;

/**
 * Builds the extraction prompt for Logistics.
 */
export function buildLogisticsPrompt(resumeText: string): string {
  return `Extract salary expectation, notice period, relocation willingness, and availability ONLY if explicitly and literally stated in the resume text below. If a field is not explicitly stated, return null for salary and notice period, and exactly "not_stated" for other logistics fields — do not infer, estimate, or guess a value from context, seniority, or any other signal.
For salary_expectation: extract verbatim text in 'raw', and normalized numeric { min, max, currency } in 'normalized' if stated.
For notice_period: extract verbatim text in 'raw', and normalized numeric { value, unit: 'days' | 'weeks' | 'months' } in 'normalized' if stated.
Also extract spoken/written languages.

Resume text:
${resumeText}`;
}

export const logisticsAspect = {
  name: "logistics",
  version: "1.0.0",
  schema: LogisticsExtractionSchema,
  prompt: buildLogisticsPrompt,
} as const;
