import { z } from "zod";

export const WorkHistoryEntrySchema = z.object({
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
    .describe("End date formatted as YYYY-MM, YYYY, or 'present'"),
  employment_type: z
    .enum(["full_time", "internship", "contract", "freelance"])
    .describe("Type of employment; infer internship from title if unambiguous, otherwise default to full_time"),
  raw_description: z
    .string()
    .describe("Original bullet and narrative text kept verbatim without summarizing"),
});

export const WorkHistoryExtractionSchema = z.object({
  entries: z
    .array(WorkHistoryEntrySchema)
    .default([])
    .describe("List of work history and professional experience entries in reverse chronological order"),
});

export type WorkHistoryEntry = z.infer<typeof WorkHistoryEntrySchema>;
export type WorkHistoryExtraction = z.infer<typeof WorkHistoryExtractionSchema>;

/**
 * Builds the extraction prompt for Work History.
 */
export function buildWorkHistoryPrompt(resumeText: string): string {
  return `Extract each distinct work-history entry from the resume text below.
For each entry, capture employer, title, start/end dates, and employment_type. If employment_type is not explicitly stated, infer it only from unambiguous cues (e.g. "Intern" in title = internship); otherwise default to full_time and mark evidence_status as inferred.
Preserve the original bullet text verbatim in raw_description — do not paraphrase or summarize it here. Do not extract skills in this pass — that's a separate, dedicated extraction.

Resume text:
${resumeText}`;
}

export const workHistoryAspect = {
  name: "work_history",
  schema: WorkHistoryExtractionSchema,
  prompt: buildWorkHistoryPrompt,
} as const;
