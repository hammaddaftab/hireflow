import { z } from "zod";

export const EmploymentTypeValueSchema = z.enum([
  "full_time",
  "internship",
  "contract",
  "freelance",
]);

export const EmploymentTypeStatusSchema = z.enum(["confirmed", "inferred"]);

export const EmploymentTypeSchema = z.object({
  value: EmploymentTypeValueSchema.describe(
    "Employment type: full_time, internship, contract, or freelance"
  ),
  status: EmploymentTypeStatusSchema.describe(
    "confirmed if explicitly stated in text, inferred if deduced from title/context or defaulted to full_time"
  ),
});

export const WorkHistoryEntrySchema = z.object({
  entry_id: z
    .string()
    .describe("Unique identifier within candidate profile (e.g. 'work_1'), referenced by skills_demonstrated.source_entry_ref"),
  employer: z
    .string()
    .describe("Company, organization, or employer name"),
  title: z
    .string()
    .describe("Job title or role designation"),
  start_date: z
    .string()
    .describe("Start date formatted as YYYY-MM or YYYY"),
  end_date: z
    .string()
    .nullable()
    .describe("End date formatted as YYYY-MM or YYYY, or null if is_current is true (never string 'present')"),
  is_current: z
    .boolean()
    .default(false)
    .describe("True if currently working in this role, false otherwise"),
  employment_type: EmploymentTypeSchema.describe(
    "Employment type structured as { value, status }"
  ),
  raw_description: z
    .string()
    .describe("Original bullet and narrative text kept verbatim — this is the evidence_span for the entry"),
});

export const WorkHistoryExtractionSchema = z.object({
  entries: z
    .array(WorkHistoryEntrySchema)
    .default([])
    .describe("List of work history and professional experience entries in reverse chronological order"),
});

export type EmploymentTypeValue = z.infer<typeof EmploymentTypeValueSchema>;
export type EmploymentTypeStatus = z.infer<typeof EmploymentTypeStatusSchema>;
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type WorkHistoryEntry = z.infer<typeof WorkHistoryEntrySchema>;
export type WorkHistoryExtraction = z.infer<typeof WorkHistoryExtractionSchema>;

/**
 * Builds the extraction prompt for Work History.
 */
export function buildWorkHistoryPrompt(resumeText: string): string {
  return `Extract each distinct work-history entry from the resume text below in reverse chronological order.
For each entry:
- entry_id: assign a unique identifier within this profile (e.g. 'work_1', 'work_2').
- employer: company or organization name.
- title: job title or role designation.
- start_date: start date formatted as YYYY-MM or YYYY.
- end_date: end date formatted as YYYY-MM or YYYY, or null if currently working here (never return the string "present").
- is_current: true if currently working in this role / ongoing, false otherwise.
- employment_type: an object with:
  * value: 'full_time', 'internship', 'contract', or 'freelance'.
  * status: 'confirmed' if explicitly stated in text (e.g. "Full-time", "Intern"), or 'inferred' if deduced from title (e.g. "Intern") or defaulted to 'full_time'.
- raw_description: original bullet and narrative text kept verbatim — do not summarize, paraphrase, or extract skills here.

Resume text:
${resumeText}`;
}

export const workHistoryAspect = {
  name: "work_history",
  version: "1.0.0",
  schema: WorkHistoryExtractionSchema,
  prompt: buildWorkHistoryPrompt,
} as const;

